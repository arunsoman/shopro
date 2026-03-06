import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../domain/models/order_models.dart';
import '../providers/order_provider.dart';
import 'discount_dialog.dart';
import 'split_dialog.dart';

class OrderSummarySidebar extends ConsumerWidget {
  final OrderTicket? order;

  const OrderSummarySidebar({super.key, this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (order == null) {
      return Container(
        width: 350,
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(left: BorderSide(color: AppColors.lightBorder)),
        ),
        child: const Center(
          child: Text(
            'No active order',
            style: TextStyle(color: AppColors.lightMuted),
          ),
        ),
      );
    }

    final itemsByCourse = <int, List<OrderItem>>{};
    for (final item in order!.items) {
      itemsByCourse.putIfAbsent(item.courseNumber, () => []).add(item);
    }

    return Container(
      width: 350,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(left: BorderSide(color: AppColors.lightBorder)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Order Summary',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    Text(
                      'Order #${order!.orderNumber}',
                      style: const TextStyle(
                        color: AppColors.lightMuted,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  ),
                  child: Text(
                    '${order!.items.length} Items',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: itemsByCourse.keys.length,
              itemBuilder: (context, index) {
                final courseNum = itemsByCourse.keys.elementAt(index);
                final items = itemsByCourse[courseNum]!;
                return _buildCourseGroup(context, ref, courseNum, items);
              },
            ),
          ),
          const Divider(height: 1),
          _buildFooter(context, ref),
        ],
      ),
    );
  }

  Widget _buildCourseGroup(
    BuildContext context,
    WidgetRef ref,
    int courseNum,
    List<OrderItem> items,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
          child: Text(
            'COURSE $courseNum',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 12,
              color: AppColors.lightMuted,
              letterSpacing: 1,
            ),
          ),
        ),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: items.map((item) {
              return _buildHorizontalItemCard(context, ref, item);
            }).toList(),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
      ],
    );
  }

  Widget _buildHorizontalItemCard(
    BuildContext context,
    WidgetRef ref,
    OrderItem item,
  ) {
    final isSent = item.status != OrderItemStatus.pending;

    return Container(
      width: 200,
      height:
          150, // Fixed height to prevent Spacer/Expanded from crashing in vertical ListView
      margin: const EdgeInsets.only(right: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: isSent
            ? AppColors.lightBackground
            : AppColors.primary.withOpacity(0.05),
        border: Border.all(
          color: isSent ? AppColors.lightBorder : AppColors.primary,
        ),
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment:
            MainAxisAlignment.spaceBetween, // Use alignment instead of Spacer
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${item.quantity}x',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  item.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (item.modifiers.isNotEmpty)
            ...item.modifiers
                .take(2)
                .map(
                  (m) => Text(
                    '+ ${m.label}',
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppColors.lightMuted,
                    ),
                  ),
                ),
          if (item.modifiers.length > 2)
            const Text(
              '...',
              style: TextStyle(fontSize: 10, color: AppColors.lightMuted),
            ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: _getStatusColor(item.status).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  item.status.name.toUpperCase(),
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: _getStatusColor(item.status),
                  ),
                ),
              ),
              Text(
                '\$${item.calculatedTotal.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          if (!isSent) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _QuantityButton(
                  icon: Icons.remove,
                  onTap: () => ref
                      .read(orderProvider.notifier)
                      .updateItemQuantity(item.id, item.quantity - 1),
                ),
                const SizedBox(width: 16),
                _QuantityButton(
                  icon: Icons.add,
                  onTap: () => ref
                      .read(orderProvider.notifier)
                      .updateItemQuantity(item.id, item.quantity + 1),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Color _getStatusColor(OrderItemStatus status) {
    switch (status) {
      case OrderItemStatus.sent:
        return AppColors.tagSentText;
      case OrderItemStatus.held:
        return AppColors.tagHoldingText;
      case OrderItemStatus.ready:
        return AppColors.success;
      case OrderItemStatus.delivered:
        return Colors.blue;
      case OrderItemStatus.voided:
        return Colors.red;
      default:
        return AppColors.lightMuted;
    }
  }

  Widget _buildFooter(BuildContext context, WidgetRef ref) {
    final hasDraftItems = order!.items.any(
      (i) => i.status == OrderItemStatus.pending,
    );

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          _buildTotalRow('Subtotal', order!.subtotal),
          _buildTotalRow('Tax (5%)', order!.taxAmount),
          if (order!.discountAmount > 0)
            _buildTotalRow('Discount', -order!.discountAmount),
          const SizedBox(height: AppSpacing.md),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Total Amount',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              Text(
                '\$${order!.totalAmount.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                  color: Color(0xFF1A1A1A),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // Primary Action: Send to Kitchen or Pay (US-4.1)
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: hasDraftItems
                  ? () => ref.read(orderProvider.notifier).submitOrder()
                  : () => context.push('/checkout'),
              style: ElevatedButton.styleFrom(
                backgroundColor: hasDraftItems
                    ? AppColors.primary
                    : const Color(0xFF1A2233),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                ),
              ),
              child: Text(
                hasDraftItems ? 'SEND TO KITCHEN' : 'PAY NOW',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => showDialog(
                    context: context,
                    builder: (context) => SplitDialog(
                      totalAmount: order!.totalAmount,
                      guestCount: order!.coverCount,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      vertical: AppSpacing.lg,
                    ),
                    side: const BorderSide(color: AppColors.lightBorder),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                  ),
                  child: const Text('SPLIT'),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => showDialog(
                    context: context,
                    builder: (context) =>
                        DiscountDialog(currentTotal: order!.totalAmount),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      vertical: AppSpacing.lg,
                    ),
                    side: const BorderSide(color: AppColors.lightBorder),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                  ),
                  child: const Text('DISCOUNT'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTotalRow(String label, double amount) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.lightMuted)),
          Text('\$${amount.toStringAsFixed(2)}'),
        ],
      ),
    );
  }
}

class _QuantityButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _QuantityButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      child: Container(
        padding: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.lightBorder),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Icon(icon, size: 16, color: AppColors.lightMuted),
      ),
    );
  }
}
