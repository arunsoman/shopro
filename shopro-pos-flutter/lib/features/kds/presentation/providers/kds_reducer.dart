import '../../domain/models/kds_models.dart';
import '../../../../core/edp/edp_event.dart';
import '../../../../core/edp/edp_reducer.dart';
import '../providers/kds_provider.dart';

class KdsReducer extends EdpReducer<KDSState> {
  @override
  KDSState reduce(KDSState state, EdpEvent event) {
    switch (event.type) {
      case 'kds.item.status_changed':
        return _handleItemStatusChanged(state, event);
      case 'order.item_decrement':
        return _handleOrderItemDecrement(state, event);
      default:
        return state;
    }
  }

  KDSState _handleOrderItemDecrement(KDSState state, EdpEvent event) {
    final payload = event.payload;
    final orderItemId = payload['orderItemId']?.toString();
    final unitIndex = payload['unitIndex'] as int?;

    if (orderItemId == null || unitIndex == null) return state;

    // Remove the specific unit from tickets
    final updatedTickets = state.tickets.map((ticket) {
      final filteredItems = ticket.items.where((item) {
        // Match the specific order row (orderItemId) and the specific unit index
        return !(item.orderItemId == orderItemId && item.unitIndex == unitIndex);
      }).toList();

      if (filteredItems.length == ticket.items.length) return ticket;
      return ticket.copyWith(items: filteredItems);
    }).where((ticket) => ticket.items.isNotEmpty).toList();

    return state.copyWith(tickets: updatedTickets);
  }

  KDSState _handleItemStatusChanged(KDSState state, EdpEvent event) {
    final payload = event.payload;
    final itemId = payload['ticketItemId'] as String?;
    final statusStr = payload['status'] as String?;
    
    if (itemId == null || statusStr == null) return state;

    // Convert string to enum
    final newStatus = KDSItemStatus.values.firstWhere(
      (e) => e.name.toLowerCase() == statusStr.toLowerCase(),
      orElse: () => KDSItemStatus.pending,
    );

    final updatedTickets = state.tickets.map((ticket) {
      final updatedItems = ticket.items.map((item) {
        if (item.id == itemId) {
          return item.copyWith(status: newStatus);
        }
        return item;
      }).toList();
      return ticket.copyWith(items: updatedItems);
    }).toList();

    return state.copyWith(tickets: updatedTickets);
  }
}
