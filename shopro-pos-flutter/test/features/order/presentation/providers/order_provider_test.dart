import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:shopro_pos_flutter/features/order/domain/models/order_models.dart';
import 'package:shopro_pos_flutter/features/order/domain/repositories/order_repository.dart';
import 'package:shopro_pos_flutter/features/order/presentation/providers/order_provider.dart';
import 'package:shopro_pos_flutter/features/notifications/presentation/providers/notification_provider.dart';
import 'package:shopro_pos_flutter/core/network/api_client.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';

@GenerateNiceMocks([
  MockSpec<OrderRepository>(),
  MockSpec<ApiClient>(),
  MockSpec<StompClient>(),
])
import 'order_provider_test.mocks.dart';

// Use a real NotificationNotifier but override its dependencies or just a stub subclass
class StubNotificationNotifier extends NotificationNotifier {
  StubNotificationNotifier(Ref ref, {bool connected = false}) : super(ref) {
    state = NotificationState(notifications: [], isConnected: connected);
  }

  @override
  void _init() {
    // Prevent real network/stomp calls
  }
}

void main() {
  late MockOrderRepository mockRepository;
  late ProviderContainer container;

  setUp(() {
    mockRepository = MockOrderRepository();
    
    container = ProviderContainer(
      overrides: [
        orderRepositoryProvider.overrideWithValue(mockRepository),
        // Providing a stub notifier that sets an initial state immediately
        notificationProvider.overrideWith((ref) => StubNotificationNotifier(ref)),
      ],
    );
  });

  tearDown(() {
    container.dispose();
  });

  group('OrderNotifier', () {
    test('clearActiveOrder sets activeOrder to null and fetches active orders', () async {
      final notifier = container.read(orderProvider.notifier);
      final dummyOrder = OrderTicket(
        id: '123',
        orderNumber: 'ORD-123',
        status: TicketStatus.open,
        orderType: OrderType.dineIn,
        serverId: 's1',
        serverName: 'Sarah',
        coverCount: 2,
        subtotal: 10.0,
        taxAmount: 1.0,
        tipAmount: 0.0,
        discountAmount: 0.0,
        totalAmount: 11.0,
        items: [],
        createdAt: DateTime.now(),
      );

      notifier.setActiveOrder(dummyOrder);
      expect(container.read(orderProvider).activeOrder, dummyOrder);

      when(mockRepository.getActiveOrders()).thenAnswer((_) async => []);

      notifier.clearActiveOrder();
      
      expect(container.read(orderProvider).activeOrder, isNull);
      verify(mockRepository.getActiveOrders()).called(1);
    });

    test('completePayment calls repository and refreshes active orders list', () async {
      final notifier = container.read(orderProvider.notifier);
      final dummyOrder = OrderTicket(
        id: '123',
        orderNumber: 'ORD-123',
        status: TicketStatus.open,
        orderType: OrderType.dineIn,
        serverId: 's1',
        serverName: 'Sarah',
        coverCount: 2,
        subtotal: 10.0,
        taxAmount: 1.0,
        tipAmount: 0.0,
        discountAmount: 0.0,
        totalAmount: 11.0,
        items: [],
        createdAt: DateTime.now(),
      );

      notifier.setActiveOrder(dummyOrder);

      when(mockRepository.completePayment('123', PaymentMethod.cash, 11.0))
          .thenAnswer((_) async => {});
      when(mockRepository.getActiveOrders()).thenAnswer((_) async => []);

      await notifier.completePayment(PaymentMethod.cash);

      verify(mockRepository.completePayment('123', PaymentMethod.cash, 11.0)).called(1);
      verify(mockRepository.getActiveOrders()).called(1);
      expect(container.read(orderProvider).isLoading, false);
    });

    test('submitOrder refreshes active orders list', () async {
      final notifier = container.read(orderProvider.notifier);
      final dummyOrder = OrderTicket(
        id: '123',
        orderNumber: 'ORD-123',
        status: TicketStatus.open,
        orderType: OrderType.dineIn,
        serverId: 's1',
        serverName: 'Sarah',
        coverCount: 2,
        subtotal: 10.0,
        taxAmount: 1.0,
        tipAmount: 0.0,
        discountAmount: 0.0,
        totalAmount: 11.0,
        items: [],
        createdAt: DateTime.now(),
      );

      notifier.setActiveOrder(dummyOrder);

      when(mockRepository.sendToKitchen(any, idempotencyKey: anyNamed('idempotencyKey')))
          .thenAnswer((_) async => dummyOrder.copyWith(status: TicketStatus.submitted));
      when(mockRepository.getActiveOrders()).thenAnswer((_) async => []);

      await notifier.submitOrder();

      verify(mockRepository.getActiveOrders()).called(1);
    });
  });
}
