import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/models/floor_models.dart';
import '../providers/floor_plan_provider.dart';

class TableWidget extends ConsumerWidget {
  final TableInfo table;

  const TableWidget({super.key, required this.table});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final color = _getStatusColor(table);
    final isRound = table.shape == TableShape.round;
    final isOval = table.shape == TableShape.oval;
    final isDecor = table.shape == TableShape.decor;

    if (isDecor) {
      return Container(
        width: table.width,
        height: table.height,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color(0xFFF8F9FA),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFDEE2E6)),
        ),
        child: Center(
          child: Text(
            table.name,
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(
              color: const Color(0xFFADB5BD),
              fontWeight: FontWeight.bold,
              fontSize: 11,
            ),
          ),
        ),
      );
    }

    final String? initials = table.assignedStaffName
        ?.split(' ')
        .where((part) => part.isNotEmpty)
        .map((part) => part[0].toUpperCase())
        .join('');

    return DragTarget<WaitlistEntry>(
      onWillAcceptWithDetails: (details) =>
          table.status == TableStatus.available,
      onAcceptWithDetails: (details) {
        ref
            .read(floorPlanProvider.notifier)
            .assignPartyToTable(details.data.id, table.id);
      },
      builder: (context, candidateData, rejectedData) {
        final isOver = candidateData.isNotEmpty;

        return Container(
          width: table.width,
          height: table.height,
          decoration: BoxDecoration(
            color: isOver ? color.withValues(alpha: 0.1) : Colors.white,
            shape: (isRound || isOval) ? BoxShape.circle : BoxShape.rectangle,
            borderRadius: (isRound || isOval)
                ? null
                : BorderRadius.circular(16),
            border: Border.all(
              color: isOver ? AppColors.primary : color,
              width: isOver ? 6 : 4,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 12,
                offset: const Offset(4, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                initials != null ? '${table.name} ($initials)' : table.name,
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.bold,
                  fontSize: isOval ? 13 : 15,
                  color: AppColors.lightText,
                ),
              ),
              const SizedBox(height: 2),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.people,
                    color: AppColors.lightMuted,
                    size: 11,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${table.capacity}',
                    style: GoogleFonts.outfit(
                      color: AppColors.lightMuted,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              if (table.currentOrderTime != null)
                Padding(
                  padding: const EdgeInsets.only(top: 6.0),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: table.status == TableStatus.available
                          ? const Color(0xFFE6F9F4)
                          : (table.status == TableStatus.dirty ||
                                table.status == TableStatus.held)
                          ? color.withValues(alpha: 0.1)
                          : const Color(0xFFE8F1FD),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      table.currentOrderTime!,
                      style: GoogleFonts.outfit(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: color,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Color _getStatusColor(TableInfo table) {
    switch (table.status) {
      case TableStatus.available:
        return AppColors.statusAvailable;
      case TableStatus.occupied:
        return AppColors.statusOccupied;
      case TableStatus.ordered:
        return AppColors.statusOrdered;
      case TableStatus.delivered:
        return AppColors.statusDelivered;
      case TableStatus.dirty:
        return AppColors.statusDirty;
      case TableStatus.held:
        return AppColors.statusHeld;
      case TableStatus.inactive:
        return Colors.grey;
    }
  }
}
