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
      default:
        return state;
    }
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
