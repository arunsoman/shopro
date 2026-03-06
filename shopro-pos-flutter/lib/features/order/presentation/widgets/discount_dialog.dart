import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';

class DiscountDialog extends StatefulWidget {
  final double currentTotal;

  const DiscountDialog({super.key, required this.currentTotal});

  @override
  State<DiscountDialog> createState() => _DiscountDialogState();
}

class _DiscountDialogState extends State<DiscountDialog> {
  final TextEditingController _amountController = TextEditingController();
  bool _isPercentage = true;
  String? _reason;

  final List<String> _commonReasons = [
    'Happy Hour',
    'Manager Comp',
    'Staff Meal',
    'Customer Satisfaction',
    'Waste',
  ];

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
      ),
      child: Container(
        width: 450,
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Apply Discount',
              style: GoogleFonts.outfit(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            Row(
              children: [
                Expanded(
                  child: _buildTypeButton(
                    '% Percentage',
                    _isPercentage,
                    () => setState(() => _isPercentage = true),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _buildTypeButton(
                    '\$ Fixed Amount',
                    !_isPercentage,
                    () => setState(() => _isPercentage = false),
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.xl),

            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: _isPercentage
                    ? 'Discount Percentage (%)'
                    : 'Discount Amount (\$)',
                hintText: _isPercentage ? 'e.g. 10' : 'e.g. 5.00',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                ),
                prefixIcon: Icon(
                  _isPercentage ? Icons.percent : Icons.attach_money,
                ),
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            Text(
              'Select Reason',
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _commonReasons.map((r) {
                final isSelected = _reason == r;
                return ChoiceChip(
                  label: Text(r, style: GoogleFonts.outfit(fontSize: 12)),
                  selected: isSelected,
                  onSelected: (val) => setState(() => _reason = val ? r : null),
                  selectedColor: AppColors.primary,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppColors.lightText,
                  ),
                );
              }).toList(),
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
                      final val = double.tryParse(_amountController.text) ?? 0;
                      if (val > 0) {
                        Navigator.pop(context, {
                          'amount': val,
                          'isPercentage': _isPercentage,
                          'reason': _reason,
                        });
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(
                          AppSpacing.radiusMd,
                        ),
                      ),
                    ),
                    child: const Text('APPLY'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeButton(String label, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withOpacity(0.05)
              : Colors.white,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.lightBorder,
            width: 2,
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.bold,
            color: isSelected ? AppColors.primary : AppColors.lightMuted,
          ),
        ),
      ),
    );
  }
}
