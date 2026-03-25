import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:shopro_pos_flutter/features/order/domain/models/order_models.dart';
import 'package:shopro_pos_flutter/features/order/domain/repositories/order_repository.dart';
import 'package:shopro_pos_flutter/features/order/presentation/providers/order_provider.dart';
import 'package:shopro_pos_flutter/core/network/api_client.dart';
import 'package:dio/dio.dart';

@GenerateNiceMocks([MockSpec<OrderRepository>(), MockSpec<ApiClient>()])
import 'order_provider_test.mocks.dart';

void main() {
  late MockOrderRepository mockRepository;
  late ProviderContainer container;

  setUp(() {
    mockRepository = MockOrderRepository();
    container = ProviderContainer(
      overrides: [
        orderRepositoryProvider.overrideWithValue(mockRepository),
      ],
    );
  });

  tearDown(() {
    container.dispose();
  });

  group('OrderNotifier', () {
    test('clearActiveOrder sets activeOrder to null', () {
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

      notifier.clearActiveOrder();
      expect(container.read(orderProvider).activeOrder, isNull);
    });

    test('completePayment calls repository and updates loading state', () async {
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

      await notifier.completePayment(PaymentMethod.cash);

      verify(mockRepository.completePayment('123', PaymentMethod.cash, 11.0)).called(1);
      expect(container.read(orderProvider).isLoading, false);
    });
  });
}
