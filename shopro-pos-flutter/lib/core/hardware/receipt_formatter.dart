import '../../features/order/domain/models/order_models.dart';
import 'package:intl/intl.dart';

class ReceiptFormatter {
  final DateFormat _df = DateFormat('yyyy-MM-dd HH:mm');

  List<Map<String, dynamic>> formatOrder(OrderTicket order) {
    final List<Map<String, dynamic>> commands = [];

    // Header
    commands.add(_text('SHOPRO POS', isBold: true, isCentered: true));
    commands.add(_text('123 Modern Street, Tech City', isCentered: true));
    commands.add(_text('Tel: +1 (555) 012-3456', isCentered: true));
    commands.add(_divider());

    // Order Info
    commands.add(_text('Order ID: ${order.orderNumber}'));
    commands.add(_text('Table: ${order.tableDisplay ?? order.orderNumber.split("-").last}'));
    commands.add(_text('Server: ${order.serverName}'));
    commands.add(_text('Date: ${_df.format(order.createdAt)}'));
    commands.add(_divider());

    // Items
    for (final item in order.items) {
      if (item.status == OrderItemStatus.voided) continue;
      
      final String qtyAndName = '${item.quantity}x ${item.name}';
      final String price = item.calculatedTotal.toStringAsFixed(2);
      commands.add(_line(qtyAndName, '\$$price'));
      
      if (item.modifiers.isNotEmpty) {
        for (final m in item.modifiers) {
          commands.add(_text('  + ${m.label}', isSmall: true));
        }
      }
    }
    commands.add(_divider());

    // Totals
    commands.add(_line('SUBTOTAL', '\$${order.subtotal.toStringAsFixed(2)}'));
    
    if (order.discountAmount > 0) {
      commands.add(_line('DISCOUNT', '-\$${order.discountAmount.toStringAsFixed(2)}'));
    }

    for (final tax in order.taxSummary.entries) {
      commands.add(_line('TAX (${tax.key})', '\$${tax.value.toStringAsFixed(2)}'));
    }
    
    commands.add(_divider());
    commands.add(_line('TOTAL', '\$${order.totalAmount.toStringAsFixed(2)}', isBold: true));
    
    // Footer
    commands.add(_divider());
    commands.add(_text('THANK YOU FOR VISITING!', isCentered: true));
    commands.add(_text('Visit us at shopro.io', isCentered: true));
    commands.add(_text('\n\n\n')); // Feed space for cut

    // Hardware Cut
    commands.add({'type': 'CUT'});

    return commands;
  }

  Map<String, dynamic> _text(String content, {bool isBold = false, bool isCentered = false, bool isSmall = false}) {
    return {
      'type': 'TEXT',
      'content': content,
      'isBold': isBold,
      'isCentered': isCentered,
      'isSmall': isSmall,
    };
  }

  Map<String, dynamic> _line(String left, String right, {bool isBold = false}) {
    return {
      'type': 'LINE',
      'left': left,
      'right': right,
      'isBold': isBold,
    };
  }

  Map<String, dynamic> _divider() {
    return {'type': 'DIVIDER'};
  }
}
