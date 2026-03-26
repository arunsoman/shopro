import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/kds_models.dart';
import '../providers/kds_provider.dart';

class KDSRenderingUtils {
  static Color getAgeColor(DateTime startedAt, DateTime now) {
    final difference = now.difference(startedAt).inMinutes;
    if (difference >= 15) return Colors.redAccent;
    if (difference >= 10) return Colors.orangeAccent;
    return Colors.greenAccent;
  }

  static String formatDuration(DateTime startedAt, DateTime now) {
    final difference = now.difference(startedAt);
    final minutes = difference.inMinutes;
    final seconds = difference.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  static BoxDecoration glassDecoration(BuildContext context, {Color? color}) {
    return BoxDecoration(
      color: (color ?? Colors.white).withOpacity(0.9),
      borderRadius: BorderRadius.circular(16),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          blurRadius: 10,
          offset: const Offset(0, 4),
        ),
      ],
      border: Border.all(color: Colors.white.withOpacity(0.2)),
    );
  }
}

class KDSOrderCard extends ConsumerWidget {
  final KDSTicket ticket;
  final bool isExpo;

  const KDSOrderCard({super.key, required this.ticket, this.isExpo = false});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final kdsState = ref.watch(kdsProvider);
    final now = kdsState.lastTick;
    final ageColor = KDSRenderingUtils.getAgeColor(ticket.firedAt, now);

    return Container(
      width: 320,
      margin: const EdgeInsets.all(12),
      decoration: KDSRenderingUtils.glassDecoration(context),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildHeader(context, ageColor, now),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: ticket.items.length,
              separatorBuilder: (context, index) => const SizedBox(height: 8),
              itemBuilder: (context, index) => _KDSItemRow(
                item: ticket.items[index],
                now: now,
                fallbackStartTime: ticket.firedAt,
                showActions: !isExpo,
              ),
            ),
          ),
          _buildFooter(ref),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, Color ageColor, DateTime now) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ageColor.withOpacity(0.1),
        border: Border(bottom: BorderSide(color: ageColor.withOpacity(0.2))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'TABLE ${ticket.tableNumber}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
              ),
              Text(
                'Server: ${ticket.serverName}',
                style: const TextStyle(color: Colors.grey, fontSize: 11),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: ageColor,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              KDSRenderingUtils.formatDuration(ticket.firedAt, now),
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: ElevatedButton(
        onPressed: () => ref.read(kdsProvider.notifier).bumpTicket(ticket.id),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.green,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 50),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 0,
        ),
        child: const Text('BUMP TICKET', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
    );
  }
}

class KDSExpoTableCard extends ConsumerWidget {
  final KDSExpoGroup group;

  const KDSExpoTableCard({super.key, required this.group});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final kdsState = ref.watch(kdsProvider);
    final now = kdsState.lastTick;
    final ageColor = group.occupancyStart != null 
        ? KDSRenderingUtils.getAgeColor(group.occupancyStart!, now)
        : Colors.grey;

