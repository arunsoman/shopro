import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../providers/order_provider.dart';
import '../widgets/order_summary_sidebar.dart';
import '../../domain/models/order_models.dart';
import '../../../menu/presentation/providers/menu_provider.dart';
import '../../../menu/presentation/widgets/category_sidebar.dart';
import '../../../menu/presentation/widgets/menu_item_card.dart';

class UnifiedOrderingScreen extends ConsumerStatefulWidget {
  final OrderTicket? order;
  const UnifiedOrderingScreen({super.key, this.order});

  @override
  ConsumerState<UnifiedOrderingScreen> createState() =>
      _UnifiedOrderingScreenState();
}

class _UnifiedOrderingScreenState extends ConsumerState<UnifiedOrderingScreen> {
  final TextEditingController _searchController = TextEditingController();

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
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final orderState = ref.watch(orderProvider);
    final menuState = ref.watch(menuProvider);
    final order = orderState.activeOrder ?? _getMockOrder();

    return Scaffold(
      backgroundColor: AppColors.lightBackground,
      body: Row(
        children: [
          // 1. Category Sidebar
          const CategorySidebar(),

          // 2. Main Menu Area
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(context, order),
                
                // Search Bar
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.lg,
                    vertical: AppSpacing.md,
                  ),
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

                const Divider(height: 1),

                // Item Grid
                Expanded(
                  child: menuState.isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : GridView.builder(
                          padding: const EdgeInsets.all(AppSpacing.lg),
                          gridDelegate:
                              const SliverGridDelegateWithMaxCrossAxisExtent(
                            maxCrossAxisExtent: 250,
                            childAspectRatio: 0.85,
                            crossAxisSpacing: AppSpacing.lg,
                            mainAxisSpacing: AppSpacing.lg,
                          ),
                          itemCount: menuState.items.length,
                          itemBuilder: (context, index) {
                            final item = menuState.items[index];
                            return MenuItemCard(item: item);
                          },
                        ),
                ),
              ],
            ),
          ),

          // 3. Order Sidebar
          OrderSummarySidebar(order: order),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, OrderTicket order) {
    final isDineIn = order.orderType == OrderType.dineIn && order.tableDisplay != null;

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Row(
        children: [
          if (isDineIn) ...[
            _buildBadge(order.tableDisplay!, AppColors.primary),
            const SizedBox(width: AppSpacing.md),
          ],
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isDineIn 
                  ? 'Table ${order.tableDisplay} Active'
                  : '${order.orderType.name.toUpperCase()} Order #${order.orderNumber}',
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              Row(
                children: [
                  Text(
                    '${_getCourseStatus(order)} • ${order.coverCount} Guests',
                    style: GoogleFonts.outfit(
                      color: AppColors.lightMuted,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(width: 8),
                  _buildOrderTypeBadge(order.orderType),
                ],
              ),
            ],
          ),
          const Spacer(),
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

  Widget _buildOrderTypeBadge(OrderType type) {
    Color color;
    switch (type) {
      case OrderType.dineIn:
        color = Colors.blue;
        break;
      case OrderType.takeaway:
        color = Colors.orange;
        break;
      case OrderType.delivery:
        color = Colors.purple;
        break;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        type.name.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  String _getCourseStatus(OrderTicket order) {
    if (order.items.isEmpty) return 'No items';
    
    final activeItems = order.items.where((i) => i.status != OrderItemStatus.voided).toList();
    if (activeItems.isEmpty) return 'Order Voided';

    if (activeItems.every((i) => i.status == OrderItemStatus.delivered)) {
      return 'All Courses Served';
    }

    final courses = activeItems.map((i) => i.courseNumber).toSet().toList()..sort((a, b) => b.compareTo(a));

    for (final courseNum in courses) {
      final courseItems = activeItems.where((i) => i.courseNumber == courseNum).toList();
      if (courseItems.any((i) => i.status == OrderItemStatus.sent || i.status == OrderItemStatus.ready)) {
        return 'Course $courseNum Preparing';
      }
      if (courseItems.every((i) => i.status == OrderItemStatus.delivered)) {
        return 'Course $courseNum Served';
      }
    }

    return 'Ordering Items';
  }

  Widget _buildBadge(String text, Color color) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Center(
        child: Text(
          text,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
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
      items: [],
    );
  }
}
