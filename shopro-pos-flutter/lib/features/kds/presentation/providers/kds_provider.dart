import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../../domain/models/kds_models.dart';
import '../../domain/repositories/kds_repository.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/edp/edp_bus.dart';
import './kds_reducer.dart';
import 'package:dio/dio.dart';
import '../../../floor_plan/presentation/providers/floor_plan_provider.dart';
import '../../../floor_plan/domain/models/floor_models.dart';
import '../../../../core/network/network_config.dart';

class KDSState {
  final List<KDSTicket> tickets;
  final List<KDSStation> stations;
  final List<KDSExpoGroup> expoGroups;
  final List<KDSAllDayItem> allDayItems;
  final DateTime lastTick;
  final bool isLoading;
  final String? error;
  final String? currentStationId;

  KDSState({
    this.tickets = const [],
    this.stations = const [],
    this.expoGroups = const [],
    this.allDayItems = const [],
    DateTime? lastTick,
    this.isLoading = false,
    this.error,
    this.currentStationId,
  }) : lastTick = lastTick ?? DateTime.now();

  KDSState copyWith({
    List<KDSTicket>? tickets,
    List<KDSStation>? stations,
    List<KDSExpoGroup>? expoGroups,
    List<KDSAllDayItem>? allDayItems,
    DateTime? lastTick,
    bool? isLoading,
    String? error,
    String? currentStationId,
  }) {
    return KDSState(
      tickets: tickets ?? this.tickets,
      stations: stations ?? this.stations,
      expoGroups: expoGroups ?? this.expoGroups,
      allDayItems: allDayItems ?? this.allDayItems,
      lastTick: lastTick ?? this.lastTick,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      currentStationId: currentStationId ?? this.currentStationId,
    );
  }
}

class KDSNotifier extends StateNotifier<KDSState> {
  final KDSRepository _repository;
  final Ref _ref;
  final KdsReducer _reducer = KdsReducer();
  StompClient? _stompClient;

  KDSNotifier(this._repository, this._ref) : super(KDSState()) {
    // Listen for EDP events
    _ref.read(edpBusProvider).events.listen((event) {
      if (mounted) {
        state = _reducer.reduce(state, event);
        _updateAggregates();
      }
    });

    // Listen to floor plan updates
    _ref.listen(floorPlanProvider, (previous, next) {
      if (state.currentStationId != null) {
        final station = state.stations.firstWhere(
          (s) => s.id == state.currentStationId,
          orElse: () => const KDSStation(id: '', name: '', stationType: KDSStationType.general, online: false),
        );
        if (station.stationType == KDSStationType.expo) {
          _updateAggregates();
        }
      }
    });

    // Ticking timer for UI refreshes (item age)
    Stream.periodic(const Duration(seconds: 1)).listen((_) {
      if (mounted) {
        state = state.copyWith(lastTick: DateTime.now());
      }
    });
  }

