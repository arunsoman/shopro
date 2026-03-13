import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/kds_provider.dart';
import '../widgets/kds_widgets.dart';

class KDSAllDayView extends ConsumerWidget {
  const KDSAllDayView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final kdsState = ref.watch(kdsProvider);
    final allDayItems = kdsState.allDayItems;

    if (allDayItems.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.kitchen_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No active items to prepare', style: TextStyle(color: Colors.grey, fontSize: 18)),
          ],
        ),
      );
    }

    // Group items by category if available, or just list them
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: allDayItems.length,
      itemBuilder: (context, index) {
        return KDSAllDayTile(item: allDayItems[index]);
      },
    );
  }
}
