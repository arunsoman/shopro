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
}
