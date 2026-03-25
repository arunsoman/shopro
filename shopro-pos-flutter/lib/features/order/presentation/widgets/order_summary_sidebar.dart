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
                    color: AppColors.primary.withValues(alpha: 0.1),
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
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.sm,
            vertical: 4,
          ),
          decoration: BoxDecoration(
            color: AppColors.lightBackground,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            'COURSE $courseNum',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 11,
              color: AppColors.lightMuted,
              letterSpacing: 1.2,
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        ...items.map((item) => _buildVerticalItemRow(context, ref, item)),
        const SizedBox(height: AppSpacing.lg),
      ],
    );
  }

  Widget _buildVerticalItemRow(
    BuildContext context,
    WidgetRef ref,
    OrderItem item,
  ) {
    final isSent = item.status != OrderItemStatus.pending;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${item.quantity}x',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    if (item.modifiers.isNotEmpty)
                      ...item.modifiers.map(
                        (m) => Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(
                            '+ ${m.label}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.lightMuted,
                            ),
                          ),
                        ),
                      ),
                    // Nested Tax Breakdowns
                    if (item.taxBreakdowns.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 6, left: 4),
                        child: Column(
                          children:
                              item.taxBreakdowns.map((tax) {
                                return Padding(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 1,
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(
                                        Icons.subdirectory_arrow_right,
                                        size: 10,
                                        color: AppColors.lightMuted,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${tax.ruleName} (${(tax.rate * 100).toStringAsFixed(0)}%)',
                                        style: const TextStyle(
                                          fontSize: 10,
                                          color: AppColors.lightMuted,
                                          fontStyle: FontStyle.italic,
                                        ),
                                      ),
                                      const Spacer(),
                                      Text(
                                        '\$${tax.amount.toStringAsFixed(2)}',
                                        style: const TextStyle(
                                          fontSize: 10,
                                          color: AppColors.lightMuted,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }).toList(),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    children: [
                      if (item.status != OrderItemStatus.voided)
                        IconButton(
                          icon: const Icon(Icons.close, size: 16, color: Colors.red),
                          onPressed: () => _voidItem(context, ref, item),
                          tooltip: 'Void Item',
                        ),
                      Text(
                        '\$${item.calculatedTotal.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  if (!isSent)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Row(
                        children: [
                          _QuantityButton(
                            icon: Icons.remove,
                            onTap:
                                () => ref
                                    .read(orderProvider.notifier)
                                    .updateItemQuantity(
                                      item.id,
                                      item.quantity - 1,
                                    ),
                          ),
                          const SizedBox(width: 8),
                          _QuantityButton(
                            icon: Icons.add,
                            onTap:
                                () => ref
                                    .read(orderProvider.notifier)
                                    .updateItemQuantity(
                                      item.id,
                                      item.quantity + 1,
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
        const Divider(height: 1, color: AppColors.lightBorder),
      ],
    );
  }


  Widget _buildFooter(BuildContext context, WidgetRef ref) {
    final hasDraftItems = order!.items.any(
      (i) => i.status == OrderItemStatus.pending,
    );

    final allServedOrVoided = order!.items.every(
      (i) =>
          i.status == OrderItemStatus.delivered ||
          i.status == OrderItemStatus.voided,
    );

    final canPay = !hasDraftItems && allServedOrVoided;

    String buttonText = 'PAY NOW';
    if (hasDraftItems) {
      buttonText = 'SEND TO KITCHEN';
    } else if (!allServedOrVoided) {
      buttonText = 'WAITING FOR SERVICE';
    }

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          _buildTotalRow('Subtotal', order!.subtotal),
          ...order!.taxSummary.entries.map((e) {
            return _buildTotalRow(e.key, e.value);
          }),
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
                  color: Color(0xFF1E293B),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton(
              onPressed:
                  hasDraftItems
                      ? () => ref.read(orderProvider.notifier).submitOrder()
                      : (canPay ? () => context.push('/checkout') : null),
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    hasDraftItems
                        ? AppColors.primary
                        : (canPay
                            ? const Color(0xFF1E293B)
                            : AppColors.lightMuted),
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                ),
              ),
              child: Text(
                buttonText,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed:
                      () => showDialog(
                        context: context,
                        builder:
                            (context) => SplitDialog(
                              totalAmount: order!.totalAmount,
                              guestCount: order!.coverCount,
                            ),
                      ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      vertical: AppSpacing.md,
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
                  onPressed:
                      () => showDialog(
                        context: context,
                        builder:
                            (context) => DiscountDialog(
                              currentTotal: order!.totalAmount,
                            ),
                      ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      vertical: AppSpacing.md,
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
          const SizedBox(height: AppSpacing.md),
          if (order!.status != TicketStatus.paid &&
              order!.status != TicketStatus.voided)
            SizedBox(
              width: double.infinity,
              child: TextButton.icon(
                onPressed: () => _cancelWholeOrder(context, ref),
                icon:
                    const Icon(Icons.delete_outline, color: Colors.red, size: 20),
                label: const Text(
                  'CANCEL ORDER',
                  style:
                      TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                ),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTotalRow(String label, double amount) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: AppColors.lightMuted, fontSize: 13),
          ),
          Text(
            '\$${amount.toStringAsFixed(2)}',
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          ),
        ],
      ),
    );
  }

  Future<void> _voidItem(
    BuildContext context,
    WidgetRef ref,
    OrderItem item,
  ) async {
    final reasonController = TextEditingController();
    final pinController = TextEditingController();

    final confirmed = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text('Void ${item.name}'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: reasonController,
                  decoration: const InputDecoration(
                    labelText: 'Reason for voiding',
                  ),
                  autofocus: true,
                ),
                if (!item.isCancellable &&
                    item.status != OrderItemStatus.pending) ...[
                  const SizedBox(height: 16),
                  const Text(
                    'Preparation has started. Manager PIN required.',
                    style: TextStyle(color: Colors.red, fontSize: 12),
                  ),
                  TextField(
                    controller: pinController,
                    obscureText: true,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Manager PIN'),
                  ),
                ],
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('CANCEL'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('VOID', style: TextStyle(color: Colors.red)),
              ),
            ],
          ),
    );

    if (confirmed == true) {
      await ref
          .read(orderProvider.notifier)
          .voidOrderItem(
            item.id,
            reasonController.text,
            managerPin:
                pinController.text.isNotEmpty ? pinController.text : null,
          );
    }
  }

  Future<void> _cancelWholeOrder(BuildContext context, WidgetRef ref) async {
    final pinController = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Cancel Whole Order?'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('This will void the entire ticket and sync with KDS.'),
                if (!order!.isCancellable &&
                    order!.status != TicketStatus.open) ...[
                  const SizedBox(height: 16),
                  const Text(
                    'Kitchen has started preparation. Manager PIN required.',
                    style: TextStyle(color: Colors.red, fontSize: 12),
                  ),
                  TextField(
                    controller: pinController,
                    obscureText: true,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Manager PIN'),
                  ),
                ],
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('BACK'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text(
                  'CONFIRM CANCEL',
                  style: TextStyle(color: Colors.red),
                ),
              ),
            ],
          ),
    );

    if (confirmed == true) {
      await ref
          .read(orderProvider.notifier)
          .cancelOrder(
            order!.id,
            managerPin:
                pinController.text.isNotEmpty ? pinController.text : null,
          );
    }
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
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.lightBorder),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 20, color: AppColors.lightMuted),
      ),
    );
  }
}
