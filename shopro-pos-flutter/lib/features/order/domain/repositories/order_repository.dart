import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shopro_pos_flutter/features/order/domain/models/order_models.dart';
import 'package:shopro_pos_flutter/core/network/api_client.dart';

abstract class OrderRepository {
  Future<OrderTicket> getOrder(String orderId);
  Future<List<OrderTicket>> getActiveOrders();
  Future<OrderTicket> fireCourse(String orderId, int courseNumber);
  Future<OrderTicket> sendToKitchen(String orderId, {String? idempotencyKey});
  Future<OrderTicket> createOrder({
    required String tableId,
    required int guestCount,
    required OrderType orderType,
  });
  Future<void> cancelOrder(String orderId);
  Future<OrderTicket> voidOrderItem(
    String orderId,
    String itemId,
    String reason,
  );
  Future<OrderTicket> addOrderItem(
    String orderId,
    Map<String, dynamic> itemData,
  );
  Future<OrderTicket> updateOrderItem(
    String orderId,
    String itemId,
    Map<String, dynamic> itemData,
  );
  Future<List<OrderTicket>> getOrderHistory({
    String? orderId,
    String? tableName,
    DateTime? startDate,
    DateTime? endDate,
    String? serverName,
  });
  Future<void> initiateMiPay(String orderId, String phoneNumber);
  Future<OrderTicket> markAsServed(String orderId);
}

class OrderRepositoryImpl implements OrderRepository {
  final ApiClient _apiClient;

  OrderRepositoryImpl(this._apiClient);

  @override
  Future<OrderTicket> getOrder(String orderId) async {
    final response = await _apiClient.get('/orders/$orderId');
    return OrderTicket.fromJson(response.data);
  }

  @override
  Future<List<OrderTicket>> getActiveOrders() async {
    final response = await _apiClient.get('/orders/active');
    final List data = response.data;
    return data.map((json) => OrderTicket.fromJson(json)).toList();
  }

  @override
  Future<OrderTicket> fireCourse(String orderId, int courseNumber) async {
    final response = await _apiClient.post(
      '/orders/$orderId/courses/$courseNumber/fire',
    );
    return OrderTicket.fromJson(response.data);
  }

  @override
  Future<OrderTicket> sendToKitchen(
    String orderId, {
    String? idempotencyKey,
  }) async {
    final response = await _apiClient.post(
      '/orders/$orderId/send',
      queryParameters: idempotencyKey != null
          ? {'idempotencyKey': idempotencyKey}
          : null,
    );
    return OrderTicket.fromJson(response.data);
  }

  @override
  Future<OrderTicket> createOrder({
    required String tableId,
    required int guestCount,
    required OrderType orderType,
  }) async {
    final response = await _apiClient.post(
      '/orders',
      data: {
        'tableId': tableId,
        'coverCount': guestCount,
        'orderType': orderType.jsonValue,
      },
    );
    return OrderTicket.fromJson(response.data);
  }

  @override
  Future<void> cancelOrder(String orderId) async {
    await _apiClient.post('/orders/$orderId/cancel');
  }

  @override
  Future<OrderTicket> voidOrderItem(
    String orderId,
    String itemId,
    String reason,
  ) async {
    final response = await _apiClient.post(
      '/orders/$orderId/items/$itemId/void',
      data: {'reason': reason},
    );
    return OrderTicket.fromJson(response.data);
  }

  @override
  Future<OrderTicket> addOrderItem(
    String orderId,
    Map<String, dynamic> itemData,
  ) async {
    final response = await _apiClient.post(
      '/orders/$orderId/items',
      data: itemData,
    );
    return OrderTicket.fromJson(response.data);
  }

  @override
  Future<OrderTicket> updateOrderItem(
    String orderId,
    String itemId,
    Map<String, dynamic> itemData,
  ) async {
    final response = await _apiClient.patch(
      '/orders/$orderId/items/$itemId',
      data: itemData,
    );
    return OrderTicket.fromJson(response.data);
  }

  @override
  Future<List<OrderTicket>> getOrderHistory({
    String? orderId,
    String? tableName,
    DateTime? startDate,
    DateTime? endDate,
    String? serverName,
  }) async {
    final queryParams = <String, dynamic>{};
    if (orderId != null) {
      queryParams['orderId'] = orderId;
    }
    if (tableName != null) {
      queryParams['tableName'] = tableName;
    }
    if (startDate != null) {
      queryParams['startDate'] = startDate.toIso8601String();
    }
    if (endDate != null) {
      queryParams['endDate'] = endDate.toIso8601String();
    }
    if (serverName != null) {
      queryParams['serverName'] = serverName;
    }

    final response = await _apiClient.get(
      '/orders/history',
      queryParameters: queryParams,
    );
    final List data = response.data;
    return data.map((json) => OrderTicket.fromJson(json)).toList();
  }

  @override
  Future<void> initiateMiPay(String orderId, String phoneNumber) async {
    await _apiClient.post(
      '/payments/mipay/initiate',
      data: {'orderId': orderId, 'phoneNumber': phoneNumber},
    );
  }

  @override
  Future<OrderTicket> markAsServed(String orderId) async {
    final response = await _apiClient.post('/orders/$orderId/serve');
    return OrderTicket.fromJson(response.data);
  }
}

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  return OrderRepositoryImpl(apiClient);
});
