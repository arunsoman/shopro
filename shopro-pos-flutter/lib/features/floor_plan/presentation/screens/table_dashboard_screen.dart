import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../order/presentation/providers/order_provider.dart';
import '../../../order/domain/models/order_models.dart';
import '../../domain/models/floor_models.dart';

class TableDashboardScreen extends ConsumerStatefulWidget {
  final TableInfo table;

  const TableDashboardScreen({super.key, required this.table});

  @override
  ConsumerState<TableDashboardScreen> createState() =>
      _TableDashboardScreenState();
}

class _TableDashboardScreenState extends ConsumerState<TableDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(orderProvider.notifier).fetchActiveOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(orderProvider);
    final tableOrders = state.allOrders
        .where((o) => o.tableId == widget.table.id)
        .toList();

    return Scaffold(
      backgroundColor: AppColors.lightBackground,
      appBar: AppBar(
        title: Text(
          'Table ${widget.table.name.replaceAll('T-', '')} Dashboard',
          style: const TextStyle(
            color: AppColors.lightText,
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.lightText),
          onPressed: () => context.go('/floor-plan'),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTableInfoCard(),
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${tableOrders.length} ACTIVE ORDERS',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    color: AppColors.lightMuted,
                    letterSpacing: 1.2,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: () => _startNewOrder(context, ref),
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('NEW ORDER'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: state.isLoading && tableOrders.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : tableOrders.isEmpty
                ? _buildEmptyState(context, ref)
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.lg,
                    ),
                    itemCount: tableOrders.length,
                    itemBuilder: (context, index) {
                      return _OrderTile(order: tableOrders[index]);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildTableInfoCard() {
    return Container(
      margin: const EdgeInsets.all(AppSpacing.lg),
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: AppColors.lightBorder),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: AppColors.primary.withOpacity(0.1),
            child: const Icon(
              Icons.table_restaurant,
              color: AppColors.primary,
              size: 30,
            ),
          ),
          const SizedBox(width: AppSpacing.lg),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Status: ${widget.table.status.name.toUpperCase()}',
                style: TextStyle(
                  color: widget.table.status == TableStatus.occupied
                      ? AppColors.primary
                      : AppColors.success,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Capacity: ${widget.table.capacity} Guests',
                style: const TextStyle(
                  color: AppColors.lightMuted,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Assigned to: Server Staff',
                style: TextStyle(color: AppColors.lightMuted, fontSize: 14),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, WidgetRef ref) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('No orders yet for this table.'),
          const SizedBox(height: AppSpacing.md),
          OutlinedButton(
            onPressed: () => _startNewOrder(context, ref),
            child: const Text('START FIRST ORDER'),
          ),
        ],
      ),
    );
  }

  void _startNewOrder(BuildContext context, WidgetRef ref) async {
    try {
      await ref
          .read(orderProvider.notifier)
          .createOrder(
            tableId: widget.table.id,
            guestCount: 1, // Default to 1
            orderType: OrderType.dineIn,
          );

      final orderState = ref.read(orderProvider);
      if (orderState.activeOrder != null && context.mounted) {
        context.go('/menu');
      } else if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Failed to create new order. Backend did not return a valid ticket.',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error creating order: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}

class _OrderTile extends StatelessWidget {
  final OrderTicket order;

  const _OrderTile({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: AppColors.lightBorder),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(AppSpacing.md),
        title: Text(
          'Order #${order.orderNumber}${order.ticketSuffix ?? ''}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              '${order.items.length} items • \$${order.totalAmount.toStringAsFixed(2)}',
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: _getStatusColor(order.status).withOpacity(0.1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                order.status.name.toUpperCase(),
                style: TextStyle(
                  color: _getStatusColor(order.status),
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                ),
              ),
            ),
          ],
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          // Pass the specific order ticket to the menu/order screen
          context.go('/orders', extra: order);
        },
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
      case TicketStatus.paid:
        return Colors.blue;
      default:
        return AppColors.lightMuted;
    }
  }
}
