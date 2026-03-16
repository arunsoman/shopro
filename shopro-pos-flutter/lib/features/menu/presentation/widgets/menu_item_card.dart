import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../order/presentation/providers/order_provider.dart';
import '../../domain/models/menu_models.dart';
import 'modifier_selection_dialog.dart';

class MenuItemCard extends ConsumerWidget {
  final MenuItem item;

  const MenuItemCard({super.key, required this.item});

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
            ref.read(orderProvider.notifier).addItem(
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
              color: Colors.black.withValues(alpha: 0.04),
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
                          color: AppColors.primary.withValues(alpha: 0.1),
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
