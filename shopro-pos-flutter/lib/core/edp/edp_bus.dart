import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';
import 'edp_event.dart';

/// Service responsible for publishing and receiving EDP events.
/// Enforces DRY principle by centralizing all outgoing and incoming event traffic.
class EdpBus {
  final ApiClient _api;
  final _eventController = StreamController<EdpEvent>.broadcast();
  int? _lastSeenEventId;

  int? get lastSeenEventId => _lastSeenEventId;

  EdpBus(this._api);

  Stream<EdpEvent> get events => _eventController.stream;

  /// External publish to backend
  Future<void> publish(EdpEvent event) async {
    try {
      await _api.post('/api/events', data: event.toJson());
    } catch (e) {
      // Logic for offline queueing could be added here in the future
      rethrow;
    }
  }

  /// Internal distribution of received events
  void receive(EdpEvent event) {
    if (event.seqId != null) {
      _lastSeenEventId = event.seqId;
    }
    _eventController.add(event);
  }

  /// Recover missed events from the server
  Future<void> sync() async {
    final sinceId = _lastSeenEventId ?? 0;

    try {
      final response = await _api.get('/api/events/catchup', 
        queryParameters: {'sinceId': sinceId});
      
      if (response.data is List) {
        final List<dynamic> eventsJson = response.data;
        for (var json in eventsJson) {
          receive(EdpEvent.fromJson(json));
        }
      }
    } catch (e) {
      // Log or handle sync error
    }
  }

  void dispose() {
    _eventController.close();
  }
}

final edpBusProvider = Provider((ref) {
  final bus = EdpBus(ref.watch(apiClientProvider));
  ref.onDispose(() => bus.dispose());
  return bus;
});
