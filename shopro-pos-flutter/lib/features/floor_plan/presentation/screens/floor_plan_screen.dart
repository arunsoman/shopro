import 'package:flutter/material.dart';
import '../widgets/waitlist_sidebar.dart';
import '../widgets/table_layout_canvas.dart';
import '../widgets/floor_plan_header.dart';

class FloorPlanScreen extends StatelessWidget {
  const FloorPlanScreen({super.key});

  @override
  Widget build(BuildContext context) {
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
