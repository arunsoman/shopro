import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/models/floor_models.dart';
import '../providers/floor_plan_provider.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../order/presentation/providers/order_provider.dart';
import '../../../order/domain/models/order_models.dart' show OrderType;
import 'table_widget.dart';

class TableLayoutCanvas extends ConsumerWidget {
  const TableLayoutCanvas({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final floorState = ref.watch(floorPlanProvider);
    final authState = ref.watch(authProvider);

    if (floorState.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    final filteredTables = floorState.tables.where((table) {
      bool sectionMatch = floorState.selectedSection == 'ALL';
      if (!sectionMatch) {
        final section = floorState.sections.firstWhere(
          (s) => s['id'] == table.sectionId,
          orElse: () => {'name': ''},
        );
        sectionMatch = section['name'] == floorState.selectedSection;
      }

      bool staffMatch = true;
      if (floorState.showOnlyMyTables) {
        staffMatch = table.assignedStaffId == authState.staffId;
      }

      return sectionMatch && staffMatch;
    }).toList();

    return Column(
      children: [
        // Persistent Toolbar with Scroll and More menu
        Container(
          height: 60,
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: Color(0xFFE9ECEF))),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F3F5),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          _buildSectionFilter(ref, 'ALL', floorState.selectedSection == 'ALL'),
                          const SizedBox(width: 4),
                          _buildSectionFilter(ref, 'BOOTHS', floorState.selectedSection == 'BOOTHS'),
                          const SizedBox(width: 4),
                          _buildSectionFilter(ref, 'PRIVATE', floorState.selectedSection == 'PRIVATE'),
                          const SizedBox(width: 4),
                          _buildSectionFilter(ref, 'MAIN', floorState.selectedSection == 'MAIN'),
                          const SizedBox(width: 4),
                          _buildSectionFilter(ref, 'BAR', floorState.selectedSection == 'BAR'),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // More Options Menu (3 dots)
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert, color: AppColors.secondary),
                  onSelected: (value) {
                    switch (value) {
                      case 'my_tables':
                        ref.read(floorPlanProvider.notifier).toggleMyTables(true);
                        break;
                      case 'all_tables':
                        ref.read(floorPlanProvider.notifier).toggleMyTables(false);
                        break;
                      case 'map_view':
                        if (floorState.viewMode != FloorViewMode.map) {
                          ref.read(floorPlanProvider.notifier).toggleViewMode();
                        }
                        break;
                      case 'grid_view':
                        if (floorState.viewMode != FloorViewMode.grid) {
                          ref.read(floorPlanProvider.notifier).toggleViewMode();
                        }
                        break;
                    }
                  },
                  itemBuilder: (context) => [
                    PopupMenuItem(
                      value: 'my_tables',
                      child: Row(
                        children: [
                          Icon(
                            Icons.person_outline,
                            size: 20,
                            color: floorState.showOnlyMyTables ? AppColors.primary : AppColors.secondary,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'My Tables',
                            style: GoogleFonts.outfit(
                              fontWeight: floorState.showOnlyMyTables ? FontWeight.bold : FontWeight.normal,
                              color: floorState.showOnlyMyTables ? AppColors.primary : AppColors.lightText,
                            ),
                          ),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'all_tables',
                      child: Row(
                        children: [
                          Icon(
                            Icons.group_outlined,
                            size: 20,
                            color: !floorState.showOnlyMyTables ? AppColors.primary : AppColors.secondary,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'All Tables',
                            style: GoogleFonts.outfit(
                              fontWeight: !floorState.showOnlyMyTables ? FontWeight.bold : FontWeight.normal,
                              color: !floorState.showOnlyMyTables ? AppColors.primary : AppColors.lightText,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const PopupMenuDivider(),
                    PopupMenuItem(
                      value: 'map_view',
                      child: Row(
                        children: [
                          Icon(
                            Icons.map_outlined,
                            size: 20,
                            color: floorState.viewMode == FloorViewMode.map ? AppColors.primary : AppColors.secondary,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'Map View',
                            style: GoogleFonts.outfit(
                              fontWeight: floorState.viewMode == FloorViewMode.map ? FontWeight.bold : FontWeight.normal,
                              color: floorState.viewMode == FloorViewMode.map ? AppColors.primary : AppColors.lightText,
                            ),
                          ),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'grid_view',
                      child: Row(
                        children: [
                          Icon(
                            Icons.grid_view_outlined,
                            size: 20,
                            color: floorState.viewMode == FloorViewMode.grid ? AppColors.primary : AppColors.secondary,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'Grid View',
                            style: GoogleFonts.outfit(
                              fontWeight: floorState.viewMode == FloorViewMode.grid ? FontWeight.bold : FontWeight.normal,
                              color: floorState.viewMode == FloorViewMode.grid ? AppColors.primary : AppColors.lightText,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        // Scrollable Canvas with Expanded
        Expanded(
          child: Stack(
            children: [
              InteractiveViewer(
                boundaryMargin: const EdgeInsets.all(200.0),
                minScale: 0.1,
                maxScale: 2.5,
                constrained: false,
                child: Container(
                  width: 1400,
                  height: 1000,
                  color: const Color(0xFFF8F9FA),
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: CustomPaint(painter: DotGridPainter()),
                      ),

                      if (floorState.viewMode == FloorViewMode.map)
                        ...filteredTables.map((table) {
                          final isDecor = table.shape == TableShape.decor;
                          
                          Widget tableWidget = TableWidget(table: table);
                          
                          // If not decor and not in edit mode, allow selection
                          if (!isDecor && !floorState.isEditMode) {
                            tableWidget = GestureDetector(
                              onTap: () => _handleTableSelection(context, ref, table),
                              child: tableWidget,
                            );
                          }

                          // If in edit mode, wrap with Draggable (unless it's decor)
                          if (floorState.isEditMode && !isDecor) {
                            return Positioned(
                              left: table.posX,
                              top: table.posY,
                              child: Draggable<String>(
                                data: table.id,
                                feedback: Opacity(
                                  opacity: 0.6,
                                  child: tableWidget,
                                ),
                                childWhenDragging: const SizedBox.shrink(),
                                onDragEnd: (details) {
                                  // Convert global position to local canvas position
                                  final RenderBox box = context.findRenderObject() as RenderBox;
                                  final Offset localOffset = box.globalToLocal(details.offset);
                                  
                                  // Adjust for InteractiveViewer scale/translation if needed
                                  // For now, simpler: we assume the canvas is what we drag on
                                  ref.read(floorPlanProvider.notifier).updateTablePosition(
                                    table.id,
                                    localOffset.dx,
                                    localOffset.dy,
                                  );
                                },
                                child: tableWidget,
                              ),
                            );
                          }

                          return Positioned(
                            left: table.posX,
                            top: table.posY,
                            child: tableWidget,
                          );
                        })
                      else
                        Padding(
                          padding: const EdgeInsets.only(
                            top: 80,
                            left: 24,
                            right: 24,
                          ),
                          child: GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 6,
                                  childAspectRatio: 0.85,
                                  crossAxisSpacing: 20,
                                  mainAxisSpacing: 20,
                                ),
                            itemCount: filteredTables.length,
                            itemBuilder: (context, index) =>
                                _buildServerTableCard(
                                  context,
                                  ref,
                                  filteredTables[index],
                                ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),

              // Floating badges outside InteractiveViewer so they stay fixed
              Positioned(
                left: 24,
                bottom: 24,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.9),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.deck_outlined,
                        color: AppColors.lightMuted,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${floorState.tables.where((t) => t.status != TableStatus.available).length} Active • ${floorState.tables.length} Total',
                        style: GoogleFonts.outfit(
                          color: AppColors.lightMuted,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildServerTableCard(
    BuildContext context,
    WidgetRef ref,
    TableInfo table,
  ) {
    final bool isOccupied = table.status == TableStatus.occupied;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isOccupied ? AppColors.primary : const Color(0xFFE9ECEF),
          width: isOccupied ? 2 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            table.name,
            style: GoogleFonts.outfit(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Spacer(),
          ElevatedButton(
            onPressed: () => _handleTableSelection(context, ref, table),
            child: const Text('Select'),
          ),
        ],
      ),
    );
  }


  Widget _buildSectionFilter(WidgetRef ref, String label, bool active) {
    return GestureDetector(
      onTap: () => ref.read(floorPlanProvider.notifier).selectSection(label),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.primary : const Color(0xFFF1F3F5),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: active ? Colors.white : AppColors.lightMuted,
          ),
        ),
      ),
    );
  }

  void _handleTableSelection(
    BuildContext context,
    WidgetRef ref,
    TableInfo table,
  ) async {
    if (table.status == TableStatus.dirty) {
      ref.read(floorPlanProvider.notifier).markTableAsAvailable(table.id);
    } else if (table.status == TableStatus.available) {
      _showSeatingDialog(context, ref, table);
    } else {
      context.go('/table-dashboard', extra: table);
    }
  }

  void _showSeatingDialog(BuildContext context, WidgetRef ref, TableInfo table) {
    showDialog(
      context: context,
      builder: (context) {
        int guestCount = 2; // Default
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: Text('Seat Table ${table.name}', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('How many guests?', style: GoogleFonts.outfit()),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        onPressed: guestCount > 1 ? () => setState(() => guestCount--) : null,
                        icon: const Icon(Icons.remove_circle_outline),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          '$guestCount',
                          style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                      ),
                      IconButton(
                        onPressed: guestCount < table.capacity
                            ? () => setState(() => guestCount++)
                            : null,
                        icon: const Icon(Icons.add_circle_outline),
                      ),
                    ],
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('Cancel', style: GoogleFonts.outfit(color: AppColors.lightMuted)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                  ),
                  onPressed: () async {
                    Navigator.pop(context);
                    await ref.read(orderProvider.notifier).createOrder(
                          tableId: table.id,
                          guestCount: guestCount,
                          orderType: OrderType.dineIn,
                        );
                    if (context.mounted) {
                      context.go('/menu');
                    }
                  },
                  child: Text('Start Order', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }
}

class DotGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFDDE2E5)
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;
    const spacing = 15.0;
    for (double i = spacing; i < size.width; i += spacing) {
      for (double j = spacing; j < size.height; j += spacing) {
        canvas.drawCircle(Offset(i, j), 0.8, paint);
      }
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
