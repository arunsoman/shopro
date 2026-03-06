import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/models/floor_models.dart';
import '../providers/floor_plan_provider.dart';

class WaitlistSidebar extends ConsumerWidget {
  const WaitlistSidebar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final floorState = ref.watch(floorPlanProvider);

    return Container(
      width: 250, // Adjusted width based on design
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(right: BorderSide(color: AppColors.lightBorder)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Waitlist',
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: AppColors.lightText,
                      ),
                    ),
                    IconButton(
                      visualDensity: VisualDensity.compact,
                      onPressed: () {},
                      icon: const Icon(Icons.person_add_alt_1, size: 20),
                    ),
                  ],
                ),
                Text(
                  '${floorState.waitlist.length} parties waiting • Est. ${floorState.waitlist.length * 5}m',
                  style: GoogleFonts.outfit(
                    color: AppColors.lightMuted,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Waitlist Entries
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: floorState.waitlist.length,
              itemBuilder: (context, index) {
                final entry = floorState.waitlist[index];
                return _buildWaitlistCard(entry);
              },
            ),
          ),

          // Legend Section
          _buildLegend(),
        ],
      ),
    );
  }

  Widget _buildWaitlistCard(WaitlistEntry entry) {
    // Determine color based on wait time or VIP status for high-fidelity look
    final Color tagColor = entry.isVIP ? AppColors.readyTag : AppColors.waitLow;

    return Draggable<WaitlistEntry>(
      data: entry,
      feedback: Material(
        color: Colors.transparent,
        child: Container(
          width: 220,
          child: _buildCardContent(entry, tagColor, true),
        ),
      ),
      childWhenDragging: Opacity(
        opacity: 0.3,
        child: _buildCardContent(entry, tagColor, false),
      ),
      child: _buildCardContent(entry, tagColor, false),
    );
  }

  Widget _buildCardContent(
    WaitlistEntry entry,
    Color tagColor,
    bool isSelected,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSelected
              ? AppColors.primary
              : AppColors.lightBorder.withValues(alpha: 0.5),
          width: isSelected ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                entry.customerName,
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: isSelected ? AppColors.primary : AppColors.lightText,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isSelected
                      ? tagColor
                      : tagColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  entry.waitTimeDisplay,
                  style: GoogleFonts.outfit(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? Colors.white : tagColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.people, size: 14, color: AppColors.lightMuted),
              const SizedBox(width: 4),
              Text(
                '${entry.partySize} guests',
                style: GoogleFonts.outfit(
                  fontSize: 11,
                  color: AppColors.lightMuted,
                  fontWeight: FontWeight.w500,
                ),
              ),
              if (entry.isVIP) ...[
                const SizedBox(width: 6),
                const Icon(Icons.star, size: 14, color: AppColors.waitLow),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegend() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Color(0xFFFBFBFC),
        border: Border(top: BorderSide(color: AppColors.lightBorder)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              _buildLegendItem('AVAILABLE', AppColors.statusAvailable),
              _buildLegendItem('OCCUPIED', AppColors.statusOccupied),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildLegendItem('ORDERED', AppColors.statusOrdered),
              _buildLegendItem('DELIVERED', AppColors.statusDelivered),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildLegendItem('DIRTY', AppColors.statusDirty),
              _buildLegendItem('HELD', AppColors.statusHeld),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Expanded(
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: GoogleFonts.outfit(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              color: AppColors.lightMuted.withValues(alpha: 0.8),
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
