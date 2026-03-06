import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:shopro_tableside_app/features/menu/domain/models/menu_models.dart';
import 'package:shopro_tableside_app/features/session/presentation/providers/session_providers.dart';

final dioProvider = Provider<Dio>((ref) {
  // Use a relative path so all API calls go through the same host
  // the proxy (proxy.js) then routes /api/* to Spring Boot on port 8080.
  // This completely eliminates CORS issues on mobile.
  const apiBase = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '/api/v1',
  );

  final dio = Dio(
    BaseOptions(
      baseUrl: apiBase,
      headers: {'Content-Type': 'application/json'},
      connectTimeout: const Duration(seconds: 8),
      receiveTimeout: const Duration(seconds: 8),
    ),
  );

  dio.interceptors.add(
    LogInterceptor(
      requestBody: true,
      responseBody: true,
      error: true,
      logPrint: (obj) => debugPrint(obj.toString()),
    ),
  );

  return dio;
});

final categoriesProvider = FutureProvider<List<MenuCategory>>((ref) async {
  try {
    final dio = ref.watch(dioProvider);
    debugPrint(
      'Fetching categories from ${dio.options.baseUrl}/menu/categories',
    );
    final response = await dio.get('/tableside/menu/categories');
    debugPrint('Categories response: ${response.data}');
    return (response.data as List)
        .map((e) => MenuCategory.fromJson(e))
        .toList();
  } catch (e, stack) {
    debugPrint('Error fetching categories: $e');
    debugPrint('Stack trace: $stack');
    rethrow;
  }
});

final menuItemsProvider = FutureProvider.family<List<MenuItem>, String>((
  ref,
  categoryId,
) async {
  try {
    final dio = ref.watch(dioProvider);
    debugPrint(
      'Fetching items for category $categoryId from ${dio.options.baseUrl}/tableside/menu/items',
    );
    final response = await dio.get(
      '/tableside/menu/items',
      queryParameters: {'categoryId': categoryId},
    );
    debugPrint('Items response: ${response.data}');
    return (response.data as List).map((e) => MenuItem.fromJson(e)).toList();
  } catch (e, stack) {
    debugPrint('Error fetching items: $e');
    debugPrint('Stack trace: $stack');
    rethrow;
  }
});

class CartItem {
  final MenuItem menuItem;
  int quantity;
  String? note;
  List<ModifierOption> selectedModifiers;

  CartItem({
    required this.menuItem,
    this.quantity = 1,
    this.note,
    this.selectedModifiers = const [],
  });

  double get total =>
      (menuItem.basePrice +
          selectedModifiers.fold(0.0, (sum, m) => sum + m.upchargeAmount)) *
      quantity;
}

class CartNotifier extends Notifier<List<CartItem>> {
  @override
  List<CartItem> build() => [];

  void addItem(
    MenuItem item, {
    int quantity = 1,
    List<ModifierOption> modifiers = const [],
  }) {
    final existingIndex = state.indexWhere((i) => i.menuItem.id == item.id);
    if (existingIndex != -1) {
      final newState = List<CartItem>.from(state);
      newState[existingIndex].quantity += quantity;
      state = newState;
    } else {
      state = [
        ...state,
        CartItem(
          menuItem: item,
          quantity: quantity,
          selectedModifiers: modifiers,
        ),
      ];
    }
  }

  void removeItem(String itemId) {
    state = state.where((item) => item.menuItem.id != itemId).toList();
  }

  double get subtotal => state.fold(0.0, (sum, item) => sum + item.total);

  /// Returns the orderTicketId (UUID) from the backend.
  Future<String?> submitOrder() async {
    final sessionId = ref.read(sessionProvider).sessionId;
    if (sessionId == null) {
      throw StateError(
        'No active session. Please restart from the landing page.',
      );
    }

    final dio = ref.read(dioProvider);

    for (final item in state) {
      await dio.post(
        '/tableside/$sessionId/cart',
        data: {
          'menuItemId': item.menuItem.id,
          'quantity': item.quantity,
          'customNote': item.note,
          'modifiers': item.selectedModifiers
              .map((m) => {'id': m.id, 'label': m.label})
              .toList(),
        },
        options: Options(headers: {'X-Device-Fingerprint': 'guest-device-1'}),
      );
    }

    final response = await dio.post('/tableside/$sessionId/submit');
    state = [];
    return response.data as String?;
  }
}

final cartProvider = NotifierProvider<CartNotifier, List<CartItem>>(() {
  return CartNotifier();
});
