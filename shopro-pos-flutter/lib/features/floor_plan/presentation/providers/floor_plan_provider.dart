import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/floor_models.dart';
import '../../domain/repositories/floor_plan_repository.dart';

enum FloorViewMode { map, grid }

class FloorPlanState {
  final List<TableInfo> tables;
  final List<WaitlistEntry> waitlist;
  final List<Map<String, dynamic>> sections;
  final String selectedSection;
  final bool showOnlyMyTables;
  final FloorViewMode viewMode;
  final bool isLoading;

  FloorPlanState({
    required this.tables,
    required this.waitlist,
    this.sections = const [],
    this.selectedSection = 'ALL',
    this.showOnlyMyTables = false,
    this.viewMode = FloorViewMode.map,
    this.isLoading = false,
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
  }) {
    return FloorPlanState(
      tables: tables ?? this.tables,
      waitlist: waitlist ?? this.waitlist,
      sections: sections ?? this.sections,
      selectedSection: selectedSection ?? this.selectedSection,
      showOnlyMyTables: showOnlyMyTables ?? this.showOnlyMyTables,
      viewMode: viewMode ?? this.viewMode,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class FloorPlanNotifier extends Notifier<FloorPlanState> {
  @override
  FloorPlanState build() {
    // Proactively fetch on build
    Future.microtask(() => refresh());
    return FloorPlanState(
      tables: [], // Start empty, wait for refresh
      waitlist: [],
      selectedSection: 'ALL',
      showOnlyMyTables: false,
      viewMode: FloorViewMode.map,
      isLoading: true,
    );
  }

  Future<void> refresh() async {
    try {
      state = state.copyWith(isLoading: true);
      final tables = await floorPlanRepository.getTables();
      final sections = await floorPlanRepository.getSections();

      state = state.copyWith(
        tables: tables,
        waitlist: _mockWaitlist,
        sections: sections,
        isLoading: false,
      );
    } catch (e) {
      // Fallback to minimal mock if error
      state = state.copyWith(
        tables: _mockTables,
        waitlist: _mockWaitlist,
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

  void assignPartyToTable(String waitlistId, String tableId) {
    // 1. Find the waitlist entry
    final waitlistIndex = state.waitlist.indexWhere((e) => e.id == waitlistId);
    if (waitlistIndex == -1) return;

    // 2. Find the table
    final tableIndex = state.tables.indexWhere((t) => t.id == tableId);
    if (tableIndex == -1) return;
    final table = state.tables[tableIndex];

    // US-4.1 Guard: Only allow seating at AVAILABLE or HELD tables
    if (table.status != TableStatus.available &&
        table.status != TableStatus.held) {
      print('DEBUG: Cannot seat party. Table ${table.name} is ${table.status}');
      return;
    }

    // 3. Update table status to occupied
    final updatedTable = table.copyWith(
      status: TableStatus.occupied,
      currentOrderTime: 'Just now',
    );

    // 4. Update waitlist entry status to seated (or remove)
    final updatedWaitlist = List<WaitlistEntry>.from(state.waitlist)
      ..removeAt(waitlistIndex);

    final updatedTables = List<TableInfo>.from(state.tables)
      ..[tableIndex] = updatedTable;

    state = state.copyWith(tables: updatedTables, waitlist: updatedWaitlist);
  }

  void markTableAsAvailable(String tableId) {
    final index = state.tables.indexWhere((t) => t.id == tableId);
    if (index == -1) return;
    final table = state.tables[index];

    // Only allow Available if it was Dirty
    if (table.status != TableStatus.dirty) return;

    final updatedTable = table.copyWith(
      status: TableStatus.available,
      currentOrderTime: null,
    );

    final updatedTables = List<TableInfo>.from(state.tables)
      ..[index] = updatedTable;

    state = state.copyWith(tables: updatedTables);
  }

  static final List<TableInfo> _mockTables = [
    TableInfo(
      id: '1',
      name: 'T-01',
      capacity: 4,
      status: TableStatus.available,
      posX: 100,
      posY: 100,
      width: 120,
      height: 120,
    ),
    TableInfo(
      id: '2',
      name: 'T-02',
      capacity: 2,
      status: TableStatus.occupied,
      posX: 300,
      posY: 100,
      width: 120,
      height: 120,
    ),
    TableInfo(
      id: '3',
      name: 'T-03',
      capacity: 8,
      status: TableStatus.ordered,
      posX: 500,
      posY: 100,
      width: 250,
      height: 120,
      currentOrderTime: '12m ago',
    ),
    TableInfo(
      id: '4',
      name: 'R-01',
      capacity: 2,
      status: TableStatus.delivered,
      posX: 100,
      posY: 300,
      width: 120,
      height: 120,
      currentOrderTime: '45m ago',
    ),
    TableInfo(
      id: '5',
      name: 'T-04',
      capacity: 4,
      status: TableStatus.dirty,
      posX: 300,
      posY: 300,
      width: 120,
      height: 120,
    ),
    TableInfo(
      id: '6',
      name: 'T-05',
      capacity: 4,
      status: TableStatus.held,
      posX: 500,
      posY: 300,
      width: 120,
      height: 120,
    ),
  ];

  static final List<WaitlistEntry> _mockWaitlist = [
    WaitlistEntry(
      id: 'w1',
      customerName: 'Miller Party',
      partySize: 4,
      waitTimeDisplay: '15m wait',
      status: WaitlistStatus.waiting,
    ),
    WaitlistEntry(
      id: 'w2',
      customerName: 'Thompson',
      partySize: 2,
      waitTimeDisplay: '42m wait',
      status: WaitlistStatus.waiting,
    ),
    WaitlistEntry(
      id: 'w3',
      customerName: 'Sarah Jenkins',
      partySize: 6,
      waitTimeDisplay: 'READY',
      status: WaitlistStatus.ready,
      isVIP: true,
    ),
    WaitlistEntry(
      id: 'w4',
      customerName: 'Henderson',
      partySize: 2,
      waitTimeDisplay: '5m wait',
      status: WaitlistStatus.waiting,
    ),
  ];
}

final floorPlanProvider = NotifierProvider<FloorPlanNotifier, FloorPlanState>(
  FloorPlanNotifier.new,
);
