import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../../domain/models/floor_models.dart';
import '../../domain/repositories/floor_plan_repository.dart';
import '../../../notifications/presentation/providers/notification_provider.dart';

enum FloorViewMode { map, grid }

class FloorPlanState {
  final List<TableInfo> tables;
  final List<WaitlistEntry> waitlist;
  final List<Map<String, dynamic>> sections;
  final String selectedSection;
  final bool showOnlyMyTables;
  final FloorViewMode viewMode;
  final bool isLoading;
  final bool isEditMode;

  FloorPlanState({
    required this.tables,
    required this.waitlist,
    this.sections = const [],
    this.selectedSection = 'ALL',
    this.showOnlyMyTables = false,
    this.viewMode = FloorViewMode.map,
    this.isLoading = false,
    this.isEditMode = false,
  });

  factory FloorPlanState.initial() => FloorPlanState(tables: [], waitlist: []);

  FloorPlanState copyWith({
    List<TableInfo>? tables,
    List<WaitlistEntry>? waitlist,
    List<Map<String, dynamic>>? sections,
    String? selectedSection,
    bool? showOnlyMyTables,
    FloorViewMode? viewMode,
    bool? isLoading,
    bool? isEditMode,
  }) {
    return FloorPlanState(
      tables: tables ?? this.tables,
      waitlist: waitlist ?? this.waitlist,
      sections: sections ?? this.sections,
      selectedSection: selectedSection ?? this.selectedSection,
      showOnlyMyTables: showOnlyMyTables ?? this.showOnlyMyTables,
      viewMode: viewMode ?? this.viewMode,
      isLoading: isLoading ?? this.isLoading,
      isEditMode: isEditMode ?? this.isEditMode,
    );
  }
}

class FloorPlanNotifier extends Notifier<FloorPlanState> {
  @override
  FloorPlanState build() {
    // Proactively fetch on build
    Future.microtask(() => refresh());

    // Listen to real-time updates via NotificationNotifier's stompClient
    _setupWebSocketListeners();

    return FloorPlanState(
      tables: [], // Start empty, wait for refresh
      waitlist: [],
      selectedSection: 'ALL',
      showOnlyMyTables: false,
      viewMode: FloorViewMode.map,
      isLoading: true,
    );
  }

  void _setupWebSocketListeners() {
    final List<void Function()> unsubs = [];
    
    void subscribe(StompClient stompClient) {
      // Clear old subs if re-subscribing
      for (final unsub in unsubs) {
        unsub();
      }
      unsubs.clear();

      final unsubTables = stompClient.subscribe(
        destination: '/topic/tables',
        callback: (frame) {
          if (frame.body != null) {
            _handleTableUpdate(json.decode(frame.body!));
          }
        },
      );
      unsubs.add(unsubTables);

      final unsubWaitlist = stompClient.subscribe(
        destination: '/topic/waitlist',
        callback: (frame) {
          if (frame.body != null) {
            _handleWaitlistUpdate(json.decode(frame.body!));
          }
        },
      );
      unsubs.add(unsubWaitlist);
    }

    // 1. Handle initial state if already connected
    final notificationState = ref.read(notificationProvider);
    if (notificationState.isConnected) {
      final stompClient = ref.read(notificationProvider.notifier).stompClient;
      if (stompClient != null) {
        subscribe(stompClient);
      }
    }

    // 2. Listen for connection transitions
    ref.listen(notificationProvider, (previous, next) {
      if (next.isConnected && (previous == null || !previous.isConnected)) {
        final stompClient = ref.read(notificationProvider.notifier).stompClient;
        if (stompClient != null) {
          subscribe(stompClient);
        }
      }
    });

    // Clean up on dispose
    ref.onDispose(() {
      for (final unsub in unsubs) {
        unsub();
      }
    });
  }

  void _handleTableUpdate(Map<String, dynamic> data) {
    debugPrint('Received table update: $data');
    final tableId = data['id'];
    if (tableId == null) return;

    final statusStr = (data['status'] as String?)?.toUpperCase() ?? 'AVAILABLE';
    final TableStatus status = _mapBackendStatus(statusStr);
    
    state = state.copyWith(
      tables: state.tables.map((t) {
        if (t.id == tableId) {
          return t.copyWith(
            status: status,
            name: data['name'] ?? t.name,
            capacity: data['capacity'] ?? t.capacity,
            posX: (data['posX'] as num?)?.toDouble() ?? t.posX,
            posY: (data['posY'] as num?)?.toDouble() ?? t.posY,
            width: (data['width'] as num?)?.toDouble() ?? t.width,
            height: (data['height'] as num?)?.toDouble() ?? t.height,
            sectionId: data['sectionId'] ?? t.sectionId,
            assignedStaffId: data['assignedStaffId'] ?? t.assignedStaffId,
            assignedStaffName: data['assignedStaffName'] ?? t.assignedStaffName,
          );
        }
        return t;
      }).toList(),
    );
  }

