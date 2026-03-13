import '../../../../core/network/api_client.dart';
import '../models/kds_models.dart';

/// All paths here are relative to the ApiClient baseUrl (http://localhost:8080/api/v1).
/// Do NOT include /api/v1 in the path — it is already part of the base URL.
class KDSRepository {
  final ApiClient _apiClient;

  KDSRepository(this._apiClient);

  Future<List<KDSTicket>> getActiveTickets(String stationId) async {
    final response = await _apiClient.get(
      '/kds/stations/$stationId/tickets/active',
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = response.data;
      return data.map((json) => KDSTicket.fromJson(json)).toList();
    }
    throw Exception('Failed to load active tickets');
  }

  Future<KDSTicket> bumpTicket(String ticketId) async {
    final response = await _apiClient.post('/kds/tickets/$ticketId/bump');
    if (response.statusCode == 200) {
      return KDSTicket.fromJson(response.data);
    }
    throw Exception('Failed to bump ticket');
  }

  Future<KDSTicketItem> bumpItem(String itemId) async {
    final response = await _apiClient.post('/kds/items/$itemId/bump');
    if (response.statusCode == 200) {
      return KDSTicketItem.fromJson(response.data);
    }
    throw Exception('Failed to bump item');
  }

  Future<List<KDSStation>> getAllStations() async {
    final response = await _apiClient.get('/kds/stations');
    if (response.statusCode == 200) {
      final List<dynamic> data = response.data;
      return data.map((json) => KDSStation.fromJson(json)).toList();
    }
    throw Exception('Failed to load stations');
  }

  Future<KDSStation> getStationById(String stationId) async {
    final response = await _apiClient.get('/kds/stations/$stationId');
    if (response.statusCode == 200) {
      return KDSStation.fromJson(response.data);
    }
    throw Exception('Failed to load station info');
  }

  Future<KDSTicketItem> updateItemPriority(String itemId, int priority) async {
    final response = await _apiClient.post(
      '/kds/items/$itemId/priority',
      queryParameters: {'priority': priority},
    );
    if (response.statusCode == 200) {
      return KDSTicketItem.fromJson(response.data);
    }
    throw Exception('Failed to update item priority');
  }

  Future<KDSTicketItem> toggleItemStatus(String itemId) async {
    final response = await _apiClient.post('/kds/items/$itemId/toggle');
    if (response.statusCode == 200) {
      return KDSTicketItem.fromJson(response.data);
    }
    throw Exception('Failed to toggle item status');
  }

  Future<KDSTicketItem> markItemReady(String itemId) async {
    final response = await _apiClient.post('/kds/items/$itemId/ready');
    if (response.statusCode == 200) {
      return KDSTicketItem.fromJson(response.data);
    }
    throw Exception('Failed to mark item as ready');
  }

  Future<KDSTicketItem> serveItem(String itemId) async {
    final response = await _apiClient.post('/kds/items/$itemId/serve');
    if (response.statusCode == 200) {
      return KDSTicketItem.fromJson(response.data);
    }
    throw Exception('Failed to serve item');
  }

  Future<void> serveReadyItems(List<String> ticketIds) async {
    await _apiClient.post(
      '/kds/tickets/serve-ready',
      data: ticketIds,
    );
  }
}
