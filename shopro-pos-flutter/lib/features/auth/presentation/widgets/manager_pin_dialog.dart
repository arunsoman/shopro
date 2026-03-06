import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';

class ManagerPinDialog extends StatefulWidget {
  final Function(String) onAuthorized;

  const ManagerPinDialog({super.key, required this.onAuthorized});

  @override
  State<ManagerPinDialog> createState() => _ManagerPinDialogState();
}

class _ManagerPinDialogState extends State<ManagerPinDialog> {
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

  void _submitPin() {
    // In a real app, we would verify the PIN with the backend/manager flag
    // For now, we'll accept any 4-digit PIN for demonstration,
    // or we could check against a specific "Manager" PIN if defined.
    if (_pin == '1234') {
      // Example Manager PIN
      widget.onAuthorized(_pin);
      Navigator.of(context).pop();
    } else {
      setState(() {
        _pin = '';
        _isError = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        width: 400,
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppColors.lightBackground,
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.lock_person_rounded,
              size: 48,
              color: AppColors.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'Manager Authorization',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Enter Manager PIN to access Order History',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.lightMuted),
            ),
            const SizedBox(height: 32),
            // PIN Indicators
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(4, (index) {
                final hasDigit = index < _pin.length;
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  width: 16,
                  height: 16,
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
            const SizedBox(height: 32),
            // Keypad
            GridView.count(
              shrinkWrap: true,
              crossAxisCount: 3,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.5,
              children: [
                ...['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) {
                  return _buildKey(digit);
                }),
                const SizedBox.shrink(),
                _buildKey('0'),
                _buildBackspace(),
              ],
            ),
            if (_isError)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Text(
                  'Invalid Manager PIN',
                  style: TextStyle(color: AppColors.error, fontSize: 14),
                ),
              ),
            const SizedBox(height: 24),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text(
                'Cancel',
                style: TextStyle(color: AppColors.lightMuted),
              ),
            ),
          ],
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
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 20,
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
          size: 24,
        ),
      ),
    );
  }
}
