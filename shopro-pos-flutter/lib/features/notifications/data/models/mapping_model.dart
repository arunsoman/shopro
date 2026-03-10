class NotificationRecipientMapping {
  final String id;
  final String notificationType;
  final String recipientType;
  final String recipientId;

  NotificationRecipientMapping({
    required this.id,
    required this.notificationType,
    required this.recipientType,
    required this.recipientId,
  });

  factory NotificationRecipientMapping.fromMap(Map<String, dynamic> map) {
    return NotificationRecipientMapping(
      id: map['id'],
      notificationType: map['notification_type'] ?? map['notificationType'],
      recipientType: map['recipient_type'] ?? map['recipientType'],
      recipientId: map['recipient_id'] ?? map['recipientId'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'notificationType': notificationType,
      'recipientType': recipientType,
      'recipientId': recipientId,
    };
  }
}
