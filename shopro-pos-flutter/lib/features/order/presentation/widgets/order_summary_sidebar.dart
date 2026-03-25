import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../domain/models/order_models.dart';
import '../providers/order_provider.dart';
import 'discount_dialog.dart';
import 'split_dialog.dart';
import '../../../auth/presentation/widgets/manager_pin_dialog.dart';

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
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Left: Vertical Quantity Control — compact, no gaps
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (!isSent)
                    GestureDetector(
                      onTap: () => ref
                          .read(orderProvider.notifier)
                          .updateItemQuantity(item.id, item.quantity + 1),
                      child: const Icon(
                        Icons.keyboard_arrow_up,
                        size: 20,
                        color: AppColors.primary,
                      ),
                    ),
                  Text(
                    '${item.quantity}x',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: AppColors.primary,
                    ),
                  ),
                  if (!isSent)
                    GestureDetector(
                      onTap: () => ref
                          .read(orderProvider.notifier)
                          .updateItemQuantity(item.id, item.quantity - 1),
                      child: const Icon(
                        Icons.keyboard_arrow_down,
                        size: 20,
                        color: AppColors.primary,
                      ),
                    ),
                ],
              ),
              const SizedBox(width: AppSpacing.md),

              // Middle: Item details
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
                          children: item.taxBreakdowns.map((tax) {
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 1),
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

              // Right: Price and Removal
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$${item.calculatedTotal.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  if (item.status == OrderItemStatus.voided)
                    const Padding(
                      padding: EdgeInsets.only(top: 4),
                      child: Text(
                        'VOIDED',
                        style: TextStyle(
                          color: AppColors.error,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  if (item.status == OrderItemStatus.pending)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: GestureDetector(
                        onTap: () => _handleVoidItem(context, ref, item),
                        child: const Icon(
                          Icons.delete_outline,
                          color: AppColors.error,
                          size: 24,
                        ),
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

    final hasSentItems = order!.items.any(
      (i) =>
          i.status != OrderItemStatus.pending &&
          i.status != OrderItemStatus.voided,
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
              onPressed: hasDraftItems
                  ? () => ref.read(orderProvider.notifier).submitOrder()
                  : (canPay ? () => context.push('/checkout') : null),
              style: ElevatedButton.styleFrom(
                backgroundColor: hasDraftItems
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
                  onPressed: () => showDialog(
                    context: context,
                    builder: (context) => SplitDialog(
                      totalAmount: order!.totalAmount,
                      guestCount: order!.coverCount,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding:
                        const EdgeInsets.symmetric(vertical: AppSpacing.md),
                    side: const BorderSide(color: AppColors.lightBorder),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(AppSpacing.radiusMd),
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
                    builder: (context) => DiscountDialog(
                      currentTotal: order!.totalAmount,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding:
                        const EdgeInsets.symmetric(vertical: AppSpacing.md),
                    side: const BorderSide(color: AppColors.lightBorder),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                  ),
                  child: const Text('DISCOUNT'),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          if (order!.status != TicketStatus.paid &&
              order!.status != TicketStatus.voided &&
              !hasSentItems)
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () => _handleCancelOrder(context, ref),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.error,
                  padding:
                      const EdgeInsets.symmetric(vertical: AppSpacing.md),
                ),
                child: const Text(
                  'CANCEL ORDER',
                  style:
                      TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
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
            style:
                const TextStyle(color: AppColors.lightMuted, fontSize: 13),
          ),
          Text(
            '\$${amount.toStringAsFixed(2)}',
            style:
                const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          ),
        ],
      ),
    );
  }

  void _handleCancelOrder(BuildContext context, WidgetRef ref) {
    if (order == null) return;

    if (order!.status == TicketStatus.open) {
      _confirmClear(context, ref);
      return;
    }

    if (order!.isCancellable) {
      _confirmCancel(context, ref);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'This order cannot be cancelled (e.g. already paid)'),
        ),
      );
    }
  }

  void _confirmClear(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Order?'),
        content: const Text(
            'This will remove all items from this unsubmitted order. This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              ref.read(orderProvider.notifier).cancelOrder();
            },
            style:
                ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Clear All'),
          ),
        ],
      ),
    );
  }

  void _confirmCancel(BuildContext context, WidgetRef ref,
      {String? managerPin}) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Order'),
        content: const Text(
            'Are you sure you want to cancel this entire order? This cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('NO, KEEP IT'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ref
                  .read(orderProvider.notifier)
                  .cancelOrder(managerPin: managerPin)
                  .catchError((e) {
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(e.toString()),
                    backgroundColor: AppColors.error,
                  ),
                );
              });
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error),
            child: const Text('YES, CANCEL ORDER'),
          ),
        ],
      ),
    );
  }

  void _handleVoidItem(
      BuildContext context, WidgetRef ref, OrderItem item) {
    if (item.status == OrderItemStatus.pending) {
      ref
          .read(orderProvider.notifier)
          .voidOrderItem(item.id, 'Removed before submission');
      return;
    }

    if (item.isCancellable) {
      _showVoidReason(context, ref, item);
    } else {
      showDialog(
        context: context,
        builder: (context) => ManagerPinDialog(
          onAuthorized: (pin) =>
              _showVoidReason(context, ref, item, managerPin: pin),
        ),
      );
    }
  }

  void _showVoidReason(
      BuildContext context, WidgetRef ref, OrderItem item,
      {String? managerPin}) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Void ${item.name}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Please provide a reason for voiding this item:'),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                hintText: 'e.g., Customer changed mind, Kitchen error',
                border: OutlineInputBorder(),
              ),
              autofocus: true,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () {
              if (controller.text.trim().isEmpty) return;
              Navigator.pop(context);
              ref
                  .read(orderProvider.notifier)
                  .voidOrderItem(
                    item.id,
                    controller.text.trim(),
                    managerPin: managerPin,
                  )
                  .catchError((e) {
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(e.toString()),
                    backgroundColor: AppColors.error,
                  ),
                );
              });
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error),
            child: const Text('VOID ITEM'),
          ),
        ],
      ),
    );
  }
}