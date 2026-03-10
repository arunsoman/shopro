import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:dio/dio.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import 'package:shopro_tableside_app/features/notifications/presentation/providers/notification_provider.dart';
import 'package:shopro_tableside_app/features/session/presentation/providers/session_providers.dart';

@GenerateNiceMocks([MockSpec<Dio>(), MockSpec<StompClient>()])
import 'notification_provider_test.mocks.dart';

void main() {
  late MockDio mockDio;
  late MockStompClient mockStompClient;
  late ProviderContainer container;

  setUp(() {
    mockDio = MockDio();
    mockStompClient = MockStompClient();

    // Stub Dio.get for initial fetch
    when(
      mockDio.get(any, queryParameters: anyNamed('queryParameters')),
    ).thenAnswer(
      (_) async => Response(
        data: {
          'content': [
            {
              'id': 'notif-1',
              'title': 'Existing Notif',
              'message': 'Test message',
              'category': 'ORDER',
              'priority': 'MEDIUM',
              'isRead': false,
              'isDismissed': false,
              'createdAt': DateTime.now().toIso8601String(),
            },
          ],
        },
        statusCode: 200,
        requestOptions: RequestOptions(path: '/notifications'),
      ),
    );

    container = ProviderContainer(
      overrides: [
        dioProvider.overrideWithValue(mockDio),
        stompClientProvider.overrideWith((ref, config) => mockStompClient),
        sessionProvider.overrideWith(() => SessionNotifierStub('session-123')),
      ],
    );
  });

  tearDown(() {
    container.dispose();
  });

  test(
    'Claim: Fetches initial notifications and activates WebSocket',
    () async {
      // Trigger build
      container.read(notificationProvider);

      // Wait for microtasks in build() to finish
      await Future.delayed(Duration.zero);
      await Future.delayed(Duration.zero);

      final state = container.read(notificationProvider);
      expect(state.notifications, isNotEmpty);
      expect(state.notifications.first.id, 'notif-1');

      verify(mockStompClient.activate()).called(1);
    },
  );
}

class SessionNotifierStub extends SessionNotifier {
  final String? _sessionId;
  SessionNotifierStub(this._sessionId);

  @override
  SessionState build() {
    return SessionState(tableId: 'W-1', sessionId: _sessionId);
  }
}
