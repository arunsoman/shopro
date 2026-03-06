import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/kds_provider.dart';
import '../widgets/kds_widgets.dart';

class KDSQueueScreen extends ConsumerStatefulWidget {
  final String stationId;
  final String stationName;

  const KDSQueueScreen({
    super.key,
    required this.stationId,
    required this.stationName,
  });

  @override
  ConsumerState<KDSQueueScreen> createState() => _KDSQueueScreenState();
}

class _KDSQueueScreenState extends ConsumerState<KDSQueueScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(kdsProvider.notifier).selectStation(widget.stationId),
    );
  }

  @override
  Widget build(BuildContext context) {
    final kds = ref.watch(kdsProvider);

    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: Text('${widget.stationName} Station Queue'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                ref.read(kdsProvider.notifier).selectStation(widget.stationId),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: kds.isLoading
          ? const Center(child: CircularProgressIndicator())
          : kds.error != null
          ? Center(child: Text('Error: ${kds.error}'))
          : kds.tickets.isEmpty
          ? _buildEmptyState()
          : _buildTicketQueue(kds.tickets),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.kitchen, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          const Text(
            'No active tickets in queue',
            style: TextStyle(fontSize: 18, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildTicketQueue(List tickets) {
    return ListView.builder(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.all(16),
      itemCount: tickets.length,
      itemBuilder: (context, index) => Padding(
        padding: const EdgeInsets.only(right: 16),
        child: KDSOrderCard(ticket: tickets[index]),
      ),
    );
  }
}
