import 'package:freezed_annotation/freezed_annotation.dart';

part 'kds_models.freezed.dart';
part 'kds_models.g.dart';

enum KDSStationType {
  PREP,
  EXPO,
  BEVERAGE,
  GRILL,
  BAR,
  PANTRY,
  FRY,
  PASTRY,
  GENERAL,
}

enum KDSTicketStatus { NEW, COOKING, READY, BUMPED }

enum KDSItemStatus { PENDING, COOKING, READY }

@freezed
class KDSStation with _$KDSStation {
  const factory KDSStation({
    required String id,
    required String name,
    required KDSStationType stationType,
    required bool online,
  }) = _KDSStation;

  factory KDSStation.fromJson(Map<String, dynamic> json) =>
      _$KDSStationFromJson(json);
}

@freezed
class KDSTicket with _$KDSTicket {
  const factory KDSTicket({
    required String id,
    required String tableNumber,
    required String serverName,
    required KDSTicketStatus status,
    required DateTime firedAt,
    @Default([]) List<KDSTicketItem> items,
  }) = _KDSTicket;

  factory KDSTicket.fromJson(Map<String, dynamic> json) =>
      _$KDSTicketFromJson(json);
}

@freezed
class KDSTicketItem with _$KDSTicketItem {
  const factory KDSTicketItem({
    required String id,
    required String menuItemId,
    required String name,
    required int quantity,
    required KDSItemStatus status,
    String? customNote,
    @Default([]) List<String> modifiers,
  }) = _KDSTicketItem;

  factory KDSTicketItem.fromJson(Map<String, dynamic> json) =>
      _$KDSTicketItemFromJson(json);
}
