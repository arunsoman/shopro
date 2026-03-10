import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/mapping_provider.dart';

class NotificationRoutingScreen extends ConsumerStatefulWidget {
  const NotificationRoutingScreen({super.key});

  @override
  ConsumerState<NotificationRoutingScreen> createState() =>
      _NotificationRoutingScreenState();
}

class _NotificationRoutingScreenState
    extends ConsumerState<NotificationRoutingScreen> {
  String? _selectedType;
  String _selectedRecipientType = 'ROLE';
  final _idController = TextEditingController();

  final List<String> _notificationTypes = [
    'ORDER_READY',
    'ITEM_REJECTED',
    'ASSISTANCE_NEEDED',
    'STOCK_CRITICAL',
    'PO_APPROVAL_REQUIRED',
    'BID_RECEIVED',
    'VOID_REQUEST',
    'CURBSIDE_ARRIVAL',
    'SYSTEM_WARNING',
    'TABLE_DIRTY',
  ];

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationMappingProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification Routing'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                ref.read(notificationMappingProvider.notifier).loadMappings(),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildAddMappingForm(),
          const Divider(),
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : state.mappings.isEmpty
                ? const Center(child: Text('No routing rules configured.'))
                : ListView.builder(
                    itemCount: state.mappings.length,
                    itemBuilder: (context, index) {
                      final mapping = state.mappings[index];
                      return ListTile(
                        title: Text(mapping.notificationType),
                        subtitle: Text(
                          '${mapping.recipientType}: ${mapping.recipientId}',
                        ),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => ref
                              .read(notificationMappingProvider.notifier)
                              .deleteMapping(mapping.id),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddMappingForm() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Add New Routing Rule',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedType,
                hint: const Text('Select Notification Type'),
                items: _notificationTypes
                    .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                    .toList(),
                onChanged: (val) => setState(() => _selectedType = val),
                decoration: const InputDecoration(labelText: 'Event Type'),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _selectedRecipientType,
                      items: ['ROLE', 'USER']
                          .map(
                            (t) => DropdownMenuItem(value: t, child: Text(t)),
                          )
                          .toList(),
                      onChanged: (val) =>
                          setState(() => _selectedRecipientType = val!),
                      decoration: const InputDecoration(
                        labelText: 'Recipient Type',
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _idController,
                      decoration: const InputDecoration(
                        labelText: 'Recipient ID (e.g. MANAGER)',
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _addMapping,
                child: const Text('Save Rule'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _addMapping() {
    if (_selectedType == null || _idController.text.isEmpty) return;

    ref
        .read(notificationMappingProvider.notifier)
        .addMapping(
          _selectedType!,
          _selectedRecipientType,
          _idController.text.trim(),
        );

    _idController.clear();
  }
}
