import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';
import '../models/floor_models.dart';

abstract class FloorPlanRepository {
  Future<List<TableInfo>> getTables();
  Future<List<WaitlistEntry>> getWaitlist();
  Future<List<Map<String, dynamic>>> getSections();
  Future<void> seatParty(String tableId, String waitlistEntryId);
  Future<void> markTableClean(String tableId);
  Future<void> updateTableStatus(String tableId, String status);
  Future<void> updateTablePosition(String tableId, double posX, double posY);
  Future<WaitlistEntry> addToWaitlist({required String name, required int size});
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
        final shapeType = (json['shapeType'] as String?)?.toUpperCase();
        return TableInfo(
          id: json['id'] ?? '',
          name: json['name'] ?? '',
          capacity: json['capacity'] ?? 0,
          status: _mapStatus(json['status']),
          posX: (json['posX'] as num?)?.toDouble() ?? 0.0,
          posY: (json['posY'] as num?)?.toDouble() ?? 0.0,
          width: (json['width'] as num?)?.toDouble() ?? 50.0,
          height: (json['height'] as num?)?.toDouble() ?? 50.0,
          shape: _mapShape(shapeType),
          sectionId: json['sectionId'],
          assignedStaffId: json['assignedStaffId'],
          assignedStaffName: json['assignedStaffName'],
        );
      }).toList();
    }
    throw Exception('Failed to load tables');
  }

  @override
  Future<List<WaitlistEntry>> getWaitlist() async {
    final response = await _client.get('/waitlist');
    if (response.statusCode == 200) {
      final List<dynamic> data = response.data;
      return data.map((json) {
        return WaitlistEntry(
          id: json['id'] ?? '',
          customerName: json['guestName'] ?? 'Guest',
          partySize: json['partySize'] ?? 0,
          waitTimeDisplay: '${json['estimatedWaitMinutes'] ?? 0}m wait',
          status: _mapWaitlistStatus(json['status']),
          isVIP: json['isVip'] ?? false,
        );
      }).toList();
    }
    throw Exception('Failed to load waitlist');
  }

  WaitlistStatus _mapWaitlistStatus(String? status) {
    if (status == null) return WaitlistStatus.waiting;
    switch (status.toUpperCase()) {
      case 'READY':
        return WaitlistStatus.ready;
      case 'SEATED':
        return WaitlistStatus.seated;
      case 'CANCELLED':
        return WaitlistStatus.cancelled;
      default:
        return WaitlistStatus.waiting;
    }
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
      case 'HELD':
      case 'RESERVED':
        return TableStatus.held;
      case 'OCCUPIED':
        return TableStatus.occupied;
      case 'ORDERED':
      case 'ORDER_PLACED':
        return TableStatus.ordered;
      case 'FOOD_DELIVERED':
      case 'DELIVERED':
        return TableStatus.foodDelivered;
      case 'DESSERT_COURSE':
        return TableStatus.dessertCourse;
      case 'CHECK_DROPPED':
        return TableStatus.checkDropped;
      case 'PAYING':
        return TableStatus.paying;
      case 'DIRTY':
        return TableStatus.dirty;
      case 'CLEANING':
        return TableStatus.cleaning;
      case 'MAINTENANCE':
        return TableStatus.maintenance;
      default:
        return TableStatus.available;
    }
  }

  @override
  Future<void> seatParty(String tableId, String waitlistEntryId) async {
    await _client.post(
      '/waitlist/tables/$tableId/seat',
      queryParameters: {'waitlistEntryId': waitlistEntryId},
    );
  }

  @override
  Future<void> markTableClean(String tableId) async {
    await _client.post('/waitlist/tables/$tableId/clean');
  }

  @override
  Future<void> updateTableStatus(String tableId, String status) async {
    await _client.patch(
      '/floor-plan/tables/$tableId/status',
      data: {'status': status},
    );
  }

  @override
  Future<void> updateTablePosition(
    String tableId,
    double posX,
    double posY,
  ) async {
    await _client.patch(
      '/floor-plan/tables/$tableId/position',
      data: {'posX': posX.toInt(), 'posY': posY.toInt()},
    );
  }

  @override
  Future<WaitlistEntry> addToWaitlist({
    required String name,
    required int size,
  }) async {
    final response = await _client.post(
      '/waitlist',
      data: {
        'guestName': name,
        'partySize': size,
      },
    );
    
    if (response.statusCode == 201 || response.statusCode == 200) {
      final json = response.data;
      return WaitlistEntry(
        id: json['id'] ?? '',
        customerName: json['guestName'] ?? name,
        partySize: json['partySize'] ?? size,
        waitTimeDisplay: '${json['estimatedWaitMinutes'] ?? 0}m wait',
        status: _mapWaitlistStatus(json['status']),
        isVIP: json['isVip'] ?? false,
      );
    }
    throw Exception('Failed to add to waitlist');
  }

  TableShape _mapShape(String? shapeType) {
    if (shapeType == null) return TableShape.rectangle;
    switch (shapeType.toUpperCase()) {
      case 'ROUND':
        return TableShape.round;
      case 'SQUARE':
        return TableShape.square;
      case 'RECTANGLE':
        return TableShape.rectangle;
      case 'STOOL':
        return TableShape.stool;
      case 'DECOR':
        return TableShape.decor;
      default:
        return TableShape.rectangle;
    }
  }
}

final floorPlanRepositoryProvider = Provider<FloorPlanRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return FloorPlanRepositoryImpl(client);
});
