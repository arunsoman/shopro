import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shopro_pos_flutter/features/order/domain/models/order_models.dart';
import 'package:shopro_pos_flutter/features/order/domain/repositories/order_repository.dart';
import 'package:shopro_pos_flutter/features/menu/domain/models/menu_models.dart';
import 'package:shopro_pos_flutter/features/menu/presentation/providers/menu_provider.dart';
import 'package:shopro_pos_flutter/features/floor_plan/presentation/providers/floor_plan_provider.dart';

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
  }) {
    return OrderState(
      activeOrder: activeOrder ?? this.activeOrder,
      allOrders: allOrders ?? this.allOrders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class OrderNotifier extends Notifier<OrderState> {
  @override
  OrderState build() => OrderState.initial();

  void setActiveOrder(OrderTicket order) {
    state = state.copyWith(activeOrder: order);
  }

  Future<void> loadOrder(String orderId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final repository = ref.read(orderRepositoryProvider);
      final order = await repository.getOrder(orderId);
      state = state.copyWith(activeOrder: order, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> fireCourse(int courseNumber) async {
    if (state.activeOrder == null) return;

    state = state.copyWith(isLoading: true);
    try {
      final repository = ref.read(orderRepositoryProvider);
      final updatedOrder = await repository.fireCourse(
        state.activeOrder!.id,
        courseNumber,
      );
      state = state.copyWith(activeOrder: updatedOrder, isLoading: false);
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
      print('Sending payload to addOrderItem: $payload');

      final updatedOrder = await repository.addOrderItem(
        state.activeOrder!.id,
        payload,
      );
      print('Item added successfully. Updated order: ${updatedOrder.id}');
      state = state.copyWith(activeOrder: updatedOrder, isLoading: false);
    } catch (e, stackTrace) {
      print('ERROR ADDING ITEM: $e');
      print(stackTrace);
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
    if (newQuantity <= 0) {
      // Potentially void item logic here
      return;
    }

    state = state.copyWith(isLoading: true);
    try {
      final repository = ref.read(orderRepositoryProvider);
      final updatedOrder = await repository.updateOrderItem(
        state.activeOrder!.id,
        itemId,
        {'quantity': newQuantity},
      );
      state = state.copyWith(activeOrder: updatedOrder, isLoading: false);
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
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> cancelOrder(String orderId) async {
    state = state.copyWith(isLoading: true);
    try {
      final repository = ref.read(orderRepositoryProvider);
      await repository.cancelOrder(orderId);
      state = state.copyWith(activeOrder: null, isLoading: false);
      ref.read(floorPlanProvider.notifier).refresh();
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> voidOrderItem(String itemId, String reason) async {
    if (state.activeOrder == null) return;
    state = state.copyWith(isLoading: true);
    try {
      final repository = ref.read(orderRepositoryProvider);
      final updatedOrder = await repository.voidOrderItem(
        state.activeOrder!.id,
        itemId,
        reason,
      );
      state = state.copyWith(activeOrder: updatedOrder, isLoading: false);
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
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final orderProvider = NotifierProvider<OrderNotifier, OrderState>(
  OrderNotifier.new,
);
