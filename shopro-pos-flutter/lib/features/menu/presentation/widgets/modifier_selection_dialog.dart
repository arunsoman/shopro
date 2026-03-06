import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shopro_pos_flutter/core/theme/app_colors.dart';
import 'package:shopro_pos_flutter/core/theme/app_spacing.dart';
import '../../domain/models/menu_models.dart';

class ModifierSelectionResult {
  final List<ModifierOption> selectedOptions;
  final bool hasAllergyFlag;
  final String? customNote;
  final int courseNumber;
  final List<String> subtractions;

  ModifierSelectionResult({
    required this.selectedOptions,
    required this.hasAllergyFlag,
    required this.courseNumber,
    required this.subtractions,
    this.customNote,
  });
}

class ModifierSelectionDialog extends StatefulWidget {
  final MenuItem item;

  const ModifierSelectionDialog({super.key, required this.item});

  @override
  State<ModifierSelectionDialog> createState() =>
      _ModifierSelectionDialogState();
}

class _ModifierSelectionDialogState extends State<ModifierSelectionDialog> {
  final Map<String, List<String>> _selectedOptionIds =
      {}; // groupId -> list of optionIds
  int _courseNumber = 1;
  final List<String> _selectedSubtractions = [];
  bool _hasAllergyFlag = false;
  final TextEditingController _noteController = TextEditingController();

  static const List<String> _commonSubtractions = [
    'No Onions',
    'No Tomato',
    'No Cheese',
    'No Mayo',
    'No Pickles',
    'No Lettuce',
  ];

  @override
  void initState() {
    super.initState();
    for (var group in widget.item.modifierGroups) {
      _selectedOptionIds[group.id] = [];
    }
  }

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  bool get _isSelectionValid {
    for (var group in widget.item.modifierGroups) {
      if (group.required) {
        final selections = _selectedOptionIds[group.id] ?? [];
        if (selections.isEmpty) return false;
        if (selections.length < group.minSelections) return false;
      }
    }
    return true;
  }

  void _toggleOption(ModifierGroup group, ModifierOption option) {
    setState(() {
      final currentSelections = _selectedOptionIds[group.id] ?? [];
      if (currentSelections.contains(option.id)) {
        currentSelections.remove(option.id);
      } else {
        if (group.maxSelections == 1) {
          currentSelections.clear();
          currentSelections.add(option.id);
        } else if (currentSelections.length < group.maxSelections) {
          currentSelections.add(option.id);
        }
      }
      _selectedOptionIds[group.id] = currentSelections;
    });
  }

