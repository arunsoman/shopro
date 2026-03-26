import 'package:meta/meta.dart';

@immutable
class EdpEvent {
  final String type;
  final Map<String, dynamic> payload;
  final DateTime occurredAt;
  final int? seqId; // Backend-assigned id

  EdpEvent({
    required this.type,
    required this.payload,
    DateTime? occurredAt,
    this.seqId,
  }) : occurredAt = occurredAt ?? DateTime.now();

  // Named constructors for type safety (Common events)
  
  factory EdpEvent.orderFire({
    required String orderId,
    required String orderItemId,
    required String menuItemId,
    required int quantity,
  }) {
    return EdpEvent(
      type: 'order.fire',
      payload: {
        'orderId': orderId,
        'orderItemId': orderItemId,
        'menuItemId': menuItemId,
        'quantity': quantity,
      },
    );
  }

  factory EdpEvent.itemStatusChanged({
    required String ticketItemId,
    required String status,
  }) {
    return EdpEvent(
      type: 'kds.item.status_changed',
      payload: {
        'ticketItemId': ticketItemId,
        'status': status,
      },
    );
  }

  Map<String, dynamic> toJson() => {
        'eventType': type,
        'payload': payload,
        'occurredAt': occurredAt.toIso8601String(),
        if (seqId != null) 'id': seqId,
      };

  factory EdpEvent.fromJson(Map<String, dynamic> json) {
    return EdpEvent(
      type: json['eventType'] ?? json['eventType'] ?? 'unknown',
      payload: json['payload'] is Map ? Map<String, dynamic>.from(json['payload']) : {},
      occurredAt: json['timestamp'] != null 
          ? DateTime.parse(json['timestamp']) 
          : DateTime.now(),
      seqId: json['id'],
    );
  }

  @override
  String toString() => 'EdpEvent(type: $type, seqId: $seqId)';
}
