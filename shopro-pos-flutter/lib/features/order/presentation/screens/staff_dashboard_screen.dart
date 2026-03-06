import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../providers/order_provider.dart';
import '../../domain/models/order_models.dart';

class StaffDashboardScreen extends ConsumerStatefulWidget {
  const StaffDashboardScreen({super.key});

  @override
  ConsumerState<StaffDashboardScreen> createState() =>
      _StaffDashboardScreenState();
}

class _StaffDashboardScreenState extends ConsumerState<StaffDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(orderProvider.notifier).fetchActiveOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    // In a real app, we'd filter by the current server's ID.
    // For this POC, we'll show all active/ordered tickets.
    final state = ref.watch(orderProvider);
    final orders = state.allOrders
        .where(
          (o) =>
              o.status != TicketStatus.closed &&
              o.status != TicketStatus.voided &&
              o.status !=
                  TicketStatus.paid, // Also hide paid ones from staff dash
        )
        .toList();

    return Scaffold(
      backgroundColor: AppColors.lightBackground,
      appBar: AppBar(
        title: const Text(
          'My Active Orders',
          style: TextStyle(
            color: AppColors.lightText,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${orders.length} ACTIVE',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: state.isLoading && orders.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : orders.isEmpty
          ? _buildEmptyState()
          : Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 400,
                  mainAxisExtent: 200,
                  crossAxisSpacing: AppSpacing.lg,
                  mainAxisSpacing: AppSpacing.lg,
                ),
                itemCount: orders.length,
                itemBuilder: (context, index) {
                  return _OrderDashboardCard(order: orders[index]);
                },
              ),
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.assignment_outlined,
            size: 64,
            color: AppColors.lightMuted.withOpacity(0.5),
          ),
          const SizedBox(height: AppSpacing.md),
          const Text(
            'No active orders assigned to you',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.lightMuted,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Go to the Floor Plan to start a new order.',
            style: TextStyle(color: AppColors.lightMuted),
          ),
        ],
      ),
    );
  }
}

class _OrderDashboardCard extends ConsumerWidget {
  final OrderTicket order;

  const _OrderDashboardCard({required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusColor = _getStatusColor(order.status);

    return InkWell(
      onTap: () {
        // Navigate to the order ticket for modification
        context.push('/orders', extra: order);
      },
      borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(color: AppColors.lightBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Table ${order.tableDisplay ?? order.tableId ?? 'N/A'}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    Text(
                      'Order #${order.orderNumber}',
                      style: const TextStyle(
                        color: AppColors.lightMuted,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    order.status.name.toUpperCase(),
                    style: TextStyle(
                      color: statusColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ),
            const Spacer(),
            Row(
              children: [
                const Icon(
                  Icons.people_outline,
                  size: 16,
                  color: AppColors.lightMuted,
                ),
                const SizedBox(width: 4),
                Text(
                  '${order.coverCount}',
                  style: const TextStyle(color: AppColors.lightMuted),
                ),
                const SizedBox(width: AppSpacing.md),
                const Icon(
                  Icons.access_time,
                  size: 16,
                  color: AppColors.lightMuted,
                ),
                const SizedBox(width: 4),
                Text(
                  _getElapsedTime(order.createdAt),
                  style: const TextStyle(color: AppColors.lightMuted),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${order.items.length} items',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  '\$${order.totalAmount.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
            if (order.status == TicketStatus.ready)
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.md),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      ref.read(orderProvider.notifier).markAsServed(order.id);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      foregroundColor: Colors.white,
                      elevation: 0,
                    ),
                    child: const Text('MARK AS SERVED'),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(TicketStatus status) {
    switch (status) {
      case TicketStatus.open:
        return Colors.orange;
      case TicketStatus.submitted:
        return AppColors.tagSentText;
      case TicketStatus.ready:
        return AppColors.success;
      case TicketStatus.served:
        return Colors.green;
      case TicketStatus.paid:
        return Colors.blue;
      case TicketStatus.closed:
        return AppColors.lightMuted;
      default:
        return AppColors.lightMuted;
    }
  }

  String _getElapsedTime(DateTime createdAt) {
    final diff = DateTime.now().difference(createdAt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inHours >= 1) return '${diff.inHours}h ${diff.inMinutes % 60}m';
    return '${diff.inMinutes}m';
  }
}
