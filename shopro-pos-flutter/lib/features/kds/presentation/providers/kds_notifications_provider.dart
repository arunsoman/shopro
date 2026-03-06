import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';

class KDSNotification {
  final String message;
  final DateTime receivedAt;

  KDSNotification(this.message, this.receivedAt);
}

class KDSNotificationsNotifier extends StateNotifier<List<KDSNotification>> {
  StompClient? _stompClient;

  KDSNotificationsNotifier() : super([]) {
    _connect();
  }

  void _connect() {
    _stompClient = StompClient(
      config: StompConfig(
        url: 'ws://localhost:8080/ws-raw',
        onConnect: (frame) {
          _stompClient?.subscribe(
            destination: '/topic/pos/notifications',
            callback: (frame) {
              if (frame.body != null) {
                _onNotificationReceived(frame.body!);
              }
            },
          );
        },
        onWebSocketError: (error) {
          // Log silently — WS is optional for KDS display
        },
        onStompError: (frame) {
          // Log silently — WS is optional for KDS display
        },
      ),
    );
    _stompClient?.activate();
  }

  void _onNotificationReceived(String message) {
    state = [KDSNotification(message, DateTime.now()), ...state];
  }

  void clearNotifications() {
    state = [];
  }

  @override
  void dispose() {
    _stompClient?.deactivate();
    super.dispose();
  }
}

final kdsNotificationsProvider =
    StateNotifierProvider<KDSNotificationsNotifier, List<KDSNotification>>((
      ref,
    ) {
      return KDSNotificationsNotifier();
    });
