import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../domain/models/order_models.dart';

class CourseSection extends StatelessWidget {
  final int courseNumber;
  final String courseName;
  final List<OrderItem> items;
  final VoidCallback? onFire;
  final VoidCallback? onAddItems;
  final VoidCallback? onEditItems;

  const CourseSection({
    super.key,
    required this.courseNumber,
    required this.courseName,
    required this.items,
    this.onFire,
    this.onAddItems,
    this.onEditItems,
  });

  @override
  Widget build(BuildContext context) {
    final bool isHolding =
        items.isNotEmpty &&
        items.every((i) => i.status == OrderItemStatus.held);
    final bool isSent =
        items.isNotEmpty && items.any((i) => i.status == OrderItemStatus.sent);
    final bool isEmpty = items.isEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Course $courseNumber — $courseName',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(width: AppSpacing.md),
            _buildStatusBadge(isHolding, isSent, isEmpty),
            const Spacer(),
            if (isHolding && onFire != null)
              ElevatedButton.icon(
                onPressed: onFire,
                icon: const Text('🔥'),
                label: const Text('Fire'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.lg,
                    vertical: AppSpacing.md,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                  ),
                ),
              ),
            if (onEditItems != null && items.isNotEmpty)
              TextButton(
                onPressed: onEditItems,
                child: const Text('Edit Items'),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        if (isEmpty)
          _buildEmptyPlaceholder(context)
        else
          SizedBox(
            height: 140, // Increased height for better fit
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: items.length,
              itemBuilder: (context, index) => Container(
                width: 300, // Fixed width for each item card
                margin: const EdgeInsets.only(right: AppSpacing.md),
                child: OrderItemCard(item: items[index]),
              ),
            ),
          ),
        const SizedBox(height: AppSpacing.xl),
      ],
    );
  }

  Widget _buildStatusBadge(bool isHolding, bool isSent, bool isEmpty) {
    String text = 'PENDING ORDER';
    Color color = AppColors.lightMuted;

    if (isSent) {
      text = 'SENT TO KITCHEN';
      color = AppColors.success;
    } else if (isHolding) {
      text = 'HOLDING';
      color = AppColors.statusOccupied; // Using a blue-ish color for holding
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildEmptyPlaceholder(BuildContext context) {
    return InkWell(
      onTap: onAddItems,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        decoration: BoxDecoration(
          border: Border.all(
            color: AppColors.lightBorder,
            style: BorderStyle.solid, // Dash effect can match later
          ),
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          color: AppColors.lightSurface,
        ),
        child: Center(
          child: Column(
            children: [
              Text(
                'Select $courseName',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              const Text(
                'Click to browse sweet menu',
                style: TextStyle(color: AppColors.lightMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class OrderItemCard extends StatelessWidget {
  final OrderItem item;

  const OrderItemCard({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        side: const BorderSide(color: AppColors.lightBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: AppColors.lightBackground,
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: const Icon(Icons.restaurant, color: AppColors.lightMuted),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    item.name.isEmpty ? 'Unknown Item' : item.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (item.customNote != null && item.customNote!.isNotEmpty)
                    Text(
                      item.customNote!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.lightMuted,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    '\$${item.calculatedTotal.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
            if (item.hasAllergyFlag)
              const Icon(
                Icons.warning_amber_rounded,
                color: AppColors.error,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }
}
