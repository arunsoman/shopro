import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import 'package:http/http.dart' as http;
import '../../../../core/network/network_config.dart';
import '../../../../core/edp/edp_bus.dart';
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
  StompClient? stompClient;
  final Ref _ref;
  final _newNotificationController = StreamController<InAppNotification>.broadcast();
  Stream<InAppNotification> get newNotifications => _newNotificationController.stream;

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
        Uri.parse('${NetworkConfig.baseUrl}/notifications?userId=$userId&page=0&size=50'),
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
      debugPrint('Failed to fetch notification history: $e');
    }
  }

  void _connect(String userId, String role) {
    stompClient = StompClient(
      config: StompConfig(
        url: NetworkConfig.wsUrl,
        onConnect: (frame) {
          state = state.copyWith(isConnected: true);
          
          // EDP: Recover missed events upon reconnection
          _ref.read(edpBusProvider).sync();

          // Subscribe to User-specific notifications
          stompClient?.subscribe(
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
          stompClient?.subscribe(
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
          stompClient?.subscribe(
            destination: '/user/queue/notifications/sync',
            callback: (frame) {
              if (frame.body != null) {
                _onSyncReceived(json.decode(frame.body!));
              }
            },
          );

          // Subscribe to Recall commands (System-wide)
          stompClient?.subscribe(
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
    stompClient?.activate();
  }

  void _onNotificationReceived(InAppNotification notification) {
    // Avoid duplicates if history was just fetched
    if (state.notifications.any((n) => n.id == notification.id)) return;

    state = state.copyWith(
      notifications: [notification, ...state.notifications],
    );
    _newNotificationController.add(notification);
  }

  void _onSyncReceived(Map<String, dynamic> syncData) {
    final id = syncData['id'];
    final action = syncData['action'];

    if (action == 'DISMISS_ALL') {
      state = state.copyWith(notifications: []);
      return;
    }

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
    stompClient?.deactivate();
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
        Uri.parse('${NetworkConfig.baseUrl}/notifications/$id/read'),
      );
    } catch (e) {
      debugPrint('Failed to mark notification as read: $e');
    }
  }

  Future<void> dismiss(String id) async {
    // Optimistic UI update
    state = state.copyWith(
      notifications: state.notifications.where((n) => n.id != id).toList(),
    );

    try {
      await http.patch(
        Uri.parse('${NetworkConfig.baseUrl}/notifications/$id/dismiss'),
      );
    } catch (e) {
      debugPrint('Failed to dismiss notification: $e');
    }
  }

  Future<void> dismissAll() async {
    final userId = _ref.read(authProvider).staffId;
    if (userId == null) return;

    // Optimistic UI update
    state = state.copyWith(notifications: []);

    try {
      await http.delete(
        Uri.parse('${NetworkConfig.baseUrl}/notifications/dismiss-all?userId=$userId'),
      );
    } catch (e) {
      debugPrint('Failed to dismiss all notifications: $e');
    }
  }

  @override
  void dispose() {
    _newNotificationController.close();
    stompClient?.deactivate();
    super.dispose();
  }
}

final notificationProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
      return NotificationNotifier(ref);
    });