  Future<void> fetchStations() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final stations = await _repository.getAllStations();
      state = state.copyWith(stations: stations, isLoading: false);
    } on DioException catch (e) {
      final msg = e.response?.data['message'] ?? e.message;
      state = state.copyWith(isLoading: false, error: msg);
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
      _updateAggregates();
    } on DioException catch (e) {
      final msg = e.response?.data['message'] ?? e.message;
      state = state.copyWith(isLoading: false, error: msg);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void _connectWebSocket(String stationId) {
    _stompClient = StompClient(
      config: StompConfig(
        url: NetworkConfig.wsUrl,
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
        onWebSocketError: (e) => debugPrint('WS Error: $e'),
      ),
    );
    _stompClient?.activate();
  }

  void _onTicketUpdate(Map<String, dynamic> data) {
    final updatedTicket = KDSTicket.fromJson(data);
    final List<KDSTicket> currentTickets = List.from(state.tickets);
    
    final currentStation = state.stations.firstWhere(
      (s) => s.id == state.currentStationId,
      orElse: () => const KDSStation(id: '', name: '', stationType: KDSStationType.general, online: false),
    );
    final isExpo = currentStation.stationType == KDSStationType.expo;

    final index = currentTickets.indexWhere((t) => t.id == updatedTicket.id);
    if (index != -1) {
      // For non-expo stations, remove if bumped or ready
      // For expo, we only remove if it's explicitly bumped for EXPO (backend logic should handle this usually, but we safeguard)
      if (!isExpo && (updatedTicket.status == KDSTicketStatus.bumped ||
          updatedTicket.status == KDSTicketStatus.ready)) {
        currentTickets.removeAt(index);
      } else {
        currentTickets[index] = updatedTicket;
      }
    } else {
      // Add if not a terminal status for this station type
      if (isExpo || (updatedTicket.status != KDSTicketStatus.bumped &&
          updatedTicket.status != KDSTicketStatus.ready)) {
        currentTickets.add(updatedTicket);
        // Re-sort by firedAt
        currentTickets.sort((a, b) => a.firedAt.compareTo(b.firedAt));
      }
    }

    state = state.copyWith(tickets: currentTickets);
    _updateAggregates();
  }

  void _updateAggregates() {
    _updateExpoGroups();
    _updateAllDayItems();
  }

  void _updateAllDayItems() {
    final tickets = state.tickets;
    final Map<String, List<KDSTicketItem>> itemsByName = {};

    for (final ticket in tickets) {
      for (final item in ticket.items) {
        if (item.status != KDSItemStatus.ready) {
          itemsByName.putIfAbsent(item.name, () => []).add(item);
        }
      }
    }

    final List<KDSAllDayItem> allDay = itemsByName.entries.map((entry) {
      final name = entry.key;
      final items = entry.value;
      
      final total = items.fold(0, (sum, i) => sum + i.quantity);
      final pending = items.where((i) => i.status == KDSItemStatus.pending).fold(0, (sum, i) => sum + i.quantity);
      final cooking = items.where((i) => i.status == KDSItemStatus.cooking).fold(0, (sum, i) => sum + i.quantity);

      return KDSAllDayItem(
        name: name,
        totalQuantity: total,
        quantityPending: pending,
        quantityReady: cooking, // We'll use 'ready' in the mockup as 'cooking' since actual ready items are bumped
        category: 'GENERAL', // Could be derived from station if available
      );
    }).toList();

    allDay.sort((a, b) => b.totalQuantity.compareTo(a.totalQuantity));
    state = state.copyWith(allDayItems: allDay);
  }

  void _updateExpoGroups() {
    final currentStation = state.stations.firstWhere(
      (s) => s.id == state.currentStationId,
      orElse: () => const KDSStation(id: '', name: '', stationType: KDSStationType.general, online: false),
    );

    if (currentStation.stationType != KDSStationType.expo) {
      state = state.copyWith(expoGroups: []);
      return;
    }

    final floorPlan = _ref.read(floorPlanProvider);
    final tickets = state.tickets;

    // Group tickets by table
    final Map<String, List<KDSTicket>> ticketsByTable = {};
    for (final ticket in tickets) {
      ticketsByTable.putIfAbsent(ticket.tableNumber, () => []).add(ticket);
    }

    // Identify occupied/active tables from floor plan
    // Show table until it's marked as DIRTY or becomes AVAILABLE again
    final activeStatuses = {
      TableStatus.occupied,
      TableStatus.ordered,
      TableStatus.foodDelivered,
      TableStatus.dessertCourse,
      TableStatus.checkDropped,
      TableStatus.paying,
    };

    final activeTables = floorPlan.tables
        .where((t) => activeStatuses.contains(t.status));

    final Set<String> tablesToDisplay = {
      ...ticketsByTable.keys,
      ...activeTables.map((t) => t.name),
    };

    final List<KDSExpoGroup> groups = tablesToDisplay.map((tableNumber) {
      final tableTickets = ticketsByTable[tableNumber] ?? [];
      // Filter out items that are already SERVED to ensure they disappear from EXPO
      final List<KDSTicketItem> allItems = tableTickets.expand((t) => t.items)
          .where((i) => i.status != KDSItemStatus.served)
          .toList();
      
      if (allItems.isEmpty && tableTickets.isNotEmpty) {
        // If all items in existing tickets are served, we might want to still show the table 
        // if it's active in floor plan, but without the old ticket items.
      }
      
      TableInfo? tableInfo;
      try {
        tableInfo = activeTables.firstWhere((t) => t.name == tableNumber);
      } catch (_) {}

      // Use the earliest firedAt or occupancy start if no tickets
      final DateTime occupancyStart = tableTickets.isEmpty 
          ? DateTime.now() // Ideally this would be seating time from the table entity
          : tableTickets.map((t) => t.firedAt).reduce((a, b) => a.isBefore(b) ? a : b);

      return KDSExpoGroup(
        tableNumber: tableNumber,
        occupancyStart: occupancyStart,
        serverName: tableInfo?.assignedStaffName ?? (tableTickets.isNotEmpty ? tableTickets.first.serverName : 'Unknown'),
        guestCount: tableInfo?.capacity,
        items: allItems,
        ticketIds: tableTickets.map((t) => t.id).toList(),
      );
    }).toList();

    // Sort groups by table number
    groups.sort((a, b) => a.tableNumber.compareTo(b.tableNumber));

    // KDS UX Rule: Only show tables that have active orders needing preparation/service (non-served items)
    final activeGroups = groups.where((g) => g.items.isNotEmpty).toList();

    state = state.copyWith(expoGroups: activeGroups);
  }

  Future<void> bumpTicket(String ticketId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // Optimistic delete
      state = state.copyWith(
        tickets: state.tickets.where((t) => t.id != ticketId).toList(),
      );

      await _repository.bumpTicket(ticketId);
      state = state.copyWith(isLoading: false);
    } on DioException catch (e) {
      final msg = e.response?.data['message'] ?? e.message;
      state = state.copyWith(error: 'Failed to bump ticket: $msg');
    } catch (e) {
      // Revert optimism if failed? Or just error
      state = state.copyWith(error: 'Failed to bump ticket: $e');
    }
  }

  Future<void> bumpItem(String itemId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _repository.bumpItem(itemId);
      // Update local state immediately for responsiveness
      _updateItemStatusLocal(itemId, KDSItemStatus.ready);
      state = state.copyWith(isLoading: false);
    } on DioException catch (e) {
      final msg = e.response?.data['message'] ?? e.message;
      state = state.copyWith(error: 'Failed to bump item: $msg');
    } catch (e) {
      state = state.copyWith(error: 'Failed to bump item: $e');
    }
  }

  void _updateItemStatusLocal(String itemId, KDSItemStatus status) {
    final updatedTickets = state.tickets.map((ticket) {
      final updatedItems = ticket.items.map((item) {
        if (item.id == itemId) {
          return item.copyWith(status: status);
        }
        return item;
      }).toList();
      return ticket.copyWith(items: updatedItems);
    }).toList();
    
    state = state.copyWith(tickets: updatedTickets);
    _updateAggregates();
  }

  Future<void> toggleItemCooking(KDSTicketItem item) async {
    try {
      KDSItemStatus newStatus;
      if (item.status == KDSItemStatus.pending || item.status == KDSItemStatus.paused) {
        newStatus = KDSItemStatus.cooking;
      } else if (item.status == KDSItemStatus.cooking) {
        newStatus = KDSItemStatus.paused;
      } else {
        return;
      }

      // Optimistic update
      _updateItemStatusLocal(item.id, newStatus);
      
      state = state.copyWith(isLoading: true, error: null);
      await _repository.toggleItemStatus(item.id);
      state = state.copyWith(isLoading: false);
    } on DioException catch (e) {
      final msg = e.response?.data['message'] ?? e.message;
      state = state.copyWith(error: 'Failed to toggle cooking state: $msg');
    } catch (e) {
      state = state.copyWith(error: 'Failed to toggle cooking state: $e');
      // Ideally revert status, but WS will fix it
    }
  }

  Future<void> markItemDone(KDSTicketItem item) async {
    try {
      // Optimistic update
      _updateItemStatusLocal(item.id, KDSItemStatus.ready);
      
      await _repository.markItemReady(item.id);
    } on DioException catch (e) {
      final msg = e.response?.data['message'] ?? e.message;
      state = state.copyWith(error: 'Failed to mark item done: $msg');
    } catch (e) {
      state = state.copyWith(error: 'Failed to mark item done: $e');
    }
  }

  Future<void> serveItem(KDSTicketItem item) async {
    try {
      // Optimistic update
      _updateItemStatusLocal(item.id, KDSItemStatus.served);
      
      await _repository.serveItem(item.id);
    } on DioException catch (e) {
      final msg = e.response?.data['message'] ?? e.message;
      state = state.copyWith(error: 'Failed to serve item: $msg');
    } catch (e) {
      state = state.copyWith(error: 'Failed to serve item: $e');
    }
  }

  Future<void> updateItemPriority(String itemId, int delta) async {
    try {
      // Find current priority
      int currentPriority = 0;
      for (final ticket in state.tickets) {
        final item = ticket.items.where((i) => i.id == itemId).firstOrNull;
        if (item != null) {
          currentPriority = item.priority;
          break;
        }
      }
      
      final newPriority = (currentPriority + delta).clamp(0, 5);
      
      // Optimistic update
      final updatedTickets = state.tickets.map((ticket) {
        final updatedItems = ticket.items.map((item) {
          if (item.id == itemId) return item.copyWith(priority: newPriority);
          return item;
        }).toList();
        return ticket.copyWith(items: updatedItems);
      }).toList();

      state = state.copyWith(tickets: updatedTickets);
      _updateAggregates();

      // Backend sync
      await _repository.updateItemPriority(itemId, newPriority);
    } on DioException catch (e) {
      final msg = e.response?.data['message'] ?? e.message;
      state = state.copyWith(error: 'Failed to update priority: $msg');
    } catch (e) {
      state = state.copyWith(error: 'Failed to update priority: $e');
    }
  }

  Future<void> bumpTable(List<String> ticketIds) async {
    try {
      // Optimistic locally set items to SERVED
      final updatedTickets = state.tickets.map((ticket) {
        if (ticketIds.contains(ticket.id)) {
          final updatedItems = ticket.items.map((item) {
            if (item.status == KDSItemStatus.ready) {
              return item.copyWith(status: KDSItemStatus.served);
            }
            return item;
          }).toList();
          return ticket.copyWith(items: updatedItems);
        }
        return ticket;
      }).toList();

      state = state.copyWith(tickets: updatedTickets);
      _updateExpoGroups();
      
      state = state.copyWith(isLoading: true, error: null);
      await _repository.serveReadyItems(ticketIds);
      state = state.copyWith(isLoading: false);
    } on DioException catch (e) {
      final msg = e.response?.data['message'] ?? e.message;
      state = state.copyWith(error: 'Failed to bump table: $msg');
    } catch (e) {
      state = state.copyWith(error: 'Failed to bump table: $e');
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
  final client = ref.watch(apiClientProvider);
  return KDSRepository(client);
});

final kdsProvider = StateNotifierProvider<KDSNotifier, KDSState>((ref) {
  return KDSNotifier(ref.watch(kdsRepositoryProvider), ref);
});
