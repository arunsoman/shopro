import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:shopro_pos_flutter/features/order/domain/models/order_models.dart';
import 'package:shopro_pos_flutter/features/order/domain/repositories/order_repository.dart';
import 'package:shopro_pos_flutter/features/menu/domain/models/menu_models.dart';
import 'package:shopro_pos_flutter/features/menu/presentation/providers/menu_provider.dart';
import 'package:shopro_pos_flutter/features/floor_plan/presentation/providers/floor_plan_provider.dart';
import 'package:shopro_pos_flutter/features/notifications/presentation/providers/notification_provider.dart';
import 'package:shopro_pos_flutter/core/edp/edp_event.dart';
import 'package:shopro_pos_flutter/core/edp/edp_bus.dart';

class OrderState {
  final OrderTicket? activeOrder;
  final List<OrderTicket> allOrders;
  final bool isLoading;
  final String? error;

  OrderState({
    this.activeOrder,
    this.allOrders = const [],
    this.isLoading = false,
    this.error,
  });

  factory OrderState.initial() => OrderState();

  OrderState copyWith({
    OrderTicket? activeOrder,
    List<OrderTicket>? allOrders,
    bool? isLoading,
    String? error,
    bool clearActiveOrder = false,
  }) {
    return OrderState(
      activeOrder: clearActiveOrder ? null : (activeOrder ?? this.activeOrder),
      allOrders: allOrders ?? this.allOrders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class OrderNotifier extends Notifier<OrderState> {
  void Function()? _unsub;
  void Function()? _globalUnsub;
  Timer? _globalRefreshTimer;
  Timer? _activeOrderRefreshTimer;
  final Set<int> _processedEventIds = {};
  static const int _maxEventBufferSize = 20;

  @override
  OrderState build() {
    ref.onDispose(() {
      _unsub?.call();
      _globalUnsub?.call();
      _globalRefreshTimer?.cancel();
      _activeOrderRefreshTimer?.cancel();
    });

    // Subscribe to global order updates to keep allOrders in sync
    _subscribeToGlobalOrders();

    return OrderState.initial();
  }

  void setActiveOrder(OrderTicket order) {
    state = state.copyWith(activeOrder: order);
    _subscribeToOrder(order.id);
  }

  void _subscribeToGlobalOrders() {
    _globalUnsub?.call();
    _globalUnsub = null;

    final notificationState = ref.read(notificationProvider);
    if (!notificationState.isConnected) {
      _listenForGlobalConnection();
      return;
    }

    final stompClient = ref.read(notificationProvider.notifier).stompClient;
    if (stompClient != null) {
      final unsubscribe = stompClient.subscribe(
        destination: '/topic/orders',
        callback: (frame) {
          // Optimization: Use debouncing to avoid API flood on multiple rapid updates
          _debouncedFetchActiveOrders();
        },
      );
      _globalUnsub = unsubscribe;
    }
  }

  void _debouncedFetchActiveOrders() {
    _globalRefreshTimer?.cancel();
    _globalRefreshTimer = Timer(const Duration(milliseconds: 500), () {
      fetchActiveOrders();
    });
  }

  void _debouncedLoadOrder(String orderId) {
    _activeOrderRefreshTimer?.cancel();
    _activeOrderRefreshTimer = Timer(const Duration(milliseconds: 500), () {
      loadOrder(orderId);
    });
  }

  void _listenForGlobalConnection() {
    ref.listen(notificationProvider, (previous, next) {
      if (next.isConnected && (previous == null || !previous.isConnected)) {
        _subscribeToGlobalOrders();
      }
    });
  }

  void _subscribeToOrder(String orderId) {
    _unsub?.call();
    _unsub = null;

    final notificationState = ref.read(notificationProvider);
    if (!notificationState.isConnected) {
      // If not connected, we wait for connection in ref.listen
      _listenForConnection();
      return;
    }

    final stompClient = ref.read(notificationProvider.notifier).stompClient;
    if (stompClient != null) {
      final unsubscribe = stompClient.subscribe(
        destination: '/topic/orders/$orderId',
        callback: (frame) {
          if (frame.body != null) {
            try {
              _handleOrderUpdate(json.decode(frame.body!));
            } catch (e) {
              debugPrint('Error handling order update: $e');
            }
          }
        },
      );
      _unsub = unsubscribe;
    }
  }

  void _listenForConnection() {
    // This will be called if we tried to subscribe while disconnected
    ref.listen(notificationProvider, (previous, next) {
      if (next.isConnected && (previous == null || !previous.isConnected)) {
        if (state.activeOrder != null) {
          _subscribeToOrder(state.activeOrder!.id);
        }
      }
    });
  }

  void _handleOrderUpdate(Map<String, dynamic> data) {
    debugPrint('[OrderWatcher] Received update: $data');
    
    // Deduplication check: Don't process the same event ID twice
    if (data.containsKey('id')) {
      final seqId = data['id'] is int ? data['id'] as int : int.tryParse(data['id'].toString());
      if (seqId != null) {
        if (_processedEventIds.contains(seqId)) {
          debugPrint('[OrderWatcher] Skipping already processed event: $seqId');
          return;
        }
        
        // Add to buffer and prune old entries
        _processedEventIds.add(seqId);
        if (_processedEventIds.length > _maxEventBufferSize) {
          _processedEventIds.remove(_processedEventIds.first);
        }
      }
    }

    // Optimization: Check if the message contains the full order payload
    // To avoid an extra GET request if the data is already here.
    try {
      if (data.containsKey('id') && data.containsKey('status') && data.containsKey('items')) {
        final updatedOrder = OrderTicket.fromJson(data);
        state = state.copyWith(activeOrder: updatedOrder, isLoading: false);
        return;
      }
    } catch (e) {
      debugPrint('[OrderWatcher] Error parsing inline order: $e');
    }

    String? orderId;
    // Handle EDP EventStore format (event + payload)
    if (data.containsKey('eventType') && data.containsKey('payload')) {
      final payload = data['payload'] as Map<String, dynamic>;
      orderId = payload['orderId']?.toString();
    }

    final finalOrderId = orderId ?? state.activeOrder?.id;
    if (finalOrderId != null) {
      // If we couldn't parse the order directly, we load it.
      // Optimization: Debounce specific order fetches from WebSocket events
      // to avoid API flood on multiple unit updates (e.g. KDS bump).
      if (finalOrderId == state.activeOrder?.id) {
        _debouncedLoadOrder(finalOrderId);
      }
    }
  }

  Future<void> loadOrder(String orderId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final repository = ref.read(orderRepositoryProvider);
      final order = await repository.getOrder(orderId);
      state = state.copyWith(activeOrder: order, isLoading: false);
    } on DioException catch (e) {
      final data = e.response?.data;
      String errorMessage = e.message ?? e.toString();
      if (data is Map && data.containsKey('message')) {
        errorMessage = data['message'];
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> fireCourse(int courseNumber) async {
    if (state.activeOrder == null) return;

    state = state.copyWith(isLoading: true);
    try {
      final edpBus = ref.read(edpBusProvider);
      
      // In a real scenario, we would loop through items in this course. 
      // For this pilot, we'll send a signal for the course fire.
      final itemsInCourse = state.activeOrder!.items
          .where((i) => i.courseNumber == courseNumber && i.status == OrderItemStatus.held);

      for (final item in itemsInCourse) {
        await edpBus.publish(EdpEvent.orderFire(
          orderId: state.activeOrder!.id,
          orderItemId: item.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        ));
      }

      state = state.copyWith(isLoading: false);
      // We don't need to manually reload; the WebSocketRelayConsumer will broadcast the update.
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> createOrder({
    required String tableId,
    required int guestCount,
    required OrderType orderType,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final repository = ref.read(orderRepositoryProvider);
      final order = await repository.createOrder(
        tableId: tableId,
        guestCount: guestCount,
        orderType: orderType,
      );
      state = state.copyWith(activeOrder: order, isLoading: false);
    } on DioException catch (e) {
      final data = e.response?.data;
      String errorMessage = e.message ?? e.toString();
      if (data is Map && data.containsKey('message')) {
        errorMessage = data['message'];
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addItem(
    MenuItem item, {
    int quantity = 1,
    String? customNote,
    bool hasAllergyFlag = false,
    int? courseNumber,
    List<String> subtractions = const [],
    List<ModifierOption> modifiers = const [],
  }) async {
    if (state.activeOrder == null) {
      state = state.copyWith(error: 'No active order to add items to.');
      return;
    }

    // Auto-coursing logic
    int finalCourse = courseNumber ?? 1;
    if (courseNumber == null) {
      final menuState = ref.read(menuProvider);
      final category = menuState.categories.firstWhere(
        (c) => c.id == item.categoryId,
        orElse: () => MenuCategory(id: '', name: '', defaultCourse: 1),
      );
      finalCourse = category.defaultCourse;
    }

    final combinedNotes = [
      if (customNote != null && customNote.isNotEmpty) customNote,
      ...subtractions.map(
        (s) => s.toUpperCase().replaceAll('NO ', '- '),
      ), // Format nicely
    ].join(' | ');

    state = state.copyWith(isLoading: true);
    try {
      final repository = ref.read(orderRepositoryProvider);

      final payload = {
        'menuItemId': item.id,
        'quantity': quantity,
        'customNote': combinedNotes.isEmpty ? null : combinedNotes,
        'hasAllergyFlag': hasAllergyFlag,
        'courseNumber': finalCourse,
        'modifierOptionIds': modifiers.map((o) => o.id).toList(),
      };
      debugPrint('Sending payload to addOrderItem: $payload');

      final updatedOrder = await repository.addOrderItem(
        state.activeOrder!.id,
        payload,
      );
      debugPrint('Item added successfully. Updated order: ${updatedOrder.id}');
      state = state.copyWith(activeOrder: updatedOrder, isLoading: false);
    } on DioException catch (e, stackTrace) {
      debugPrint('ERROR ADDING ITEM: $e');
      debugPrint(stackTrace.toString());
      final data = e.response?.data;
      String errorMessage = e.message ?? e.toString();
      if (data is Map && data.containsKey('message')) {
        errorMessage = data['message'];

        // Intercept missing tax rule error for staff users (provide helpful context)
        if (errorMessage.contains('No applicable tax rule found for item')) {
          errorMessage = 'Could not add to cart because no tax rules could be found. '
              'Please inform the admin user.';
        }
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
    } catch (e, stackTrace) {
      debugPrint('ERROR ADDING ITEM: $e');
      debugPrint(stackTrace.toString());
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Map<int, List<OrderItem>> get itemsByCourse {
    if (state.activeOrder == null) return {};
    final map = <int, List<OrderItem>>{};
    for (final item in state.activeOrder!.items) {
      map.putIfAbsent(item.courseNumber, () => []).add(item);
    }
    return map;
  }

  Future<void> updateItemQuantity(String itemId, int newQuantity) async {
    if (state.activeOrder == null) return;

    state = state.copyWith(isLoading: true);
    try {
      final repository = ref.read(orderRepositoryProvider);
      final updatedOrder = await repository.updateOrderItem(
        state.activeOrder!.id,
        itemId,
        {'quantity': newQuantity},
      );
      state = state.copyWith(activeOrder: updatedOrder, isLoading: false);
    } on DioException catch (e) {
      final data = e.response?.data;
      String errorMessage = e.message ?? e.toString();
      if (data is Map && data.containsKey('message')) {
        errorMessage = data['message'];
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> submitOrder() async {
    if (state.activeOrder == null) return;
    state = state.copyWith(isLoading: true);
    try {
      final repository = ref.read(orderRepositoryProvider);
      final idempotencyKey =
          'order-${state.activeOrder!.id}-${DateTime.now().millisecondsSinceEpoch}';
      final updatedOrder = await repository.sendToKitchen(
        state.activeOrder!.id,
        idempotencyKey: idempotencyKey,
      );
      state = state.copyWith(activeOrder: updatedOrder, isLoading: false);

      // Optimistic Table State Update: OCCUPIED -> ORDERED
      if (state.activeOrder?.tableId != null) {
        ref.read(floorPlanProvider.notifier).refresh(); // Real sync
      }
      
      // Refresh active orders list
      fetchActiveOrders();
    } on DioException catch (e) {
      final data = e.response?.data;
      String errorMessage = e.message ?? e.toString();
      if (data is Map && data.containsKey('message')) {
        errorMessage = data['message'];
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }


  Future<void> fetchActiveOrders() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final repository = ref.read(orderRepositoryProvider);
      final orders = await repository.getActiveOrders();
      state = state.copyWith(allOrders: orders, isLoading: false);
    } on DioException catch (e) {
      final data = e.response?.data;
      String errorMessage = e.message ?? e.toString();
      if (data is Map && data.containsKey('message')) {
        errorMessage = data['message'];
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> markAsServed(String orderId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final repository = ref.read(orderRepositoryProvider);
      await repository.markAsServed(orderId);
      await fetchActiveOrders(); // Refresh the list
    } on DioException catch (e) {
      final data = e.response?.data;
      String errorMessage = e.message ?? e.toString();
      if (data is Map && data.containsKey('message')) {
        errorMessage = data['message'];
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> cancelOrder({String? managerPin}) async {
    if (state.activeOrder == null) return;
    state = state.copyWith(isLoading: true, error: null);
    try {
      final repository = ref.read(orderRepositoryProvider);
      final updatedOrder = await repository.cancelOrder(
        state.activeOrder!.id,
        managerPin: managerPin,
      );
      state = state.copyWith(activeOrder: updatedOrder, isLoading: false);
      fetchActiveOrders();
    } on DioException catch (e) {
      final data = e.response?.data;
      String errorMessage = 'Server error during cancellation';
      if (data is Map && data.containsKey('message')) {
        errorMessage = data['message'];
      } else if (e.message != null) {
        errorMessage = e.message!;
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
      rethrow;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      rethrow;
    }
  }

  Future<void> voidOrderItem(String itemId, String reason, {String? managerPin}) async {
    if (state.activeOrder == null) return;
    state = state.copyWith(isLoading: true, error: null);
    try {
      final repository = ref.read(orderRepositoryProvider);
      final updatedOrder = await repository.voidOrderItem(
        state.activeOrder!.id,
        itemId,
        reason,
        managerPin: managerPin,
      );
      state = state.copyWith(activeOrder: updatedOrder, isLoading: false);
    } on DioException catch (e) {
      final data = e.response?.data;
      String errorMessage = e.message ?? e.toString();
      if (data is Map && data.containsKey('message')) {
        errorMessage = data['message'];
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
      rethrow;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      rethrow;
    }
  }

  void clearActiveOrder() {
    _unsub?.call();
    _unsub = null;
    state = state.copyWith(clearActiveOrder: true);
    fetchActiveOrders(); // Immediately refresh the orders list
  }

  Future<void> completePayment(PaymentMethod method) async {
    if (state.activeOrder == null) return;
    final orderId = state.activeOrder!.id;
    final amount = state.activeOrder!.totalAmount;

    state = state.copyWith(isLoading: true, error: null);
    try {
      final repository = ref.read(orderRepositoryProvider);
      await repository.completePayment(orderId, method, amount);
      // Refresh the orders list to ensure the paid order is gone
      await fetchActiveOrders();
      state = state.copyWith(isLoading: false);
    } on DioException catch (e) {
      final data = e.response?.data;
      String errorMessage = e.message ?? e.toString();
      if (data is Map && data.containsKey('message')) {
        errorMessage = data['message'];
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
      rethrow;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      rethrow;
    }
  }
}

final orderProvider = NotifierProvider<OrderNotifier, OrderState>(
  OrderNotifier.new,
);
