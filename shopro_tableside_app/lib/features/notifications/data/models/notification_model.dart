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

  factory InAppNotification.fromJson(Map<String, dynamic> json) {
    return InAppNotification(
      id: json['id'],
      title: json['title'],
      message: json['message'],
      category: json['category'],
      priority: json['priority'],
      isRead: json['isRead'] ?? json['read'] ?? false,
      isDismissed: json['isDismissed'] ?? json['dismissed'] ?? false,
      data: json['data'] != null
          ? Map<String, dynamic>.from(json['data'])
          : null,
      correlationId: json['correlationId'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'category': category,
      'priority': priority,
      'isRead': isRead,
      'isDismissed': isDismissed,
      'data': data,
      'correlationId': correlationId,
      'createdAt': createdAt.toIso8601String(),
    };
  }

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
