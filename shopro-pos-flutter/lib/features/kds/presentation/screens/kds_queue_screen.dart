import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/kds_models.dart';
import '../providers/kds_provider.dart';
import '../widgets/kds_widgets.dart';
import 'kds_all_day_view.dart';

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

class _KDSQueueScreenState extends ConsumerState<KDSQueueScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    Future.microtask(
      () => ref.read(kdsProvider.notifier).selectStation(widget.stationId),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<KDSState>(kdsProvider, (previous, next) {
      if (next.error != null && next.error != previous?.error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    });

    final kds = ref.watch(kdsProvider);
    final currentStation = kds.stations.firstWhere(
      (s) => s.id == widget.stationId,
      orElse: () => const KDSStation(
          id: '', name: '', stationType: KDSStationType.general, online: false),
    );

    final isExpo = currentStation.stationType == KDSStationType.expo;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        automaticallyImplyLeading: false,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.orange,
          unselectedLabelColor: Colors.grey,
          indicatorColor: Colors.orange,
          indicatorWeight: 3,
          tabs: const [
            Tab(child: Text('QUEUE', style: TextStyle(fontWeight: FontWeight.bold))),
            Tab(child: Text('ALL-DAY', style: TextStyle(fontWeight: FontWeight.bold))),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.black87),
            onPressed: () => ref.read(kdsProvider.notifier).selectStation(widget.stationId),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: kds.isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.orange))
          : kds.error != null
              ? Center(child: Text('Error: ${kds.error}', style: const TextStyle(color: Colors.red)))
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildQueueView(kds, isExpo),
                    const KDSAllDayView(),
                  ],
                ),
    );
  }

  Widget _buildQueueView(KDSState kds, bool isExpo) {
    if (isExpo) {
      if (kds.expoGroups.isEmpty) return _buildEmptyState('No active tables');
      return _buildExpoQueue(kds.expoGroups);
    }

    if (kds.tickets.isEmpty) return _buildEmptyState('No active orders');
    
    return _buildItemGrid(kds.tickets);
  }

  Widget _buildExpoQueue(List<KDSExpoGroup> groups) {
    return ListView.builder(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 20),
      itemCount: groups.length,
      itemBuilder: (context, index) => KDSExpoTableCard(group: groups[index]),
    );
  }

  Widget _buildItemGrid(List<KDSTicket> tickets) {
    // Flatten tickets into item list with firing time and server name
    // Filter out READY and SERVED items for Prep Stations
    final items = tickets.expand((t) => t.items
      .where((i) => i.status != KDSItemStatus.ready && i.status != KDSItemStatus.served)
      .map((i) => (
        item: i, 
        table: t.tableNumber, 
        firedAt: t.firedAt,
        serverName: t.serverName,
    ))).toList();
    
    return GridView.builder(
      padding: const EdgeInsets.all(20),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 250,
        mainAxisExtent: 220, // Increased for server name
        crossAxisSpacing: 20,
        mainAxisSpacing: 20,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final data = items[index];
        return KDSPrepItemCard(
          item: data.item, 
          tableNumber: data.table,
          serverName: data.serverName,
          fallbackStartTime: data.firedAt,
        );
      },
    );
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20),
              ],
            ),
            child: const Icon(Icons.kitchen_outlined, size: 64, color: Colors.orange),
          ),
          const SizedBox(height: 24),
          Text(
            message,
            style: const TextStyle(fontSize: 18, color: Colors.grey, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

}
