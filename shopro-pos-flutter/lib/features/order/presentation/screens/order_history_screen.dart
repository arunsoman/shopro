import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:shopro_pos_flutter/core/theme/app_colors.dart';
import 'package:shopro_pos_flutter/core/theme/app_spacing.dart';
import 'package:shopro_pos_flutter/features/auth/presentation/widgets/manager_pin_dialog.dart';
import 'package:shopro_pos_flutter/features/order/presentation/providers/order_history_provider.dart';
import 'package:shopro_pos_flutter/features/order/domain/models/order_models.dart';

class OrderHistoryScreen extends ConsumerStatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  ConsumerState<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends ConsumerState<OrderHistoryScreen> {
  OrderTicket? _selectedOrder;
  bool _isAuthorized = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _showPinDialog();
    });
  }

  void _showPinDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => ManagerPinDialog(
        onAuthorized: (pin) {
          setState(() => _isAuthorized = true);
          ref.read(orderHistoryProvider.notifier).fetchHistory();
        },
      ),
    ).then((_) {
      if (!_isAuthorized) {
        // Handle cancellation
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_isAuthorized) {
      return const Scaffold(
        body: Center(child: Text('Authorization Required')),
      );
    }

    final state = ref.watch(orderHistoryProvider);

    return Scaffold(
      backgroundColor: AppColors.lightBackground,
      appBar: AppBar(
        title: const Text('Order History'),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: AppColors.lightText,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                ref.read(orderHistoryProvider.notifier).fetchHistory(),
          ),
          IconButton(
            icon: const Icon(Icons.date_range),
            onPressed: () => _selectDateRange(context),
            tooltip: 'Filter by Date',
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Row(
        children: [
          // Sidebar Filters
          Container(
            width: 250,
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(right: BorderSide(color: AppColors.lightBorder)),
            ),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Filters',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 24),
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Order ID...',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  ),
                  onChanged: (value) {
                    ref
                        .read(orderHistoryProvider.notifier)
                        .fetchHistory(orderId: value.isEmpty ? null : value);
                  },
                ),
                const SizedBox(height: 16),
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Table Label...',
                    prefixIcon: const Icon(Icons.table_restaurant, size: 20),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  ),
                  onChanged: (value) {
                    ref
                        .read(orderHistoryProvider.notifier)
                        .fetchHistory(tableName: value.isEmpty ? null : value);
                  },
                ),
                const Spacer(),
                if (state.startDate != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Date Range:',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.lightMuted,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${DateFormat('MMM dd').format(state.startDate!)} - ${DateFormat('MMM dd').format(state.endDate ?? DateTime.now())}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        TextButton(
                          onPressed: () {
                            ref
                                .read(orderHistoryProvider.notifier)
                                .fetchHistory(startDate: null, endDate: null);
                          },
                          child: const Text(
                            'Clear Filter',
                            style: TextStyle(color: AppColors.error),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          // Main List
          Expanded(
            flex: 2,
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : state.orders.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.history_rounded,
                          size: 64,
                          color: AppColors.lightBorder,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No orders found',
                          style: TextStyle(
                            color: AppColors.lightMuted,
                            fontSize: 18,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(24),
                    itemCount: state.orders.length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final order = state.orders[index];
                      final isSelected = _selectedOrder?.id == order.id;
                      return _buildOrderCard(order, isSelected);
                    },
                  ),
          ),
          // Detail View
          if (_selectedOrder != null)
            Container(
              width: 380,
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(left: BorderSide(color: AppColors.lightBorder)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(-5, 0),
                  ),
                ],
              ),
              child: _buildOrderDetail(_selectedOrder!),
            ),
        ],
      ),
    );
  }

  Widget _buildOrderCard(OrderTicket order, bool isSelected) {
    return InkWell(
      onTap: () => setState(() => _selectedOrder = order),
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.08)
              : Colors.white,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.lightBorder,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.1),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Order #${order.id.substring(0, 8)}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: isSelected ? AppColors.primary : AppColors.lightText,
                  ),
                ),
                _buildStatusBadge(order.status),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(
                  Icons.table_restaurant,
                  size: 16,
                  color: AppColors.lightMuted,
                ),
                const SizedBox(width: 8),
                Text(
                  order.tableDisplay ?? 'No Table',
                  style: const TextStyle(color: AppColors.lightMuted),
                ),
                const SizedBox(width: 24),
                const Icon(Icons.person, size: 16, color: AppColors.lightMuted),
                const SizedBox(width: 8),
                Text(
                  order.serverName,
                  style: const TextStyle(color: AppColors.lightMuted),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  DateFormat('MMM dd, yyyy • hh:mm a').format(order.createdAt),
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.lightMuted,
                  ),
                ),
                Text(
                  '\$${order.totalAmount.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: isSelected ? AppColors.primary : AppColors.lightText,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(TicketStatus status) {
    Color color;
    switch (status) {
      case TicketStatus.paid:
        color = Colors.green;
        break;
      case TicketStatus.served:
        color = Colors.green;
        break;
      case TicketStatus.voided:
        color = Colors.red;
        break;
      case TicketStatus.open:
        color = Colors.blue;
        break;
      default:
        color = AppColors.primary;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.name,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildOrderDetail(OrderTicket order) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: AppColors.lightBorder)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Receipt Details',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => setState(() => _selectedOrder = null),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(24),
            children: [
              const Center(
                child: Padding(
                  padding: EdgeInsets.only(bottom: 24),
                  child: Text(
                    '*** DUPLICATE RECEIPT ***',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppColors.lightMuted,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
              ),
              _buildReceiptRow(
                'Order ID',
                order.id.substring(0, 8),
                isHeader: true,
              ),
              _buildReceiptRow(
                'Date',
                DateFormat('MMM dd, yyyy • hh:mm a').format(order.createdAt),
              ),
              _buildReceiptRow('Staff', order.serverName),
              _buildReceiptRow('Table', order.tableDisplay ?? 'N/A'),
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),
              ...order.items.map(
                (item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${item.quantity}x ${item.name}',
                            style: const TextStyle(fontWeight: FontWeight.w500),
                          ),
                          Text(
                            '\$${(item.unitPrice + item.modifierUpchargeTotal).toStringAsFixed(2)}',
                          ),
                        ],
                      ),
                      if (item.modifiers.isNotEmpty)
                        ...item.modifiers.map(
                          (mod) => Padding(
                            padding: const EdgeInsets.only(left: 20, top: 2),
                            child: Text(
                              '+ ${mod.label}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.lightMuted,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Divider(thickness: 1),
              const SizedBox(height: 16),
              _buildTotalRow(
                'Subtotal',
                '\$${order.subtotal.toStringAsFixed(2)}',
              ),
              _buildTotalRow(
                'Tax (5%)',
                '\$${order.taxAmount.toStringAsFixed(2)}',
              ),
              if (order.discountAmount > 0)
                _buildTotalRow(
                  'Discount',
                  '-\$${order.discountAmount.toStringAsFixed(2)}',
                  isDiscount: true,
                ),
              const SizedBox(height: 12),
              _buildTotalRow(
                'Grand Total',
                '\$${order.totalAmount.toStringAsFixed(2)}',
                isGrandTotal: true,
              ),
              const SizedBox(height: 32),
              const Text(
                'Order Timeline',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 16),
              ...order.auditTimeline.map((entry) => _buildTimelineItem(entry)),
              if (order.auditTimeline.isEmpty)
                const Text(
                  'No timeline data available',
                  style: TextStyle(color: AppColors.lightMuted, fontSize: 12),
                ),
              const SizedBox(height: 64),
              ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Receipt sent to printer...'),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
                icon: const Icon(Icons.print),
                label: const Text('RE-PRINT RECEIPT'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                  ),
                  elevation: 0,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildReceiptRow(String label, String value, {bool isHeader = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: AppColors.lightMuted, fontSize: 13),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: isHeader ? FontWeight.bold : FontWeight.normal,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTotalRow(
    String label,
    String value, {
    bool isGrandTotal = false,
    bool isDiscount = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isGrandTotal ? 18 : 14,
              fontWeight: isGrandTotal ? FontWeight.bold : FontWeight.normal,
              color: isDiscount ? AppColors.error : AppColors.lightText,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isGrandTotal ? 18 : 14,
              fontWeight: isGrandTotal ? FontWeight.bold : FontWeight.normal,
              color: isDiscount
                  ? AppColors.error
                  : (isGrandTotal ? AppColors.primary : AppColors.lightText),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _selectDateRange(BuildContext context) async {
    final state = ref.read(orderHistoryProvider);
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2023),
      lastDate: DateTime.now(),
      initialDateRange: state.startDate != null && state.endDate != null
          ? DateTimeRange(start: state.startDate!, end: state.endDate!)
          : null,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              onSurface: AppColors.lightText,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      ref
          .read(orderHistoryProvider.notifier)
          .fetchHistory(startDate: picked.start, endDate: picked.end);
    }
  }

  Widget _buildTimelineItem(OrderAuditEntry entry) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
              Container(width: 2, height: 30, color: AppColors.lightBorder),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      entry.eventType.replaceAll('_', ' '),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      DateFormat('HH:mm').format(entry.createdAt),
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.lightMuted,
                      ),
                    ),
                  ],
                ),
                Text(
                  entry.details,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.lightMuted,
                  ),
                ),
                Text(
                  'by ${entry.performedBy}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
