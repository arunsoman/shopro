import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shopro_pos_flutter/core/theme/app_colors.dart';
import 'package:shopro_pos_flutter/core/theme/app_spacing.dart';
import 'package:shopro_pos_flutter/features/order/presentation/providers/order_provider.dart';
import 'package:shopro_pos_flutter/features/order/presentation/widgets/order_summary_sidebar.dart';
import 'package:shopro_pos_flutter/features/menu/presentation/providers/menu_provider.dart';
import 'package:shopro_pos_flutter/features/menu/domain/models/menu_models.dart';
import 'package:shopro_pos_flutter/features/menu/presentation/widgets/modifier_selection_dialog.dart';

class MenuNavigationScreen extends ConsumerStatefulWidget {
  const MenuNavigationScreen({super.key});

  @override
  ConsumerState<MenuNavigationScreen> createState() =>
      _MenuNavigationScreenState();
}

class _MenuNavigationScreenState extends ConsumerState<MenuNavigationScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final menuState = ref.watch(menuProvider);
    final orderState = ref.watch(orderProvider);
    final order = orderState.activeOrder;

    return Scaffold(
      backgroundColor: AppColors.lightBackground,
      body: Row(
        children: [
          // Category Sidebar
          Container(
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
                      final isSelected =
                          menuState.selectedCategoryId == category.id;
                      return ListTile(
                        onTap: () => ref
                            .read(menuProvider.notifier)
                            .selectCategory(category.id),
                        selected: isSelected,
                        selectedTileColor: AppColors.primary.withOpacity(0.08),
                        title: Text(
                          category.name,
                          style: GoogleFonts.outfit(
                            fontWeight: isSelected
                                ? FontWeight.bold
                                : FontWeight.w500,
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.lightText,
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
          ),

          // Main Content
          Expanded(
            child: Column(
              children: [
                // Top Search Bar
                Container(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  color: Colors.white,
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) =>
                        ref.read(menuProvider.notifier).search(val),
                    decoration: InputDecoration(
                      hintText: 'Search menu items...',
                      prefixIcon: const Icon(
                        Icons.search,
                        color: AppColors.lightMuted,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF8F9FA),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(
                          AppSpacing.radiusMd,
                        ),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(vertical: 0),
                    ),
                  ),
                ),

                // Item Grid
                Expanded(
                  child: menuState.isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : GridView.builder(
                          padding: const EdgeInsets.all(AppSpacing.lg),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 3,
                                childAspectRatio: 0.85,
                                crossAxisSpacing: AppSpacing.lg,
                                mainAxisSpacing: AppSpacing.lg,
                              ),
                          itemCount: menuState.items.length,
                          itemBuilder: (context, index) {
                            final item = menuState.items[index];
                            return _MenuItemCard(item: item);
                          },
                        ),
                ),
              ],
            ),
          ),

          // Order Sidebar
          OrderSummarySidebar(order: order),
        ],
      ),
    );
  }
}

class _MenuItemCard extends ConsumerWidget {
  final MenuItem item;

  const _MenuItemCard({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return InkWell(
      onTap: () async {
        if (item.modifierGroups.isNotEmpty) {
          final result = await showDialog<ModifierSelectionResult>(
            context: context,
            builder: (context) => ModifierSelectionDialog(item: item),
          );

          if (result != null) {
            ref
                .read(orderProvider.notifier)
                .addItem(
                  item,
                  modifiers: result.selectedOptions,
                  hasAllergyFlag: result.hasAllergyFlag,
                  customNote: result.customNote,
                  courseNumber: result.courseNumber,
                  subtractions: result.subtractions,
                );
          }
        } else {
          ref.read(orderProvider.notifier).addItem(item);
        }
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          border: Border.all(color: AppColors.lightBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(AppSpacing.radiusMd),
                  ),
                  image: item.photoUrl != null
                      ? DecorationImage(
                          image: NetworkImage(item.photoUrl!),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: item.photoUrl == null
                    ? const Center(
                        child: Icon(Icons.image_outlined, color: Colors.grey),
                      )
                    : null,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '\$${item.basePrice.toStringAsFixed(2)}',
                        style: GoogleFonts.outfit(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.add,
                          color: AppColors.primary,
                          size: 16,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