  void _toggleSubtraction(String sub) {
    setState(() {
      if (_selectedSubtractions.contains(sub)) {
        _selectedSubtractions.remove(sub);
      } else {
        _selectedSubtractions.add(sub);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
      ),
      child: Container(
        width: 650,
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.85,
        ),
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.item.name,
                        style: GoogleFonts.outfit(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppColors.lightText,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Customize your order',
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          color: AppColors.lightMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),
            Flexible(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Modifiers
                    ...widget.item.modifierGroups.map(
                      (group) => _buildModifierGroup(group),
                    ),

                    const Divider(height: AppSpacing.xxl),

                    // Subtractions (US-2.3)
                    _buildSubtractionsSection(),

                    const Divider(height: AppSpacing.xxl),

                    // Course Selection (US-3.3 - Course Management)
                    _buildCourseSelection(),

                    const Divider(height: AppSpacing.xxl),

                    // Allergy Toggle (US-2.3)
                    _buildAllergyToggle(),

                    const SizedBox(height: AppSpacing.xl),

                    // Special Instructions (US-2.4)
                    _buildSpecialInstructions(),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            _buildAddButton(context),
          ],
        ),
      ),
    );
  }

  Widget _buildSubtractionsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Subtractions (NO Items)',
          style: GoogleFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.lightText,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Wrap(
          spacing: AppSpacing.sm,
          runSpacing: AppSpacing.sm,
          children: _commonSubtractions.map((sub) {
            final isSelected = _selectedSubtractions.contains(sub);
            return FilterChip(
              label: Text(sub, style: GoogleFonts.outfit(fontSize: 13)),
              selected: isSelected,
              onSelected: (_) => _toggleSubtraction(sub),
              selectedColor: Colors.red.withOpacity(0.1),
              checkmarkColor: Colors.red,
              labelStyle: TextStyle(
                color: isSelected ? Colors.red : AppColors.lightText,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildCourseSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select Course',
          style: GoogleFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.lightText,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [1, 2, 3, 4].map((value) {
            final isSelected = _courseNumber == value;
            return Padding(
              padding: const EdgeInsets.only(right: 12),
              child: ChoiceChip(
                label: Text('Course $value', style: GoogleFonts.outfit()),
                selected: isSelected,
                onSelected: (val) {
                  if (val) setState(() => _courseNumber = value);
                },
                selectedColor: AppColors.primary,
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : AppColors.lightText,
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildAllergyToggle() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            const Icon(
              Icons.warning_amber_rounded,
              color: AppColors.primary,
              size: 24,
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Flag as Allergy',
                  style: GoogleFonts.outfit(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.lightText,
                  ),
                ),
                Text(
                  'Notify kitchen of severe allergy',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: AppColors.lightMuted,
                  ),
                ),
              ],
            ),
          ],
        ),
        Switch.adaptive(
          value: _hasAllergyFlag,
          activeColor: AppColors.primary,
          onChanged: (val) => setState(() => _hasAllergyFlag = val),
        ),
      ],
    );
  }

  Widget _buildSpecialInstructions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Special Instructions',
          style: GoogleFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.lightText,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        TextField(
          controller: _noteController,
          maxLength: 100,
          maxLines: 2,
          decoration: InputDecoration(
            hintText: 'e.g. Extra spicy, sauce on the side...',
            hintStyle: GoogleFonts.outfit(
              color: AppColors.lightMuted,
              fontSize: 14,
            ),
            filled: true,
            fillColor: const Color(0xFFF8F9FA),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              borderSide: BorderSide.none,
            ),
            counterStyle: GoogleFonts.outfit(fontSize: 12),
          ),
          onChanged: (val) => setState(() {}),
        ),
      ],
    );
  }

  Widget _buildAddButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: _isSelectionValid
            ? () {
                final List<ModifierOption> allSelected = [];
                for (var group in widget.item.modifierGroups) {
                  final selectedIds = _selectedOptionIds[group.id] ?? [];
                  allSelected.addAll(
                    group.options.where((o) => selectedIds.contains(o.id)),
                  );
                }
                Navigator.pop(
                  context,
                  ModifierSelectionResult(
                    selectedOptions: allSelected,
                    hasAllergyFlag: _hasAllergyFlag,
                    courseNumber: _courseNumber,
                    subtractions: _selectedSubtractions,
                    customNote: _noteController.text.trim().isEmpty
                        ? null
                        : _noteController.text.trim(),
                  ),
                );
              }
            : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.lightBorder,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
        ),
        child: Text(
          'Add to Order',
          style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildModifierGroup(ModifierGroup group) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              group.name,
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.lightText,
              ),
            ),
            if (group.required) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'REQUIRED',
                  style: GoogleFonts.outfit(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        Wrap(
          spacing: AppSpacing.md,
          runSpacing: AppSpacing.md,
          children: group.options.map((option) {
            final isSelected = (_selectedOptionIds[group.id] ?? []).contains(
              option.id,
            );
            return _buildOptionChip(group, option, isSelected);
          }).toList(),
        ),
        const SizedBox(height: AppSpacing.xl),
      ],
    );
  }

  Widget _buildOptionChip(
    ModifierGroup group,
    ModifierOption option,
    bool isSelected,
  ) {
    return InkWell(
      onTap: () => _toggleOption(group, option),
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withOpacity(0.05)
              : Colors.white,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.lightBorder,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              option.label,
              style: GoogleFonts.outfit(
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? AppColors.primary : AppColors.lightText,
              ),
            ),
            if (option.upchargeAmount > 0) ...[
              const SizedBox(width: 8),
              Text(
                '+\$${option.upchargeAmount.toStringAsFixed(2)}',
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  color: isSelected ? AppColors.primary : AppColors.lightMuted,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
