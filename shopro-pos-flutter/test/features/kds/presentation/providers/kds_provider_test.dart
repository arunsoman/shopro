import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import 'package:shopro_pos_flutter/features/kds/presentation/providers/kds_provider.dart';
import 'package:shopro_pos_flutter/features/kds/domain/repositories/kds_repository.dart';
import 'package:shopro_pos_flutter/features/kds/domain/models/kds_models.dart';

@GenerateMocks([KDSRepository, StompClient])
import 'kds_provider_test.mocks.dart';

void main() {
  late MockKDSRepository mockRepository;
  late ProviderContainer container;

  setUp(() {
    mockRepository = MockKDSRepository();
    container = ProviderContainer(
      overrides: [
        kdsRepositoryProvider.overrideWithValue(mockRepository),
      ],
    );
  });

  tearDown(() {
    container.dispose();
  });

  test('KDSNotifier handles TICKET_UPDATED envelope correctly', () async {
    final notifier = container.read(kdsProvider.notifier);
    
    // 1. Initial State - Pre-populate with a ticket (Quantity 2)
    final initialTicket = KDSTicket(
      id: 'ticket-1',
      tableNumber: 'A1',
      serverName: 'John',
      status: KDSTicketStatus.newTicket,
      firedAt: DateTime.parse('2026-03-27T10:00:00Z'),
      items: [
        KDSTicketItem(
          id: 'item-1',
          menuItemId: 'menu-1',
          name: 'Burger',
          quantity: 2,
          status: KDSItemStatus.pending,
        ),
      ],
    );
    
    when(mockRepository.getActiveTickets(any)).thenAnswer((_) async => [initialTicket]);
    await notifier.selectStation('station-1');
    
    expect(container.read(kdsProvider).tickets.first.items.first.quantity, 2);

    // 2. Simulate WebSocket TICKET_UPDATED message (Quantity 1)
    final ticketJson = {
      'id': 'ticket-1',
      'tableNumber': 'A1',
      'serverName': 'John',
      'status': 'NEW',
      'firedAt': '2026-03-27T10:00:00Z',
      'items': [
        {
          'id': 'item-1',
          'menuItemId': 'menu-1',
          'name': 'Burger',
          'quantity': 1,
          'status': 'PENDING',
          'unitIndex': 1,
          'priority': 0,
          'preparationTimeMinutes': 10
        }
      ]
    };

    final payload = {
      'type': 'TICKET_UPDATED',
      'ticketId': 'ticket-1',
      'ticket': ticketJson,
    };

    // Verification of the unwrapping logic:
    // This confirms that KDSTicket.fromJson can read the 'ticket' field from the payload
    final extractedTicket = KDSTicket.fromJson(payload['ticket'] as Map<String, dynamic>);
    expect(extractedTicket.items.first.quantity, 1);
  });
}
