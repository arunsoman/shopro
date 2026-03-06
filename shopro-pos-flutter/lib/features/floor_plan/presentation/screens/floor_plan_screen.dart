import 'package:flutter/material.dart';
import '../widgets/waitlist_sidebar.dart';
import '../widgets/table_layout_canvas.dart';

class FloorPlanScreen extends StatelessWidget {
  const FloorPlanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Row(
        children: [
          // Waitlist Sidebar
          const WaitlistSidebar(),

          // Table Canvas
          const Expanded(child: TableLayoutCanvas()),
        ],
      ),
    );
  }
}
