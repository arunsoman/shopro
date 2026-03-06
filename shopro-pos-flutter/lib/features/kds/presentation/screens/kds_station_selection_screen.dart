import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../domain/models/kds_models.dart';
import '../providers/kds_provider.dart';

class KDSStationSelectionScreen extends ConsumerStatefulWidget {
  const KDSStationSelectionScreen({super.key});

  @override
  ConsumerState<KDSStationSelectionScreen> createState() =>
      _KDSStationSelectionScreenState();
}

class _KDSStationSelectionScreenState
    extends ConsumerState<KDSStationSelectionScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(kdsProvider.notifier).fetchStations();
    });
  }

  @override
  Widget build(BuildContext context) {
    final kdsState = ref.watch(kdsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Select KDS Station'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(kdsProvider.notifier).fetchStations(),
          ),
        ],
      ),
      body: kdsState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : kdsState.error != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Error: ${kdsState.error}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () =>
                        ref.read(kdsProvider.notifier).fetchStations(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : kdsState.stations.isEmpty
          ? const Center(child: Text('No KDS stations found.'))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 1.5,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: kdsState.stations.length,
                itemBuilder: (context, index) {
                  final station = kdsState.stations[index];
                  final isExpo = station.stationType == KDSStationType.EXPO;

                  return InkWell(
                    onTap: () =>
                        context.go('/kds/queue/${station.id}', extra: station),
                    borderRadius: BorderRadius.circular(16),
                    child: Card(
                      color: isExpo ? Colors.amber.shade100 : Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: BorderSide(
                          color: isExpo ? Colors.amber : Colors.grey.shade300,
                          width: 2,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            isExpo ? Icons.hub : Icons.kitchen,
                            size: 48,
                            color: isExpo ? Colors.amber.shade900 : Colors.blue,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            station.name,
                            style: Theme.of(context).textTheme.titleLarge
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          Text(
                            station.stationType.toString().split('.').last,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }
}
