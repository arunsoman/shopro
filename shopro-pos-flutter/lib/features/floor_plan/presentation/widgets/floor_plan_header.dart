import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/floor_plan_provider.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class FloorPlanHeader extends ConsumerWidget implements PreferredSizeWidget {
  const FloorPlanHeader({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final floorState = ref.watch(floorPlanProvider);
    final authState = ref.watch(authProvider);
    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppColors.lightBorder)),
      ),
      child: Row(
        children: [
          // Floor Plan header label or just spacer
          Text(
            'Floor Plan',
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.bold,
              fontSize: 18,
              color: AppColors.lightMuted,
            ),
          ),

          const Spacer(),

          // Edit Layout Toggle (US-1.1) - Gated by Role
          if (authState.role == 'MANAGER' || authState.role == 'ADMIN')
            _buildActionButton(
              label: floorState.isEditMode ? 'Save Layout' : 'Edit Layout',
              icon: floorState.isEditMode ? Icons.save_outlined : Icons.edit_outlined,
              active: floorState.isEditMode,
              onTap: () => ref.read(floorPlanProvider.notifier).toggleEditMode(),
            ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String label,
    required IconData icon,
    required bool active,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: active ? AppColors.primary : const Color(0xFFF1F3F5),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 18,
              color: active ? Colors.white : AppColors.lightMuted,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.outfit(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: active ? Colors.white : AppColors.lightMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

}
