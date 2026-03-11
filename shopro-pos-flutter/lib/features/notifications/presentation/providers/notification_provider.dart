import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import 'package:http/http.dart' as http;
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/models/notification_model.dart';

class NotificationState {
  final List<InAppNotification> notifications;
  final bool isConnected;

  NotificationState({required this.notifications, this.isConnected = false});

  NotificationState copyWith({
    List<InAppNotification>? notifications,
    bool? isConnected,
  }) {
    return NotificationState(
      notifications: notifications ?? this.notifications,
      isConnected: isConnected ?? this.isConnected,
    );
  }
}

class NotificationNotifier extends StateNotifier<NotificationState> {
  StompClient? _stompClient;
  final Ref _ref;

  NotificationNotifier(this._ref)
    : super(NotificationState(notifications: [])) {
    _init();
  }

  void _init() {
    final auth = _ref.watch(authProvider);
    if (auth.isAuthenticated) {
      _fetchHistory(auth.staffId!);
      _connect(auth.staffId!, auth.role!);
    } else {
      _disconnect();
    }
  }

  Future<void> _fetchHistory(String userId) async {
    try {
      // Assuming a global HTTP client or using a base URL constant
      final response = await http.get(
        Uri.parse('http://localhost:8080/api/v1/notifications?userId=$userId&page=0&size=50'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        final List<dynamic> content = data['content'] ?? [];
        final List<InAppNotification> history = content
            .map((json) => InAppNotification.fromMap(json))
            .toList();
        
        state = state.copyWith(notifications: history);
      }
    } catch (e) {
      print('Failed to fetch notification history: $e');
    }
  }

  void _connect(String userId, String role) {
    _stompClient = StompClient(
      config: StompConfig(
        url: 'ws://localhost:8080/ws-raw',
        onConnect: (frame) {
          state = state.copyWith(isConnected: true);

          // Subscribe to User-specific notifications
          _stompClient?.subscribe(
            destination: '/user/queue/notifications',
            callback: (frame) {
              if (frame.body != null) {
                _onNotificationReceived(
                  InAppNotification.fromJson(frame.body!),
                );
              }
            },
          );

          // Subscribe to Role-specific notifications
          _stompClient?.subscribe(
            destination: '/topic/role/$role/notifications',
            callback: (frame) {
              if (frame.body != null) {
                _onNotificationReceived(
                  InAppNotification.fromJson(frame.body!),
                );
              }
            },
          );

          // Subscribe to Sync commands (Read/Dismissed on other devices)
          _stompClient?.subscribe(
            destination: '/user/queue/notifications/sync',
            callback: (frame) {
              if (frame.body != null) {
                _onSyncReceived(json.decode(frame.body!));
              }
            },
          );

          // Subscribe to Recall commands (System-wide)
          _stompClient?.subscribe(
            destination: '/topic/notifications/recall',
            callback: (frame) {
              if (frame.body != null) {
                _onRecallReceived(json.decode(frame.body!));
              }
            },
          );
        },
        onWebSocketError: (error) => state = state.copyWith(isConnected: false),
        onStompError: (frame) => state = state.copyWith(isConnected: false),
        onDisconnect: (frame) => state = state.copyWith(isConnected: false),
      ),
    );
    _stompClient?.activate();
  }

  void _onNotificationReceived(InAppNotification notification) {
    // Avoid duplicates if history was just fetched
    if (state.notifications.any((n) => n.id == notification.id)) return;

    state = state.copyWith(
      notifications: [notification, ...state.notifications],
    );
  }

  void _onSyncReceived(Map<String, dynamic> syncData) {
    final id = syncData['id'];
    final action = syncData['action'];

    state = state.copyWith(
      notifications: state.notifications
          .map((n) {
            if (n.id == id) {
              if (action == 'READ') return n.copyWith(isRead: true);
              if (action == 'DISMISSED') return n.copyWith(isDismissed: true);
            }
            return n;
          })
          .where((n) => !n.isDismissed)
          .toList(),
    );
  }

  void _onRecallReceived(Map<String, dynamic> recallData) {
    final correlationId = recallData['correlationId'];
    state = state.copyWith(
      notifications: state.notifications
          .where((n) => n.correlationId != correlationId)
          .toList(),
    );
  }

  void _disconnect() {
    _stompClient?.deactivate();
    state = NotificationState(notifications: [], isConnected: false);
  }

  Future<void> markAsRead(String id) async {
    // Optimistic UI update
    state = state.copyWith(
      notifications: state.notifications
          .map((n) => n.id == id ? n.copyWith(isRead: true) : n)
          .toList(),
    );
    
    try {
      await http.patch(
        Uri.parse('http://localhost:8080/api/v1/notifications/$id/read'),
      );
    } catch (e) {
      print('Failed to mark notification as read: $e');
    }
  }

  Future<void> dismiss(String id) async {
    // Optimistic UI update
    state = state.copyWith(
      notifications: state.notifications.where((n) => n.id != id).toList(),
    );

    try {
      await http.patch(
        Uri.parse('http://localhost:8080/api/v1/notifications/$id/dismiss'),
      );
    } catch (e) {
      print('Failed to dismiss notification: $e');
    }
  }

  @override
  void dispose() {
    _stompClient?.deactivate();
    super.dispose();
  }
}

final notificationProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
      return NotificationNotifier(ref);
    });