    return Container(
      width: 350,
      margin: const EdgeInsets.all(12),
      decoration: KDSRenderingUtils.glassDecoration(context),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildHeader(group, ageColor, now),
          Expanded(
            child: group.items.isEmpty
                ? const Center(
                    child: Text(
                      'Waiting for orders...',
                      style: TextStyle(fontStyle: FontStyle.italic, color: Colors.grey),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: group.items.length,
                    itemBuilder: (context, index) => _KDSExpoItemRow(
                      item: group.items[index],
                      now: now,
                      fallbackStartTime: group.occupancyStart ?? DateTime.now(),
                    ),
                  ),
          ),
          _buildFooter(context, ref, group),
        ],
      ),
    );
  }

  Widget _buildHeader(KDSExpoGroup group, Color ageColor, DateTime now) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ageColor.withOpacity(0.1),
        border: Border(bottom: BorderSide(color: ageColor.withOpacity(0.2))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'TABLE ${group.tableNumber}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 22, letterSpacing: 1.2),
              ),
              Text(
                '${group.guestCount ?? "?"} Guests • ${group.serverName ?? "Unknown"}',
                style: const TextStyle(color: Colors.grey, fontSize: 12),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: ageColor,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              group.occupancyStart != null 
                  ? KDSRenderingUtils.formatDuration(group.occupancyStart!, now)
                  : '00:00',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context, WidgetRef ref, KDSExpoGroup group) {
    final isReadyToBump = group.items.isNotEmpty && group.items.every((i) => i.status == KDSItemStatus.ready);
    
    return Padding(
      padding: const EdgeInsets.all(16),
      child: ElevatedButton(
        onPressed: group.items.isEmpty 
          ? null 
          : () => ref.read(kdsProvider.notifier).bumpTable(group.ticketIds),
        style: ElevatedButton.styleFrom(
          backgroundColor: isReadyToBump ? Colors.green : Colors.grey[200],
          foregroundColor: isReadyToBump ? Colors.white : Colors.black54,
          minimumSize: const Size(double.infinity, 50),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 0,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isReadyToBump) const Icon(Icons.check_circle_outline, size: 20),
            const SizedBox(width: 8),
            const Text(
              'DONE / BUMP TABLE',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}

class _KDSItemRow extends ConsumerWidget {
  final KDSTicketItem item;
  final DateTime now;
  final DateTime fallbackStartTime;
  final bool showActions;

  const _KDSItemRow({
    required this.item,
    required this.now,
    required this.fallbackStartTime,
    this.showActions = true,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isCooking = item.status == KDSItemStatus.cooking;
    final isReady = item.status == KDSItemStatus.ready;
    final isPaused = item.status == KDSItemStatus.paused;

    return GestureDetector(
      onTap: null, // Removed in favor of explicit buttons
      onDoubleTap: null,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isReady 
              ? Colors.green.withOpacity(0.05) 
              : (isCooking ? Colors.orange.withOpacity(0.05) : (isPaused ? Colors.blueGrey.withOpacity(0.05) : Colors.white.withOpacity(0.5))),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isReady 
                ? Colors.green 
                : (isCooking ? Colors.orange : (isPaused ? Colors.blueGrey : (item.priority > 0 ? Colors.redAccent : Colors.grey.withOpacity(0.2)))),
            width: (item.priority > 0 || isCooking) ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isReady 
                  ? Icons.check_circle 
                  : (isCooking ? Icons.restaurant : (isPaused ? Icons.pause_circle : (item.priority > 0 ? Icons.priority_high : Icons.circle_outlined))),
              color: isReady ? Colors.green : (isCooking ? Colors.orange : (isPaused ? Colors.blueGrey : (item.priority > 0 ? Colors.redAccent : Colors.grey))),
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${item.quantity}x ${item.name}',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      decoration: isReady ? TextDecoration.lineThrough : null,
                      color: isReady ? Colors.black54 : Colors.black87,
                    ),
                  ),
                  if (item.modifiers.isNotEmpty)
                    Text(
                      item.modifiers.join(', '),
                      style: const TextStyle(fontSize: 11, color: Colors.orange, fontWeight: FontWeight.w500),
                    ),
                  if (isCooking)
                    const Text(
                      'IN PREP',
                      style: TextStyle(fontSize: 9, color: Colors.orange, fontWeight: FontWeight.bold, letterSpacing: 1),
                    )
                  else if (isPaused)
                    const Text(
                      'PAUSED',
                      style: TextStyle(fontSize: 9, color: Colors.blueGrey, fontWeight: FontWeight.bold, letterSpacing: 1),
                    ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            if (showActions && !isReady) ...[
              TextButton(
                onPressed: () => ref.read(kdsProvider.notifier).toggleItemCooking(item),
                style: TextButton.styleFrom(
                  backgroundColor: (isCooking ? Colors.blueGrey : Colors.orange).withOpacity(0.1),
                  foregroundColor: isCooking ? Colors.blueGrey : Colors.orange,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: Text(
                  isCooking ? 'PAUSE' : (isPaused ? 'RESUME' : 'START'),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
              const SizedBox(width: 8),
              TextButton(
                onPressed: () => ref.read(kdsProvider.notifier).markItemDone(item),
                style: TextButton.styleFrom(
                  backgroundColor: Colors.green.withOpacity(0.1),
                  foregroundColor: Colors.green,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('DONE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ] else if (!showActions && isReady) ...[
              // EXPO Service Button
              TextButton(
                onPressed: () => ref.read(kdsProvider.notifier).serveItem(item),
                style: TextButton.styleFrom(
                  backgroundColor: Colors.green.withOpacity(0.1),
                  foregroundColor: Colors.green,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('SERVE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ] else if (!showActions && !isReady) ...[
              // EXPO Priority Button
              IconButton(
                icon: const Icon(Icons.priority_high, size: 16),
                color: item.priority > 0 ? Colors.redAccent : Colors.grey,
                onPressed: () => ref.read(kdsProvider.notifier).updateItemPriority(item.id, 1),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
            const SizedBox(width: 8),
            KDSTimerWidget(
              item: item,
              now: now,
              fallbackStartTime: fallbackStartTime,
            ),
          ],
        ),
      ),
    );
  }
}

class _KDSExpoItemRow extends ConsumerWidget {
  final KDSExpoItem item;
  final DateTime now;
  final DateTime fallbackStartTime;

  const _KDSExpoItemRow({
    required this.item,
    required this.now,
    required this.fallbackStartTime,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final totalQuantity = item.units.length;
    final readyDocs = item.units.where((i) => i.status == KDSItemStatus.ready).toList();
    final allReady = readyDocs.length == totalQuantity;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: allReady ? Colors.green.withOpacity(0.05) : Colors.white.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: allReady ? Colors.green : Colors.grey.withOpacity(0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                allReady ? Icons.check_circle : Icons.restaurant_menu,
                color: allReady ? Colors.green : Colors.black54,
                size: 20,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  '${totalQuantity}x ${item.name}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    decoration: allReady ? TextDecoration.lineThrough : null,
                  ),
                ),
              ),
              if (readyDocs.isNotEmpty && !allReady)
                Text(
                  '${readyDocs.length} READY',
                  style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12),
                ),
            ],
          ),
          if (item.modifiers.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(left: 32, top: 4),
              child: Text(
                item.modifiers.join(', '),
                style: const TextStyle(fontSize: 12, color: Colors.orange, fontWeight: FontWeight.w500),
              ),
            ),
          const SizedBox(height: 8),
          // Individual Unit Indicators
          Padding(
            padding: const EdgeInsets.only(left: 32),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: item.units.map((unit) => _buildUnitActionChip(context, ref, unit)).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUnitActionChip(BuildContext context, WidgetRef ref, KDSTicketItem unit) {
    final isReady = unit.status == KDSItemStatus.ready;
    final isCooking = unit.status == KDSItemStatus.cooking;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: isReady 
            ? () => ref.read(kdsProvider.notifier).serveItem(unit)
            : null,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: isReady 
                ? Colors.green.withOpacity(0.1) 
                : (isCooking ? Colors.orange.withOpacity(0.1) : Colors.grey.withOpacity(0.1)),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isReady 
                  ? Colors.green 
                  : (isCooking ? Colors.orange : Colors.grey.withOpacity(0.3)),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'U${unit.unitIndex}',
                style: TextStyle(
                  fontSize: 10, 
                  fontWeight: FontWeight.bold,
                  color: isReady ? Colors.green : (isCooking ? Colors.orange : Colors.grey),
                ),
              ),
              if (isReady) ...[
                const SizedBox(width: 4),
                const Icon(Icons.send_rounded, size: 12, color: Colors.green),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class KDSTimerWidget extends StatelessWidget {
  final KDSTicketItem item;
  final DateTime now;
  final DateTime fallbackStartTime;

  const KDSTimerWidget({
    super.key, 
    required this.item, 
    required this.now,
    required this.fallbackStartTime,
  });

  @override
  Widget build(BuildContext context) {
    final isReady = item.status == KDSItemStatus.ready;
    final isCooking = item.status == KDSItemStatus.cooking;
    final isPaused = item.status == KDSItemStatus.paused;
    final startTime = item.prepStartedAt ?? fallbackStartTime;
    
    // Preparation countdown logic
    final targetTime = startTime.add(Duration(minutes: item.preparationTimeMinutes));
    final remaining = targetTime.difference(now);
    final isOverdue = remaining.isNegative;
    
    final color = isReady 
        ? Colors.grey 
        : (isOverdue ? Colors.redAccent : (isCooking ? Colors.orange : (isPaused ? Colors.blueGrey : Colors.blue)));

    String timeText;
    if (isReady) {
      timeText = 'DONE';
    } else {
      final absRemaining = remaining.abs();
      final mins = absRemaining.inMinutes;
      final secs = absRemaining.inSeconds % 60;
      timeText = '${isOverdue ? "-" : ""}${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          timeText,
          style: TextStyle(
            fontSize: 14, 
            color: color, 
            fontWeight: FontWeight.bold,
          ),
        ),
        if (!isReady)
          Text(
            isOverdue ? 'OVERDUE' : 'REMAINING',
            style: TextStyle(fontSize: 8, color: color.withOpacity(0.7), fontWeight: FontWeight.bold),
          ),
      ],
    );
  }
}

class KDSPrepItemCard extends ConsumerWidget {
  final KDSTicketItem item;
  final String tableNumber;
  final String serverName;
  final DateTime fallbackStartTime;

  const KDSPrepItemCard({
    super.key, 
    required this.item, 
    required this.tableNumber,
    required this.serverName,
    required this.fallbackStartTime,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final kdsState = ref.watch(kdsProvider);
    final now = kdsState.lastTick;
    final isCooking = item.status == KDSItemStatus.cooking;
    final isPaused = item.status == KDSItemStatus.paused;
    final hasPriority = item.priority > 0;

    return GestureDetector(
      onTap: null, // Removed in favor of explicit buttons
      onDoubleTap: null,
      child: Container(
        width: 220,
        decoration: KDSRenderingUtils.glassDecoration(
          context, 
          color: hasPriority ? Colors.red[50]?.withOpacity(0.9) : Colors.white,
        ).copyWith(
          border: hasPriority 
              ? Border.all(color: Colors.redAccent.withOpacity(0.5), width: 2)
              : null,
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              height: 6, 
              color: item.status == KDSItemStatus.ready 
                  ? Colors.green 
                  : (isCooking ? Colors.orange : (isPaused ? Colors.blueGrey : Colors.blue)),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('TBL $tableNumber', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
                          Text(serverName, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                        ],
                      ),
                      KDSTimerWidget(
                        item: item,
                        now: now,
                        fallbackStartTime: fallbackStartTime,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${item.quantity}x ${item.name}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (item.modifiers.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(item.modifiers.join(', '), style: const TextStyle(fontSize: 12, color: Colors.orange, fontWeight: FontWeight.w600)),
                  ],
                  if (isCooking)
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.restaurant, size: 10, color: Colors.orange),
                          SizedBox(width: 4),
                          Text('PREPARING', style: TextStyle(fontSize: 10, color: Colors.orange, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )
                  else if (isPaused)
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.blueGrey.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.pause, size: 10, color: Colors.blueGrey),
                          SizedBox(width: 4),
                          Text('PAUSED', style: TextStyle(fontSize: 10, color: Colors.blueGrey, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const Spacer(),
            if (item.priority > 0)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: Row(
                  children: [
                    const Icon(Icons.priority_high, size: 16, color: Colors.redAccent),
                    const SizedBox(width: 4),
                    Text('RUSH - PRIORITY ${item.priority}', style: const TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            if (!item.status.name.toLowerCase().contains('ready') && !item.status.name.toLowerCase().contains('served'))
              Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => ref.read(kdsProvider.notifier).toggleItemCooking(item),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isCooking ? Colors.blueGrey : Colors.orange,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: Text(
                          isCooking ? 'PAUSE' : (isPaused ? 'RESUME' : 'START'),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => ref.read(kdsProvider.notifier).markItemDone(item),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('DONE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class KDSAllDayTile extends StatelessWidget {
  final KDSAllDayItem item;

  const KDSAllDayTile({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: KDSRenderingUtils.glassDecoration(context),
      child: Row(
        children: [
          Container(
            width: 55,
            height: 55,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Colors.orange.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Text(
              '${item.totalQuantity}',
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.orange),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                Text(item.category, style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
          _buildStatusTag('${item.quantityPending} Pending', Colors.grey),
          const SizedBox(width: 10),
          _buildStatusTag('${item.quantityReady} In Prep', Colors.orange),
        ],
      ),
    );
  }

  Widget _buildStatusTag(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.bold),
      ),
    );
  }
}
