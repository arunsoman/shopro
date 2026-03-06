import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../providers/order_provider.dart';
import '../widgets/course_section.dart';
import '../widgets/order_summary_sidebar.dart';
import '../../domain/models/order_models.dart';

class OrderCourseManagementScreen extends ConsumerStatefulWidget {
  final OrderTicket? order;
  const OrderCourseManagementScreen({super.key, this.order});

  @override
  ConsumerState<OrderCourseManagementScreen> createState() =>
      _OrderCourseManagementScreenState();
}

class _OrderCourseManagementScreenState
    extends ConsumerState<OrderCourseManagementScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.order != null) {
        ref.read(orderProvider.notifier).setActiveOrder(widget.order!);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // For demo, we'll use a mock if activeOrder is null
    final orderState = ref.watch(orderProvider);
    final order = orderState.activeOrder ?? _getMockOrder();

    return Scaffold(
      backgroundColor: AppColors.lightBackground,
      body: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(context, order),
                _buildTabs(),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Column(
                      children: [
                        CourseSection(
                          courseNumber: 1,
                          courseName: 'Appetizers',
                          items: order.items
                              .where((i) => i.courseNumber == 1)
                              .toList(),
                          onAddItems: () => context.go('/menu'),
                          onEditItems: () => context.go('/menu'),
                        ),
                        CourseSection(
                          courseNumber: 2,
                          courseName: 'Mains',
                          items: order.items
                              .where((i) => i.courseNumber == 2)
                              .toList(),
                          onAddItems: () => context.go('/menu'),
                          onFire: () =>
                              ref.read(orderProvider.notifier).fireCourse(2),
                        ),
                        CourseSection(
                          courseNumber: 3,
                          courseName: 'Desserts',
                          items: order.items
                              .where((i) => i.courseNumber == 3)
                              .toList(),
                          onAddItems: () => context.go('/menu'),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          OrderSummarySidebar(order: order),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, OrderTicket order) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Row(
        children: [
          _buildTableBadge(order.tableDisplay ?? 'T-12'),
          const SizedBox(width: AppSpacing.md),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Table ${order.tableDisplay} Active',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              Text(
                'Course 1 Out • ${order.coverCount} Guests • Server: ${order.serverName}',
                style: const TextStyle(
                  color: AppColors.lightMuted,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const Spacer(),
          OutlinedButton(
            onPressed: () {},
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.lightBorder),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              ),
            ),
            child: const Text('Move Table'),
          ),
          const SizedBox(width: AppSpacing.md),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              ),
            ),
            child: const Text('Change Status'),
          ),
        ],
      ),
    );
  }

  Widget _buildTableBadge(String table) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Center(
        child: Text(
          table,
          style: const TextStyle(
            color: AppColors.primary,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
      ),
    );
  }

  Widget _buildTabs() {
    return Container(
      color: Colors.white,
      child: const Row(
        children: [
          _TabItem(label: 'Dine-in', isActive: true),
          _TabItem(label: 'Takeaway'),
          _TabItem(label: 'Delivery'),
        ],
      ),
    );
  }

  OrderTicket _getMockOrder() {
    return OrderTicket(
      id: '1',
      orderNumber: '10294',
      status: TicketStatus.open,
      orderType: OrderType.dineIn,
      tableDisplay: 'T-12',
      serverId: 'alex',
      serverName: 'Alex',
      coverCount: 4,
      subtotal: 82.50,
      taxAmount: 8.25,
      tipAmount: 4.40,
      discountAmount: 0,
      totalAmount: 95.15,
      createdAt: DateTime.now(),
      items: [
        OrderItem(
          id: '101',
          menuItemId: 'm1',
          name: 'Golden Spring Rolls',
          quantity: 2,
          unitPrice: 12.00,
          modifierUpchargeTotal: 0,
          calculatedTotal: 24.00,
          status: OrderItemStatus.sent,
          courseNumber: 1,
        ),
        OrderItem(
          id: '102',
          menuItemId: 'm2',
          name: 'Classic Caesar Salad',
          quantity: 1,
          unitPrice: 14.50,
          modifierUpchargeTotal: 0,
          calculatedTotal: 14.50,
          status: OrderItemStatus.sent,
          courseNumber: 1,
        ),
        OrderItem(
          id: '201',
          menuItemId: 'm3',
          name: 'Grilled Ribeye Steak',
          quantity: 1,
          unitPrice: 42.00,
          modifierUpchargeTotal: 2.00,
          calculatedTotal: 44.00,
          status: OrderItemStatus.held,
          courseNumber: 2,
          customNote: 'Medium Rare',
        ),
      ],
    );
  }
}

class _TabItem extends StatelessWidget {
  final String label;
  final bool isActive;

  const _TabItem({required this.label, this.isActive = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.xl,
        vertical: AppSpacing.md,
      ),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: isActive ? AppColors.primary : Colors.transparent,
            width: 2,
          ),
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: isActive ? AppColors.primary : AppColors.lightMuted,
          fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
        ),
      ),
    );
  }
}