  TableStatus _mapBackendStatus(String status) {
    switch (status) {
      case 'HELD':
      case 'RESERVED':
        return TableStatus.held;
      case 'OCCUPIED':
        return TableStatus.occupied;
      case 'ORDERED':
      case 'ORDER_PLACED':
        return TableStatus.ordered;
      case 'FOOD_DELIVERED':
      case 'DELIVERED':
        return TableStatus.foodDelivered;
      case 'DESSERT_COURSE':
        return TableStatus.dessertCourse;
      case 'CHECK_DROPPED':
        return TableStatus.checkDropped;
      case 'PAYING':
        return TableStatus.paying;
      case 'DIRTY':
        return TableStatus.dirty;
      case 'CLEANING':
        return TableStatus.cleaning;
      case 'MAINTENANCE':
        return TableStatus.maintenance;
      default:
        return TableStatus.available;
    }
  }

  void _handleWaitlistUpdate(Map<String, dynamic> data) {
    debugPrint('Received waitlist update: $data');
    final waitlistId = data['id'];
    final action = data['action'];

    if (action == 'SEATED') {
      state = state.copyWith(
        waitlist: state.waitlist.where((e) => e.id != waitlistId).toList(),
      );
    }
  }

  Future<void> refresh() async {
    try {
      state = state.copyWith(isLoading: true);
      final tables = await floorPlanRepository.getTables();
      final sections = await floorPlanRepository.getSections();
      final waitlist = await floorPlanRepository.getWaitlist();

      state = state.copyWith(
        tables: tables,
        waitlist: waitlist,
        sections: sections,
        isLoading: false,
      );
    } catch (e, stack) {
      debugPrint('Error refreshing floor plan: $e');
      debugPrint('Stack trace: $stack');
      state = state.copyWith(
        isLoading: false,
      );
    }
  }

  void selectSection(String section) {
    state = state.copyWith(selectedSection: section);
  }

  void toggleMyTables(bool value) {
    state = state.copyWith(showOnlyMyTables: value);
  }

  void toggleViewMode() {
    state = state.copyWith(
      viewMode: state.viewMode == FloorViewMode.map
          ? FloorViewMode.grid
          : FloorViewMode.map,
    );
  }

  Future<void> assignPartyToTable(String waitlistId, String tableId) async {
    try {
      // Optimistic update
      final tableIndex = state.tables.indexWhere((t) => t.id == tableId);
      if (tableIndex != -1) {
        final table = state.tables[tableIndex];
        final updatedTables = List<TableInfo>.from(state.tables)
          ..[tableIndex] = table.copyWith(
            status: TableStatus.occupied,
            currentOrderTime: 'Just now',
          );
        state = state.copyWith(
          tables: updatedTables,
          waitlist: state.waitlist.where((e) => e.id != waitlistId).toList(),
        );
      }

      await floorPlanRepository.seatParty(tableId, waitlistId);
    } catch (e) {
      debugPrint('Error seating party: $e');
      // On error, refresh to consistent state
      refresh();
    }
  }

  void notifyWaitlistEntry(String waitlistId) {
    // In a real app, this would call an SMS/Notify service
    final index = state.waitlist.indexWhere((e) => e.id == waitlistId);
    if (index == -1) return;
    
    final updatedWaitlist = List<WaitlistEntry>.from(state.waitlist)
      ..[index] = state.waitlist[index].copyWith(status: WaitlistStatus.ready, waitTimeDisplay: 'READY');
      
    state = state.copyWith(waitlist: updatedWaitlist);
  }

  Future<void> addToWaitlist({required String name, required int size, bool isVIP = false}) async {
    try {
      // Optimistic update
      final tempEntry = WaitlistEntry(
        id: 'temp-${DateTime.now().millisecondsSinceEpoch}',
        customerName: name,
        partySize: size,
        waitTimeDisplay: 'Joining...',
        status: WaitlistStatus.waiting,
        isVIP: isVIP,
      );
      state = state.copyWith(waitlist: [...state.waitlist, tempEntry]);

      await floorPlanRepository.addToWaitlist(name: name, size: size);
      // Wait for WebSocket update or refresh
      refresh();
    } catch (e) {
      debugPrint('Error adding to waitlist: $e');
      refresh();
    }
  }

  Future<void> markTableAsAvailable(String tableId) async {
    try {
      // Optimistic update
      final index = state.tables.indexWhere((t) => t.id == tableId);
      if (index != -1) {
        final updatedTables = List<TableInfo>.from(state.tables)
          ..[index] = state.tables[index].copyWith(
            status: TableStatus.available,
            currentOrderTime: null,
          );
        state = state.copyWith(tables: updatedTables);
      }

      await floorPlanRepository.markTableClean(tableId);
    } catch (e) {
      debugPrint('Error marking table clean: $e');
      refresh();
    }
  }

  void toggleEditMode() {
    state = state.copyWith(isEditMode: !state.isEditMode);
  }

  Future<void> updateTablePosition(String tableId, double dx, double dy) async {
    try {
      // Optimistic update
      final index = state.tables.indexWhere((t) => t.id == tableId);
      if (index != -1) {
        final updatedTables = List<TableInfo>.from(state.tables)
          ..[index] = state.tables[index].copyWith(
            posX: dx,
            posY: dy,
          );
        state = state.copyWith(tables: updatedTables);
      }

      await floorPlanRepository.updateTablePosition(tableId, dx, dy);
    } catch (e) {
      debugPrint('Error updating table position: $e');
      refresh();
    }
  }
}

final floorPlanProvider = NotifierProvider<FloorPlanNotifier, FloorPlanState>(
  FloorPlanNotifier.new,
);
