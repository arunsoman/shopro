import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shopro_pos_flutter/features/order/domain/models/order_models.dart';
import 'package:shopro_pos_flutter/features/order/domain/repositories/order_repository.dart';

class OrderHistoryState {
  final List<OrderTicket> orders;
  final bool isLoading;
  final String? error;
  final String? searchQuery;
  final DateTime? startDate;
  final DateTime? endDate;

  OrderHistoryState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
    this.searchQuery,
    this.startDate,
    this.endDate,
  });

  OrderHistoryState copyWith({
    List<OrderTicket>? orders,
    bool? isLoading,
    String? error,
    String? searchQuery,
    DateTime? startDate,
    DateTime? endDate,
  }) {
    return OrderHistoryState(
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      searchQuery: searchQuery ?? this.searchQuery,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
    );
  }
}

class OrderHistoryNotifier extends Notifier<OrderHistoryState> {
  @override
  OrderHistoryState build() {
    return OrderHistoryState();
  }

  Future<void> fetchHistory({
    String? orderId,
    String? tableName,
    DateTime? startDate,
    DateTime? endDate,
    String? serverName,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final repository = ref.read(orderRepositoryProvider);
      final orders = await repository.getOrderHistory(
        orderId: orderId,
        tableName: tableName,
        startDate: startDate ?? state.startDate,
        endDate: endDate ?? state.endDate,
        serverName: serverName,
      );
      state = state.copyWith(
        orders: orders,
        isLoading: false,
        startDate: startDate ?? (orderId == null && tableName == null ? null : state.startDate),
        endDate: endDate ?? (orderId == null && tableName == null ? null : state.endDate),
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final orderHistoryProvider = NotifierProvider<OrderHistoryNotifier, OrderHistoryState>(
  OrderHistoryNotifier.new,
);
