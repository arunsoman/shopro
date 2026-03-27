import 'package:flutter/services.dart';
import '../../features/order/domain/models/order_models.dart';
import 'receipt_formatter.dart';

class PrinterService {
  static const _channel = MethodChannel('com.shopro.pos/hardware');

  Future<void> printReceipt(OrderTicket order) async {
    try {
      final ReceiptFormatter formatter = ReceiptFormatter();
      final List<Map<String, dynamic>> commands = formatter.formatOrder(order);
      
      await _channel.invokeMethod('printReceipt', {
        'commands': commands,
        'orderNum': order.orderNumber,
      });
    } on PlatformException catch (e) {
      print("Failed to print: ${e.message}");
      rethrow;
    }
  }
}
