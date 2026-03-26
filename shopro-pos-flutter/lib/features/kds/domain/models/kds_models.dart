import 'package:freezed_annotation/freezed_annotation.dart';

part 'kds_models.freezed.dart';
part 'kds_models.g.dart';

enum KDSStationType {
  @JsonValue('PREP') prep,
  @JsonValue('EXPO') expo,
  @JsonValue('BEVERAGE') beverage,
  @JsonValue('GRILL') grill,
  @JsonValue('BAR') bar,
  @JsonValue('PANTRY') pantry,
  @JsonValue('FRY') fry,
  @JsonValue('PASTRY') pastry,
  @JsonValue('GENERAL') general,
}

enum KDSTicketStatus {
  @JsonValue('NEW') newTicket,
  @JsonValue('COOKING') cooking,
  @JsonValue('READY') ready,
  @JsonValue('BUMPED') bumped,
}

enum KDSItemStatus {
  @JsonValue('PENDING') pending,
  @JsonValue('COOKING') cooking,
  @JsonValue('PAUSED') paused,
  @JsonValue('READY') ready,
  @JsonValue('SERVED') served,
}

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
    @Default(0) int quantityPending,
    @Default(0) int quantityCooking,
    @Default(0) int quantityReady,
    @Default(0) int quantityServed,
    required KDSItemStatus status,
    String? customNote,
    @Default([]) List<String> modifiers,
    DateTime? prepStartedAt,
    @Default(0) int priority,
    @Default(10) int preparationTimeMinutes,
  }) = _KDSTicketItem;

  factory KDSTicketItem.fromJson(Map<String, dynamic> json) =>
      _$KDSTicketItemFromJson(json);
}

@freezed
class KDSExpoGroup with _$KDSExpoGroup {
  const factory KDSExpoGroup({
    required String tableNumber,
    required DateTime? occupancyStart,
    String? serverName,
    int? guestCount,
    @Default([]) List<KDSTicketItem> items,
    @Default([]) List<String> ticketIds,
  }) = _KDSExpoGroup;
}

@freezed
class KDSAllDayItem with _$KDSAllDayItem {
  const factory KDSAllDayItem({
    required String name,
    required int totalQuantity,
    required int quantityPending,
    required int quantityReady,
    required String category,
  }) = _KDSAllDayItem;
}
