import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../menu/presentation/providers/menu_providers.dart';
import '../../../session/presentation/providers/session_providers.dart';
import '../domain/payment_models.dart';

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
    final cartItems = ref.watch(cartProvider);
    // Calculate total from cart items
    final total = cartItems.fold(0.0, (sum, item) => sum + item.total);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: Text(
          'Checkout',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSummaryCard(total),
                const SizedBox(height: 32),
                Text(
                  'Select Payment Method',
                  style: GoogleFonts.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                Expanded(child: _buildPaymentList()),
                const SizedBox(height: 24),
                _buildPayButton(),
              ],
            ),
          ),
          if (_isProcessing)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: Center(
                child: Card(
                  margin: const EdgeInsets.all(32),
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const CircularProgressIndicator(),
                        const SizedBox(height: 24),
                        Text(
                          _processingStatus ?? 'Processing...',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.outfit(
                            fontSize: 18,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (_selectedMethod == PaymentMethod.mipay)
                          const Padding(
                            padding: EdgeInsets.only(top: 16),
                            child: Text(
                              'Please complete the payment on your mobile phone after receiving the notification.',
                              textAlign: TextAlign.center,
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

  Widget _buildSummaryCard(double total) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(
          8,
        ), // Hardcoded for safety if AppSpacing is tricky
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Total Amount',
            style: GoogleFonts.outfit(color: Colors.white70, fontSize: 18),
          ),
          Text(
            '\$${total.toStringAsFixed(2)}',
            style: GoogleFonts.outfit(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentList() {
    final methods = [
      {
        'method': PaymentMethod.mipay,
        'label': 'MiPay (Push to Mobile)',
        'icon': Icons.notifications_active,
        'subtitle': 'Quick & Secure Mobile Payment',
      },
      {
        'method': PaymentMethod.card,
        'label': 'Credit / Debit Card',
        'icon': Icons.credit_card,
        'subtitle': 'Visa, Mastercard, Amex',
      },
      {
        'method': PaymentMethod.googlePay,
        'label': 'Google Pay',
        'icon': Icons.account_balance_wallet,
        'subtitle': 'Fast checkout with Google',
      },
      {
        'method': PaymentMethod.applePay,
        'label': 'Apple Pay',
        'icon': Icons.apple,
        'subtitle': 'Secure checkout with Apple',
      },
    ];

    return ListView.separated(
      itemCount: methods.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final m = methods[index];
        final isSelected = _selectedMethod == m['method'];
        return InkWell(
          onTap: () =>
              setState(() => _selectedMethod = m['method'] as PaymentMethod),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isSelected
                  ? const Color(0xFFFFF7F2)
                  : Colors.white, // Hardcoded AppColors fallback
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isSelected
                    ? const Color(0xFFFF6B00)
                    : const Color(0xFFEEEEEE),
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  m['icon'] as IconData,
                  color: isSelected ? const Color(0xFFFF6B00) : Colors.grey,
                  size: 32,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        m['label'] as String,
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isSelected
                              ? const Color(0xFFFF6B00)
                              : Colors.black,
                        ),
                      ),
                      Text(
                        m['subtitle'] as String,
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isSelected)
                  const Icon(Icons.check_circle, color: Color(0xFFFF6B00)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPayButton() {
    return SizedBox(
      width: double.infinity,
      height: 64,
      child: ElevatedButton(
        onPressed: _processPayment,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFFF6B00),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: Text(
          _selectedMethod == PaymentMethod.mipay
              ? 'PROCEED WITH MIPAY'
              : 'PAY NOW',
          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Future<void> _processPayment() async {
    setState(() {
      _isProcessing = true;
      _processingStatus = _selectedMethod == PaymentMethod.mipay
          ? 'Initiating MiPay request...'
          : 'Connecting to payment gateway...';
    });

    try {
      if (_selectedMethod == PaymentMethod.mipay) {
        // 1. Submit order first to get orderId
        final orderId = await ref.read(cartProvider.notifier).submitOrder();
        if (orderId == null) throw Exception("Failed to create order");

        // 2. Initiate MiPay
        final dio = ref.read(dioProvider);
        await dio.post(
          '/payments/mipay/initiate',
          data: {
            'orderId': orderId,
            'phoneNumber': '+1 234 567 891', // POC default for tableside
          },
        );

        await Future.delayed(const Duration(seconds: 1));
        setState(
          () =>
              _processingStatus = 'Notification sent to your registered phone',
        );

        await Future.delayed(const Duration(seconds: 2));
        setState(
          () => _processingStatus = 'Thank you! Finalizing your order...',
        );

        await Future.delayed(const Duration(seconds: 1));
      } else {
        // Submit order first then simulate other payment
        await ref.read(cartProvider.notifier).submitOrder();
        await Future.delayed(const Duration(seconds: 2));
      }

      if (mounted) {
        // Success
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment Successful! Thank you.'),
            backgroundColor: Colors.green,
          ),
        );
        // Navigate to success or home
        final tableId = ref.read(sessionProvider).tableId;
        context.go('/?tableId=$tableId');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _processingStatus = null;
        });
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }
}
