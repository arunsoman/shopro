import '../../../../core/network/api_client.dart';
import '../models/floor_models.dart';

abstract class FloorPlanRepository {
  Future<List<TableInfo>> getTables();
  Future<List<Map<String, dynamic>>> getSections();
}

class FloorPlanRepositoryImpl implements FloorPlanRepository {
  final ApiClient _client;

  FloorPlanRepositoryImpl(this._client);

  @override
  Future<List<TableInfo>> getTables() async {
    final response = await _client.get('/floor-plan/tables');
    if (response.statusCode == 200) {
      final List<dynamic> data = response.data;
      return data.map((json) {
        return TableInfo(
          id: json['id'],
          name: json['name'],
          capacity: json['capacity'],
          status: _mapStatus(json['status']),
          posX: (json['posX'] as num).toDouble(),
          posY: (json['posY'] as num).toDouble(),
          width: (json['width'] as num).toDouble(),
          height: (json['height'] as num).toDouble(),
          shape: json['shapeType'] == 'ROUND'
              ? TableShape.round
              : TableShape.rectangle,
          sectionId: json['sectionId'],
          assignedStaffId: json['assignedStaffId'],
          assignedStaffName: json['assignedStaffName'],
        );
      }).toList();
    }
    throw Exception('Failed to load tables');
  }

  @override
  Future<List<Map<String, dynamic>>> getSections() async {
    final response = await _client.get('/floor-plan/sections');
    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(response.data);
    }
    throw Exception('Failed to load sections');
  }

  TableStatus _mapStatus(String? status) {
    if (status == null) return TableStatus.available;

    switch (status.toUpperCase()) {
      case 'OCCUPIED':
        return TableStatus.occupied;
      case 'ORDERED':
      case 'ORDER_PLACED':
        return TableStatus.ordered;
      case 'DELIVERED':
      case 'FOOD_DELIVERED':
        return TableStatus.delivered;
      case 'DIRTY':
        return TableStatus.dirty;
      case 'HELD':
      case 'RESERVED':
        return TableStatus.held;
      case 'INACTIVE':
        return TableStatus.inactive;
      default:
        return TableStatus.available;
    }
  }
}

final floorPlanRepository = FloorPlanRepositoryImpl(apiClient);
