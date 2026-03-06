import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/kds_models.dart';
import '../providers/kds_provider.dart';

class KDSOrderCard extends ConsumerWidget {
  final KDSTicket ticket;
  final bool isExpo;

  const KDSOrderCard({super.key, required this.ticket, this.isExpo = false});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final age = DateTime.now().difference(ticket.firedAt);
    final ageColor = _getAgeColor(age);

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      clipBehavior: Clip.antiAlias,
      child: Container(
        width: 300,
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: ageColor, width: 8)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHeader(context, age),
            const Divider(height: 1),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.all(12),
                itemCount: ticket.items.length,
                separatorBuilder: (context, index) => const SizedBox(height: 8),
                itemBuilder: (context, index) => _KDSItemRow(
                  item: ticket.items[index],
                  onTap: () => ref
                      .read(kdsProvider.notifier)
                      .bumpItem(ticket.items[index].id),
                ),
              ),
            ),
            const Divider(height: 1),
            _buildFooter(ref),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, Duration age) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                ticket.tableNumber,
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              Text(
                '${age.inMinutes}m',
                style: TextStyle(
                  color: _getAgeColor(age),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Server: ${ticket.serverName}',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          Text(
            'Ticket #${ticket.id.substring(ticket.id.length - 4)}',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.green,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        onPressed: () => ref.read(kdsProvider.notifier).bumpTicket(ticket.id),
        child: const Text(
          'DONE / BUMP',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Color _getAgeColor(Duration age) {
    if (age.inMinutes < 5) return Colors.blue;
    if (age.inMinutes < 10) return Colors.green;
    if (age.inMinutes < 15) return Colors.orange;
    return Colors.red;
  }
}

class _KDSItemRow extends StatelessWidget {
  final KDSTicketItem item;
  final VoidCallback onTap;

  const _KDSItemRow({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isReady = item.status == KDSItemStatus.READY;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        decoration: BoxDecoration(
          color: isReady ? Colors.green.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isReady ? Colors.green : Colors.grey.shade300,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${item.quantity}x',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    style: TextStyle(
                      decoration: isReady ? TextDecoration.lineThrough : null,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (item.customNote != null && item.customNote!.isNotEmpty)
                    Text(
                      item.customNote!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.grey,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  if (item.modifiers.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 2.0),
                      child: Text(
                        item.modifiers.join(', '),
                        style: const TextStyle(
                          fontSize: 10,
                          color: Colors.orange,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            if (isReady)
              const Icon(Icons.check_circle, color: Colors.green, size: 20),
          ],
        ),
      ),
    );
  }
}
