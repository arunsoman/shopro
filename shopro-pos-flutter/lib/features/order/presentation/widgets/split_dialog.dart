import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';

class SplitDialog extends StatefulWidget {
  final double totalAmount;
  final int guestCount;

  const SplitDialog({
    super.key,
    required this.totalAmount,
    required this.guestCount,
  });

  @override
  State<SplitDialog> createState() => _SplitDialogState();
}

class _SplitDialogState extends State<SplitDialog> {
  int _splitCount = 2;

  @override
  void initState() {
    super.initState();
    _splitCount = widget.guestCount > 1 ? widget.guestCount : 2;
  }

  @override
  Widget build(BuildContext context) {
    final amountPerPerson = widget.totalAmount / _splitCount;

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
      ),
      child: Container(
        width: 400,
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Split Bill',
              style: GoogleFonts.outfit(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            Text(
              'Total: \$${widget.totalAmount.toStringAsFixed(2)}',
              style: GoogleFonts.outfit(
                fontSize: 18,
                color: AppColors.lightMuted,
              ),
            ),

            const SizedBox(height: AppSpacing.xxl),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildAdjustButton(
                  Icons.remove,
                  () => setState(
                    () => _splitCount = (_splitCount > 1) ? _splitCount - 1 : 1,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Column(
                    children: [
                      Text(
                        '$_splitCount',
                        style: GoogleFonts.outfit(
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Guests',
                        style: GoogleFonts.outfit(color: AppColors.lightMuted),
                      ),
                    ],
                  ),
                ),
                _buildAdjustButton(
                  Icons.add,
                  () => setState(() => _splitCount++),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.xxl),

            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: const Color(0xFFF8F9FA),
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Price Per Guest',
                    style: GoogleFonts.outfit(fontWeight: FontWeight.w500),
                  ),
                  Text(
                    '\$${amountPerPerson.toStringAsFixed(2)}',
                    style: GoogleFonts.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xxl),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(
                          AppSpacing.radiusMd,
                        ),
                      ),
                    ),
                    child: const Text('CANCEL'),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context, _splitCount);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1A1A1A),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(
                          AppSpacing.radiusMd,
                        ),
                      ),
                    ),
                    child: const Text('SPLIT BILL'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdjustButton(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.lightBorder),
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        ),
        child: Icon(icon, size: 32),
      ),
    );
  }
}
