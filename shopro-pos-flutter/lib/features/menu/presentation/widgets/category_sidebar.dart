import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../providers/menu_provider.dart';

class CategorySidebar extends ConsumerWidget {
  const CategorySidebar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final menuState = ref.watch(menuProvider);

    return Container(
      width: 200,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(right: BorderSide(color: AppColors.lightBorder)),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Text(
              'Categories',
              style: GoogleFonts.outfit(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView.builder(
              itemCount: menuState.categories.length,
              itemBuilder: (context, index) {
                final category = menuState.categories[index];
                final isSelected = menuState.selectedCategoryId == category.id;
                return ListTile(
                  onTap: () =>
                      ref.read(menuProvider.notifier).selectCategory(category.id),
                  selected: isSelected,
                  selectedTileColor: AppColors.primary.withValues(alpha: 0.08),
                  title: Text(
                    category.name,
                    style: GoogleFonts.outfit(
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      color: isSelected ? AppColors.primary : AppColors.lightText,
                    ),
                  ),
                  trailing: isSelected
                      ? const Icon(
                          Icons.chevron_right,
                          color: AppColors.primary,
                          size: 18,
                        )
                      : null,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
