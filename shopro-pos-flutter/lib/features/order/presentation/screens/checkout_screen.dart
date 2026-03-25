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
import '../../domain/repositories/order_repository.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  PaymentMethod _selectedMethod = PaymentMethod.mipay;
  bool _isProcessing = false;
  String? _processingStatus;

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

    return Theme(
      data: AppTheme.emeraldTerminal,
      child: Scaffold(
        body: Stack(
          children: [
            Row(
              children: [
                // Left Side: Giant Order List (70%)
                Expanded(
                  flex: 7,
                  child: Container(
                    color: AppColors.emeraldBase,
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildHeader(context, order.orderNumber),
                        const SizedBox(height: AppSpacing.xl),
                        Expanded(
                          child: ListView.separated(
                            itemCount: order.items.length,
                            separatorBuilder: (context, index) => const Divider(color: AppColors.emeraldMuted, height: 32),
                            itemBuilder: (context, index) {
                              final item = order.items[index];
                              return Row(
                                children: [
                                  Text(
                                    '${item.quantity}x',
                                    style: GoogleFonts.jetBrainsMono(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.emeraldAccent,
                                    ),
                                  ),
                                  const SizedBox(width: 24),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item.name.toUpperCase(),
                                          style: GoogleFonts.syne(
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                            color: AppColors.emeraldOffWhite,
                                          ),
                                        ),
                                        if (item.modifiers.isNotEmpty)
                                          Text(
                                            item.modifiers.map((m) => m.label).join(', '),
                                            style: const TextStyle(color: Colors.grey, fontSize: 14),
                                          ),
                                      ],
                                    ),
                                  ),
                                  Text(
                                    '\$${item.calculatedTotal.toStringAsFixed(2)}',
                                    style: GoogleFonts.jetBrainsMono(
                                      fontSize: 20,
                                      color: AppColors.emeraldOffWhite,
                                    ),
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
                        'PAYMENT',
                        style: TextStyle(
                          fontFamily: 'Syne',
                          color: Colors.grey,
                          letterSpacing: 2,
                          fontSize: 12,
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
              Container(
                color: Colors.black.withOpacity(0.7),
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
          ],
        ),
      ),
    );
  }

  Widget _buildTotals(OrderTicket order) {
    return Column(
      children: [
        _totalRow('SUBTOTAL', order.subtotal),
        _totalRow('TAX (HST 13%)', order.taxSummary['HST'] ?? 0.0),
        _totalRow('TAX (GST 5%)', order.taxSummary['GST'] ?? 0.0),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'TOTAL',
              style: GoogleFonts.syne(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.emeraldAccent),
            ),
            Text(
              '\$${order.totalAmount.toStringAsFixed(2)}',
              style: GoogleFonts.jetBrainsMono(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.emeraldOffWhite),
            ),
          ],
        ),
      ],
    );
  }

  Widget _totalRow(String label, double amount) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          Text(
            '\$${amount.toStringAsFixed(2)}',
            style: GoogleFonts.jetBrainsMono(color: AppColors.emeraldOffWhite, fontSize: 14),
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

  Widget _buildHeader(BuildContext context, String orderNum) {
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
              'ORDER #$orderNum • TABLE ${orderNum.split("-").last} • SARAH M.',
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
    setState(() {
      _isProcessing = true;
      _processingStatus = _selectedMethod == PaymentMethod.mipay
          ? 'Initiating MiPay request...'
          : 'Processing ${_selectedMethod.name.toUpperCase()} payment...';
    });

    try {
      if (_selectedMethod == PaymentMethod.mipay) {
        const phoneNumber = '+1 234 567 890';
        final repository = ref.read(orderRepositoryProvider);
        await repository.initiateMiPay(orderId, phoneNumber);

        setState(() => _processingStatus = 'Push notification sent to $phoneNumber');
        await Future.delayed(const Duration(seconds: 2));
        setState(() => _processingStatus = 'Confirming payment receipt...');
        await Future.delayed(const Duration(seconds: 1));
      } else {
        // Collect Payment for Cash/Card/Digital
        await ref.read(orderProvider.notifier).completePayment(_selectedMethod);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment Successful!'),
            backgroundColor: AppColors.emeraldAccent,
          ),
        );

        // Clear active order so it doesn't linger
        ref.read(orderProvider.notifier).clearActiveOrder();

        // Optimistic refresh of floor plan
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
