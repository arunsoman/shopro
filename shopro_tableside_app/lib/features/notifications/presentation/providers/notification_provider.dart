import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import 'package:dio/dio.dart';
import 'package:shopro_tableside_app/features/session/presentation/providers/session_providers.dart';
import 'package:shopro_tableside_app/features/notifications/data/models/notification_model.dart';

class NotificationState {
  final List<InAppNotification> notifications;
  final bool isConnected;

  NotificationState({this.notifications = const [], this.isConnected = false});

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

final dioProvider = Provider<Dio>(
  (ref) => Dio(BaseOptions(baseUrl: 'http://localhost:8080/v1')),
);

final stompClientProvider = Provider.family<StompClient, StompConfig>((
  ref,
  config,
) {
  return StompClient(config: config);
});

class NotificationNotifier extends Notifier<NotificationState> {
  StompClient? _client;

  @override
  NotificationState build() {
    final session = ref.watch(sessionProvider);

    // Cleanup on dispose
    ref.onDispose(() {
      _client?.deactivate();
    });

    if (session.sessionId != null) {
      // Use microtask to avoid side effects during build
      Future.microtask(() {
        _fetchInitialNotifications(session.sessionId!);
        _connectWebSocket(session.sessionId!);
      });
    }

    return NotificationState();
  }

  Future<void> _fetchInitialNotifications(String sessionId) async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get(
        '/notifications',
        queryParameters: {'recipientId': sessionId, 'recipientType': 'SESSION'},
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['content'];
        state = state.copyWith(
          notifications: data
              .map((n) => InAppNotification.fromJson(n))
              .toList(),
        );
      }
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
    }
  }

  void _connectWebSocket(String sessionId) {
    if (_client != null && _client!.connected) return;

    _client?.deactivate();

    _client = ref.read(
      stompClientProvider(
        StompConfig(
          url: 'ws://localhost:8080/ws',
          onConnect: (frame) {
            state = state.copyWith(isConnected: true);

            // Subscribe to session notifications
            _client?.subscribe(
              destination: '/topic/session/$sessionId/notifications',
              callback: (frame) {
                if (frame.body != null) {
                  final notification = InAppNotification.fromJson(
                    json.decode(frame.body!),
                  );
                  state = state.copyWith(
                    notifications: [notification, ...state.notifications],
                  );
                }
              },
            );

            // Subscribe to state sync
            _client?.subscribe(
              destination: '/topic/session/$sessionId/notifications/sync',
              callback: (frame) {
                if (frame.body != null) {
                  final Map<String, dynamic> msg = json.decode(frame.body!);
                  final id = msg['id'];
                  final action = msg['action'];
                  if (action == 'READ') {
                    state = state.copyWith(
                      notifications: state.notifications
                          .map((n) => n.id == id ? n.copyWith(isRead: true) : n)
                          .toList(),
                    );
                  } else if (action == 'DISMISSED') {
                    state = state.copyWith(
                      notifications: state.notifications
                          .where((n) => n.id != id)
                          .toList(),
                    );
                  }
                }
              },
            );

            // Subscribe to recall
            _client?.subscribe(
              destination: '/topic/notifications/recall',
              callback: (frame) {
                if (frame.body != null) {
                  final Map<String, dynamic> msg = json.decode(frame.body!);
                  final correlationId = msg['correlationId'];
                  state = state.copyWith(
                    notifications: state.notifications
                        .where((n) => n.correlationId != correlationId)
                        .toList(),
                  );
                }
              },
            );
          },
          onDisconnect: (frame) => state = state.copyWith(isConnected: false),
          onWebSocketError: (e) => debugPrint('WS Error: $e'),
        ),
      ),
    );

    _client?.activate();
  }

  Future<void> markAsRead(String id) async {
    try {
      final dio = ref.read(dioProvider);
      await dio.patch('/notifications/$id/read');
      state = state.copyWith(
        notifications: state.notifications
            .map((n) => n.id == id ? n.copyWith(isRead: true) : n)
            .toList(),
      );
    } catch (e) {
      debugPrint('Error marking as read: $e');
    }
  }

  Future<void> dismiss(String id) async {
    try {
      final dio = ref.read(dioProvider);
      await dio.patch('/notifications/$id/dismiss');
      state = state.copyWith(
        notifications: state.notifications.where((n) => n.id != id).toList(),
      );
    } catch (e) {
      debugPrint('Error dismissing: $e');
    }
  }
}

final notificationProvider =
    NotifierProvider<NotificationNotifier, NotificationState>(() {
      return NotificationNotifier();
    });
