import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:shopro_tableside_app/core/theme/app_colors.dart';
import 'package:shopro_tableside_app/core/theme/app_spacing.dart';
import 'package:flutter_animate/flutter_animate.dart';

class FeedbackDialog extends StatefulWidget {
  final String itemName;
  final Function(int rating, String comment) onSubmit;

  const FeedbackDialog({
    super.key,
    required this.itemName,
    required this.onSubmit,
  });

  static void show(BuildContext context, String itemName, Function(int rating, String comment) onSubmit) {
    showDialog(
      context: context,
      builder: (context) => FeedbackDialog(itemName: itemName, onSubmit: onSubmit),
    );
  }

  @override
  State<FeedbackDialog> createState() => _FeedbackDialogState();
}

class _FeedbackDialogState extends State<FeedbackDialog> {
  int _rating = 0;
  final TextEditingController _commentController = TextEditingController();

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Text('Rate your ${widget.itemName}', textAlign: TextAlign.center),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'How was your meal?',
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: AppSpacing.m),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (index) {
              final starIndex = index + 1;
              return IconButton(
                icon: Icon(
                  starIndex <= _rating ? LucideIcons.star : LucideIcons.star,
                  color: starIndex <= _rating ? Colors.amber : Colors.grey[300],
                  fill: starIndex <= _rating ? 1 : 0,
                ),
                onPressed: () => setState(() => _rating = starIndex),
              ).animate(target: starIndex <= _rating ? 1 : 0).scale(duration: 200.ms);
            }),
          ),
          const SizedBox(height: AppSpacing.m),
          TextField(
            controller: _commentController,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Any specific feedback?',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              filled: true,
              fillColor: Colors.black.withValues(alpha: 0.02),
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _rating == 0
              ? null
              : () {
                  widget.onSubmit(_rating, _commentController.text);
                  Navigator.pop(context);
                },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: const Text('Submit'),
        ),
      ],
    );
  }
}
