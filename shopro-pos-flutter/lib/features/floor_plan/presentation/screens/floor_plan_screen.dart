import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/floor_plan_provider.dart';
import '../widgets/waitlist_sidebar.dart';
import '../widgets/table_layout_canvas.dart';
import '../widgets/floor_plan_header.dart';

class FloorPlanScreen extends ConsumerWidget {
  const FloorPlanScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen<FloorPlanState>(floorPlanProvider, (previous, next) {
      if (next.error != null && next.error != previous?.error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
        ref.read(floorPlanProvider.notifier).clearError();
      }
    });

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: const FloorPlanHeader(),
      body: Row(
        children: [
          // Table Canvas
          const Expanded(child: TableLayoutCanvas()),

          // Waitlist Sidebar (on the Right per US-3.1)
          const WaitlistSidebar(),
        ],
      ),
    );
  }
}
