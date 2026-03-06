import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../../domain/models/kds_models.dart';
import '../../domain/repositories/kds_repository.dart';
import '../../../../core/network/api_client.dart';

class KDSState {
  final List<KDSTicket> tickets;
  final List<KDSStation> stations;
  final bool isLoading;
  final String? error;
  final String? currentStationId;

  KDSState({
    this.tickets = const [],
    this.stations = const [],
    this.isLoading = false,
    this.error,
    this.currentStationId,
  });

  KDSState copyWith({
    List<KDSTicket>? tickets,
    List<KDSStation>? stations,
    bool? isLoading,
    String? error,
    String? currentStationId,
  }) {
    return KDSState(
      tickets: tickets ?? this.tickets,
      stations: stations ?? this.stations,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      currentStationId: currentStationId ?? this.currentStationId,
    );
  }
}

class KDSNotifier extends StateNotifier<KDSState> {
  final KDSRepository _repository;
  StompClient? _stompClient;

  KDSNotifier(this._repository) : super(KDSState());

  Future<void> fetchStations() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final stations = await _repository.getAllStations();
      state = state.copyWith(stations: stations, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> selectStation(String stationId) async {
    state = state.copyWith(
      currentStationId: stationId,
      isLoading: true,
      error: null,
    );

    // Disconnect previous if any
    _stompClient?.deactivate();

    try {
      final tickets = await _repository.getActiveTickets(stationId);
      state = state.copyWith(tickets: tickets, isLoading: false);
      _connectWebSocket(stationId);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void _connectWebSocket(String stationId) {
    _stompClient = StompClient(
      config: StompConfig(
        url:
            'ws://localhost:8080/ws-raw', // Should be dynamic based on environment
        onConnect: (frame) {
          _stompClient?.subscribe(
            destination: '/topic/kds/station/$stationId',
            callback: (frame) {
              if (frame.body != null) {
                final Map<String, dynamic> data = jsonDecode(frame.body!);
                _onTicketUpdate(data);
              }
            },
          );
        },
        onWebSocketError: (e) => print('WS Error: $e'),
      ),
    );
    _stompClient?.activate();
  }

  void _onTicketUpdate(Map<String, dynamic> data) {
    final updatedTicket = KDSTicket.fromJson(data);
    final List<KDSTicket> currentTickets = List.from(state.tickets);

    final index = currentTickets.indexWhere((t) => t.id == updatedTicket.id);
    if (index != -1) {
      if (updatedTicket.status == KDSTicketStatus.BUMPED ||
          updatedTicket.status == KDSTicketStatus.READY) {
        currentTickets.removeAt(index);
      } else {
        currentTickets[index] = updatedTicket;
      }
    } else {
      if (updatedTicket.status != KDSTicketStatus.BUMPED &&
          updatedTicket.status != KDSTicketStatus.READY) {
        currentTickets.add(updatedTicket);
        // Re-sort by firedAt
        currentTickets.sort((a, b) => a.firedAt.compareTo(b.firedAt));
      }
    }

    state = state.copyWith(tickets: currentTickets);
  }

  Future<void> bumpTicket(String ticketId) async {
    try {
      // Optimistic delete
      state = state.copyWith(
        tickets: state.tickets.where((t) => t.id != ticketId).toList(),
      );

      await _repository.bumpTicket(ticketId);
    } catch (e) {
      // Revert optimism if failed? Or just error
      state = state.copyWith(error: 'Failed to bump ticket');
    }
  }

  Future<void> bumpItem(String itemId) async {
    try {
      await _repository.bumpItem(itemId);
      // Actual state update will come via WebSocket
    } catch (e) {
      state = state.copyWith(error: 'Failed to bump item');
    }
  }

  @override
  void dispose() {
    _stompClient?.deactivate();
    super.dispose();
  }
}

// Need to satisfy dependencies
final kdsRepositoryProvider = Provider((ref) {
  // Use the global apiClient
  return KDSRepository(apiClient);
});

final kdsProvider = StateNotifierProvider<KDSNotifier, KDSState>((ref) {
  return KDSNotifier(ref.watch(kdsRepositoryProvider));
});
