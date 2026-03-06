import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  String _pin = '';
  bool _isError = false;

  void _handleKeyPress(String key) {
    if (_pin.length < 4) {
      setState(() {
        _pin += key;
        _isError = false;
      });
      if (_pin.length == 4) {
        _submitPin();
      }
    }
  }

  void _handleBackspace() {
    if (_pin.isNotEmpty) {
      setState(() {
        _pin = _pin.substring(0, _pin.length - 1);
        _isError = false;
      });
    }
  }

  Future<void> _submitPin() async {
    final success = await ref.read(authProvider.notifier).login(_pin);
    if (!success) {
      setState(() {
        _pin = '';
        _isError = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.lightBorder,
      body: Center(
        child: Container(
          clipBehavior: Clip.antiAlias,
          decoration: const BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(color: Colors.black12, blurRadius: 20, spreadRadius: 5),
            ],
          ),
          constraints: const BoxConstraints(maxWidth: 1024, maxHeight: 1024),
          child: Row(
            children: [
              // Left Side: Branding (Orange)
              Expanded(
                flex: 4,
                child: Container(
                  color: AppColors.primary,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(
                          AppSpacing.radiusLg,
                        ),
                        child: Image.asset(
                          'assets/images/logo.jpeg',
                          width: 150,
                          height: 150,
                          fit: BoxFit.cover,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Shopro POS',
                        style: Theme.of(context).textTheme.displayMedium
                            ?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Next Generation Point of Sale',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(
                              color: Colors.white.withValues(alpha: 0.8),
                            ),
                      ),
                    ],
                  ),
                ),
              ),
              // Right Side: PIN Entry
              Expanded(
                flex: 6,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 100),
                  color: AppColors.lightBackground,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Welcome Back',
                        style: Theme.of(context).textTheme.headlineMedium
                            ?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.lightText,
                            ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Enter your 4-digit PIN to access POS',
                        style: TextStyle(color: AppColors.lightMuted),
                      ),
                      const SizedBox(height: 48),

                      // PIN Indicators
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(4, (index) {
                          final hasDigit = index < _pin.length;
                          return Container(
                            margin: const EdgeInsets.symmetric(horizontal: 12),
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: hasDigit
                                  ? AppColors.primary
                                  : (_isError
                                        ? AppColors.error.withValues(alpha: 0.2)
                                        : Colors.white),
                              border: Border.all(
                                color: _isError
                                    ? AppColors.error
                                    : (hasDigit
                                          ? AppColors.primary
                                          : AppColors.lightBorder),
                                width: 2,
                              ),
                            ),
                          );
                        }),
                      ),

                      const SizedBox(height: 64),

                      // Keypad
                      SizedBox(
                        width: 350,
                        child: GridView.count(
                          shrinkWrap: true,
                          crossAxisCount: 3,
                          mainAxisSpacing: 24,
                          crossAxisSpacing: 24,
                          childAspectRatio: 1.5,
                          children: [
                            ...[
                              '1',
                              '2',
                              '3',
                              '4',
                              '5',
                              '6',
                              '7',
                              '8',
                              '9',
                            ].map((digit) {
                              return _buildKey(digit);
                            }),
                            const SizedBox.shrink(),
                            _buildKey('0'),
                            _buildBackspace(),
                          ],
                        ),
                      ),

                      if (_isError)
                        Padding(
                          padding: const EdgeInsets.only(top: 32),
                          child: Text(
                            'Invalid PIN. Please try again.',
                            style: TextStyle(
                              color: AppColors.error,
                              fontSize: 14,
                            ),
                          ),
                        ),

                      const SizedBox(height: 48),
                      TextButton(
                        onPressed: () {},
                        child: const Text(
                          'Forgot PIN?',
                          style: TextStyle(color: AppColors.primary),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildKey(String label) {
    return InkWell(
      onTap: () => _handleKeyPress(label),
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          border: Border.all(
            color: AppColors.lightBorder.withValues(alpha: 0.5),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppColors.lightText,
          ),
        ),
      ),
    );
  }

  Widget _buildBackspace() {
    return InkWell(
      onTap: _handleBackspace,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: Container(
        alignment: Alignment.center,
        child: const Icon(
          Icons.backspace_outlined,
          color: AppColors.lightMuted,
          size: 28,
        ),
      ),
    );
  }
}
