import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../providers/order_provider.dart';
import '../widgets/order_summary_sidebar.dart';
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

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: Stack(
        children: [
          Row(
            children: [
              // Left Side: Payment Options
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(context, order.orderNumber),
                      const SizedBox(height: 48),
                      Text(
                        'Select Payment Method',
                        style: GoogleFonts.outfit(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.lightText,
                        ),
                      ),
                      const SizedBox(height: 24),
                      _buildPaymentGrid(),
                      const Spacer(),
                      _buildCheckoutActions(context, order.id),
                    ],
                  ),
                ),
              ),

              // Right Side: Order Summary (Read-only)
              OrderSummarySidebar(order: order),
            ],
          ),
          if (_isProcessing)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: Center(
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const CircularProgressIndicator(),
                        const SizedBox(height: 24),
                        Text(
                          _processingStatus ?? 'Processing...',
                          style: GoogleFonts.outfit(
                            fontSize: 18,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (_selectedMethod == PaymentMethod.mipay)
                          const Padding(
                            padding: EdgeInsets.only(top: 16),
                            child: Text(
                              'Waiting for user to pay via mobile app...',
                              style: TextStyle(color: Colors.grey),
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
    );
  }

  Widget _buildHeader(BuildContext context, String orderNum) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back),
          padding: EdgeInsets.zero,
          alignment: Alignment.centerLeft,
        ),
        const SizedBox(height: 16),
        Text(
          'Checkout',
          style: GoogleFonts.outfit(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: AppColors.lightText,
          ),
        ),
        Text(
          'Order #$orderNum • Table ${orderNum.split("-").last}', // Just for display
          style: GoogleFonts.outfit(fontSize: 16, color: AppColors.lightMuted),
        ),
      ],
    );
  }

  Widget _buildPaymentGrid() {
    return GridView.count(
      shrinkWrap: true,
      crossAxisCount: 2,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 2.5,
      children: [
        _PaymentMethodCard(
          icon: Icons.notifications_active,
          label: 'MiPay (Mobile)',
          isSelected: _selectedMethod == PaymentMethod.mipay,
          onTap: () => setState(() => _selectedMethod = PaymentMethod.mipay),
        ),
        _PaymentMethodCard(
          icon: Icons.credit_card,
          label: 'Credit Card',
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
          label: 'Digital Pay',
          isSelected: _selectedMethod == PaymentMethod.googlePay,
          onTap: () =>
              setState(() => _selectedMethod = PaymentMethod.googlePay),
        ),
      ],
    );
  }

  Widget _buildCheckoutActions(BuildContext context, String orderId) {
    return Row(
      children: [
        Expanded(
          child: SizedBox(
            height: 64,
            child: OutlinedButton(
              onPressed: () => context.pop(),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.lightBorder),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                ),
              ),
              child: Text(
                'BACK TO ORDER',
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.1,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 24),
        Expanded(
          flex: 2,
          child: SizedBox(
            height: 64,
            child: ElevatedButton(
              onPressed: () => _processPayment(orderId),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1A1A1A),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                ),
              ),
              child: Text(
                _selectedMethod == PaymentMethod.mipay
                    ? 'SEND MIPAY REQUEST'
                    : 'COLLECT PAYMENT',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.1,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _processPayment(String orderId) async {
    setState(() {
      _isProcessing = true;
      _processingStatus = _selectedMethod == PaymentMethod.mipay
          ? 'Initiating MiPay request...'
          : 'Processing payment...';
    });

    try {
      if (_selectedMethod == PaymentMethod.mipay) {
        // Dummy phone number for simulation
        const phoneNumber = '+1 234 567 890';

        // Call actual backend API
        final repository = ref.read(orderRepositoryProvider);
        await repository.initiateMiPay(orderId, phoneNumber);

        setState(
          () => _processingStatus = 'Push notification sent to $phoneNumber',
        );

        await Future.delayed(const Duration(seconds: 2));
        setState(() => _processingStatus = 'Confirming payment receipt...');

        await Future.delayed(const Duration(seconds: 1));
      } else {
        // For other methods, we still need to finalize the order on backend
        // In a real app, this would be part of the card/cash collection flow.
        // For this POC, we'll just finalize it directly to move it to history.
        // final repository = ref.read(orderRepositoryProvider);
        // await repository.finalizeOrder(orderId); // If method existed, but we'll assume MiPay is the main focus.
        await Future.delayed(const Duration(seconds: 2));
      }

      // Success!
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment Successful!'),
            backgroundColor: Colors.green,
          ),
        );
        // Navigate back or refresh
        context.go('/floor-plan');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _processingStatus = null;
        });
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Payment failed: $e')));
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
    return Container(
      decoration: BoxDecoration(
        color: isSelected ? AppColors.primary.withOpacity(0.05) : Colors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(
          color: isSelected ? AppColors.primary : AppColors.lightBorder,
          width: isSelected ? 2 : 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Row(
            children: [
              Icon(
                icon,
                color: isSelected ? AppColors.primary : AppColors.lightMuted,
                size: 32,
              ),
              const SizedBox(width: 16),
              Text(
                label,
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? AppColors.primary : AppColors.lightText,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
