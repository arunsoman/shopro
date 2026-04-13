import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_theme.dart';
import '../providers/order_provider.dart';
import '../../../floor_plan/presentation/providers/floor_plan_provider.dart';
import '../../domain/models/order_models.dart';
import '../../../../core/hardware/printer_service.dart';
import 'package:shopro_pos_flutter/features/order/domain/repositories/order_repository.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  PaymentMethod _selectedMethod = PaymentMethod.mipay;
  bool _isProcessing = false;
  String? _processingStatus;

  Map<String, List<OrderItem>> _groupItemsByTax(List<OrderItem> items) {
    final Map<String, List<OrderItem>> groups = {};
    for (final item in items) {
      final taxKey = item.taxBreakdowns.isEmpty 
          ? 'EXEMPT' 
          : item.taxBreakdowns.map((t) => '${t.ruleName} (${(t.rate * 100).toStringAsFixed(0)}%)').join(' + ');
      
      groups.putIfAbsent(taxKey, () => []).add(item);
    }
    return groups;
  }

  @override
  Widget build(BuildContext context) {
    final orderState = ref.watch(orderProvider);
    final order = orderState.activeOrder;

    if (order == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Checkout')),
        body: const Center(child: Text('No active order')),
      );
    }

    final activeItems = order.items.where((i) => i.status != OrderItemStatus.voided).toList();
    final groupedItems = _groupItemsByTax(activeItems);

    return Theme(
      data: AppTheme.emeraldTerminal,
      child: Scaffold(
        body: Stack(
          children: [
            Row(
              children: [
                // Left Side: Structured Receipt View (70%)
                Expanded(
                  flex: 7,
                  child: Container(
                    color: AppColors.emeraldBase,
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildHeader(context, order),
                        const SizedBox(height: AppSpacing.xl),
                        Expanded(
                          child: ListView.builder(
                            itemCount: groupedItems.length,
                            itemBuilder: (context, groupIndex) {
                              final taxLabel = groupedItems.keys.elementAt(groupIndex);
                              final items = groupedItems[taxLabel]!;
                              
                              // Calculate group subtotal (pre-tax)
                              final groupSubtotal = items.fold<double>(0, (sum, item) => sum + item.calculatedTotal);
                              
                              // Calculate group tax by summing tax breakdowns from all items in this group
                              final groupTax = items.fold<double>(0, (sum, item) {
                                final itemTax = item.taxBreakdowns.fold<double>(0, (taxSum, tb) => taxSum + tb.amount);
                                return sum + itemTax;
                              });
                              
                              // Group total = subtotal + tax
                              final groupTotal = groupSubtotal + groupTax;

                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: AppColors.emeraldAccent.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(4),
                                      border: Border.all(color: AppColors.emeraldAccent.withOpacity(0.3)),
                                    ),
                                    child: Text(
                                      taxLabel.toUpperCase(),
                                      style: GoogleFonts.jetBrainsMono(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.emeraldAccent,
                                        letterSpacing: 1.2,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  ...items.map((item) => Padding(
                                    padding: const EdgeInsets.only(bottom: 16),
                                    child: Row(
                                      children: [
                                        SizedBox(
                                          width: 60,
                                          child: Text(
                                            '${item.quantity}x',
                                            style: GoogleFonts.jetBrainsMono(
                                              fontSize: 20,
                                              fontWeight: FontWeight.bold,
                                              color: AppColors.emeraldAccent,
                                            ),
                                          ),
                                        ),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                item.name.toUpperCase(),
                                                style: GoogleFonts.syne(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.bold,
                                                  color: AppColors.emeraldOffWhite,
                                                ),
                                              ),
                                              if (item.modifiers.isNotEmpty)
                                                Text(
                                                  item.modifiers.map((m) => m.label).join(', '),
                                                  style: TextStyle(color: AppColors.emeraldOffWhite.withOpacity(0.5), fontSize: 13),
                                                ),
                                            ],
                                          ),
                                        ),
                                        Text(
                                          '\$${item.calculatedTotal.toStringAsFixed(2)}',
                                          style: GoogleFonts.jetBrainsMono(
                                            fontSize: 18,
                                            color: AppColors.emeraldOffWhite,
                                          ),
                                        ),
                                      ],
                                    ),
                                  )),
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8, bottom: 32),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        Text(
                                          'GROUP SUBTOTAL: ',
                                          style: GoogleFonts.jetBrainsMono(fontSize: 12, color: AppColors.emeraldMuted),
                                        ),
                                        Text(
                                          '\$${groupSubtotal.toStringAsFixed(2)}',
                                          style: GoogleFonts.jetBrainsMono(fontSize: 14, color: AppColors.emeraldOffWhite, fontWeight: FontWeight.bold),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (groupTax > 0)
                                    Padding(
                                      padding: const EdgeInsets.only(bottom: 8),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          Text(
                                            'GROUP TAX: ',
                                            style: GoogleFonts.jetBrainsMono(fontSize: 12, color: AppColors.emeraldMuted),
                                          ),
                                          Text(
                                            '\$${groupTax.toStringAsFixed(2)}',
                                            style: GoogleFonts.jetBrainsMono(fontSize: 14, color: AppColors.emeraldOffWhite, fontWeight: FontWeight.bold),
                                          ),
                                        ],
                                      ),
                                    ),
                                  if (groupTax > 0)
                                    Padding(
                                      padding: const EdgeInsets.only(bottom: 16),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          Text(
                                            'GROUP TOTAL: ',
                                            style: GoogleFonts.jetBrainsMono(fontSize: 14, color: AppColors.emeraldAccent, fontWeight: FontWeight.bold),
                                          ),
                                          Text(
                                            '\$${groupTotal.toStringAsFixed(2)}',
                                            style: GoogleFonts.jetBrainsMono(fontSize: 16, color: AppColors.emeraldAccent, fontWeight: FontWeight.bold),
                                          ),
                                        ],
                                      ),
                                    ),
                                  if (groupIndex < groupedItems.length - 1)
                                    const Padding(
                                      padding: EdgeInsets.only(bottom: 24),
                                      child: Divider(color: AppColors.emeraldMuted, thickness: 1, height: 1),
                                    ),
                                ],
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Right Side: Slim Totals & Actions (30%)
                Container(
                  width: 380,
                  color: AppColors.emeraldSurface,
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'PAYMENT METHOD',
                        style: TextStyle(
                          fontFamily: 'Syne',
                          color: Colors.grey,
                          letterSpacing: 2,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildPaymentGrid(),
                      const Spacer(),
                      const Divider(color: AppColors.emeraldMuted),
                      const SizedBox(height: 16),
                      _buildTotals(order),
                      const SizedBox(height: 32),
                      _buildMassiveActions(context, order.id),
                    ],
                  ),
                ),
              ],
            ),
            if (_isProcessing)
              BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 4, sigmaY: 4),
                child: Container(
                  color: Colors.black.withOpacity(0.8),
                  child: Center(
                    child: Card(
                      color: AppColors.emeraldSurface,
                      child: Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const CircularProgressIndicator(color: AppColors.emeraldAccent),
                            const SizedBox(height: 24),
                            Text(
                              _processingStatus ?? 'Processing...',
                              style: GoogleFonts.syne(
                                fontSize: 18,
                                fontWeight: FontWeight.w500,
                                color: AppColors.emeraldOffWhite,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTotals(OrderTicket order) {
    return Column(
      children: [
        _totalRow('SUBTOTAL', order.subtotal),
        if (order.discountAmount > 0)
          _totalRow('DISCOUNT', -order.discountAmount, isDiscount: true),
        const SizedBox(height: 8),
        ...order.taxSummary.entries.map((e) => _totalRow('TAX (${e.key})', e.value)),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.emeraldAccent.withOpacity(0.15),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.emeraldAccent, width: 2),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'AMOUNT DUE',
                    style: GoogleFonts.syne(
                      fontSize: 20, 
                      fontWeight: FontWeight.bold, 
                      color: AppColors.emeraldAccent,
                      letterSpacing: 1.5,
                    ),
                  ),
                  Text(
                    '\$${order.totalAmount.toStringAsFixed(2)}',
                    style: GoogleFonts.jetBrainsMono(
                      fontSize: 32, 
                      fontWeight: FontWeight.bold, 
                      color: AppColors.emeraldAccent,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _totalRow(String label, double amount, {bool isDiscount = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: isDiscount ? AppColors.emeraldAccent : Colors.grey, fontSize: 13)),
          Text(
            '${amount < 0 ? "-" : ""}\$${amount.abs().toStringAsFixed(2)}',
            style: GoogleFonts.jetBrainsMono(
              color: isDiscount ? AppColors.emeraldAccent : AppColors.emeraldOffWhite, 
              fontSize: 14,
              fontWeight: isDiscount ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMassiveActions(BuildContext context, String orderId) {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          height: 90,
          child: ElevatedButton(
            onPressed: () => _processPayment(orderId),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.emeraldAccent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: Text(
              _selectedMethod == PaymentMethod.mipay ? 'SEND MIPAY REQUEST' : 'COLLECT PAYMENT',
              style: const TextStyle(fontSize: 20),
            ),
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          height: 60,
          child: OutlinedButton(
            onPressed: () {},
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.emeraldMuted),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              foregroundColor: AppColors.emeraldOffWhite,
            ),
            child: const Text('SPLIT ORDER'),
          ),
        ),
      ],
    );
  }

  Widget _buildHeader(BuildContext context, OrderTicket order) {
    final orderNum = order.orderNumber;
    return Row(
      children: [
        IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.emeraldOffWhite),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'CHECKOUT',
              style: GoogleFonts.syne(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: AppColors.emeraldOffWhite,
              ),
            ),
            Text(
              'ORDER #$orderNum • TABLE ${order.tableDisplay ?? orderNum.split("-").last} • ${order.serverName.toUpperCase()}',
              style: GoogleFonts.jetBrainsMono(fontSize: 14, color: AppColors.emeraldAccent),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPaymentGrid() {
    return GridView.count(
      shrinkWrap: true,
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.8,
      children: [
        _PaymentMethodCard(
          icon: Icons.notifications_active,
          label: 'MiPay',
          isSelected: _selectedMethod == PaymentMethod.mipay,
          onTap: () => setState(() => _selectedMethod = PaymentMethod.mipay),
        ),
        _PaymentMethodCard(
          icon: Icons.credit_card,
          label: 'Card',
          isSelected: _selectedMethod == PaymentMethod.card,
          onTap: () => setState(() => _selectedMethod = PaymentMethod.card),
        ),
        _PaymentMethodCard(
          icon: Icons.money,
          label: 'Cash',
          isSelected: _selectedMethod == PaymentMethod.cash,
          onTap: () => setState(() => _selectedMethod = PaymentMethod.cash),
        ),
        _PaymentMethodCard(
          icon: Icons.qr_code,
          label: 'Digital',
          isSelected: _selectedMethod == PaymentMethod.googlePay,
          onTap: () => setState(() => _selectedMethod = PaymentMethod.googlePay),
        ),
      ],
    );
  }

  Future<void> _processPayment(String orderId) async {
    final order = ref.read(orderProvider).activeOrder;
    if (order == null) return;

    setState(() {
      _isProcessing = true;
      _processingStatus = _selectedMethod == PaymentMethod.mipay
          ? 'Initiating MiPay request...'
          : 'Processing ${_selectedMethod.name.toUpperCase()} payment...';
    });

    try {
      if (_selectedMethod == PaymentMethod.mipay) {
        final phoneNumber = order.customerName ?? 'Customer'; // Using name as placeholder if phone missing
        final repository = ref.read(orderRepositoryProvider);
        await repository.initiateMiPay(orderId, phoneNumber);

        setState(() => _processingStatus = 'Push notification sent to $phoneNumber');
        await Future.delayed(const Duration(seconds: 2));
        setState(() => _processingStatus = 'Confirming payment receipt...');
        await Future.delayed(const Duration(seconds: 1));
      } else {
        await ref.read(orderProvider.notifier).completePayment(_selectedMethod);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment Successful!'),
            backgroundColor: AppColors.emeraldAccent,
          ),
        );
        ref.read(orderProvider.notifier).clearActiveOrder();
        
        // Trigger hardware print & cut on NEXGO EF60
        PrinterService().printReceipt(order).catchError((e) {
          debugPrint('Printer failed: $e');
        });

        ref.read(floorPlanProvider.notifier).refresh();
        context.go('/floor-plan');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _processingStatus = null;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Payment failed: $e')),
        );
      }
    }
  }
}

class _PaymentMethodCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _PaymentMethodCard({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: isSelected ? AppColors.emeraldAccent : AppColors.emeraldSurface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? AppColors.emeraldAccent : AppColors.emeraldMuted),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isSelected ? AppColors.emeraldBase : AppColors.emeraldOffWhite,
              size: 28,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: GoogleFonts.syne(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: isSelected ? AppColors.emeraldBase : AppColors.emeraldOffWhite,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
