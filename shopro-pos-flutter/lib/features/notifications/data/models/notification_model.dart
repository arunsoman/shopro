import 'dart:convert';

class InAppNotification {
  final String id;
  final String title;
  final String message;
  final String category;
  final String priority;
  final bool isRead;
  final bool isDismissed;
  final Map<String, dynamic>? data;
  final String? correlationId;
  final DateTime createdAt;

  InAppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.category,
    required this.priority,
    required this.isRead,
    required this.isDismissed,
    this.data,
    this.correlationId,
    required this.createdAt,
  });

  factory InAppNotification.fromMap(Map<String, dynamic> map) {
    return InAppNotification(
      id: map['id'],
      title: map['title'] ?? '',
      message: map['message'] ?? map['body'] ?? '',
      category: map['category'] ?? map['typeCode'] ?? 'GENERAL',
      priority: map['priority'] ?? 'MEDIUM',
      isRead: map['is_read'] ?? map['read'] ?? map['isRead'] ?? false,
      isDismissed: map['is_dismissed'] ?? map['dismissed'] ?? map['isDismissed'] ?? false,
      data: map['data'] != null ? Map<String, dynamic>.from(map['data']) : null,
      correlationId: map['correlation_id'] ?? map['correlationId'],
      createdAt: DateTime.parse(map['created_at'] ?? map['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  factory InAppNotification.fromJson(String source) =>
      InAppNotification.fromMap(json.decode(source));

  InAppNotification copyWith({bool? isRead, bool? isDismissed}) {
    return InAppNotification(
      id: id,
      title: title,
      message: message,
      category: category,
      priority: priority,
      isRead: isRead ?? this.isRead,
      isDismissed: isDismissed ?? this.isDismissed,
      data: data,
      correlationId: correlationId,
      createdAt: createdAt,
    );
  }
}
