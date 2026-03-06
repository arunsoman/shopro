// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'kds_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$KDSStationImpl _$$KDSStationImplFromJson(Map<String, dynamic> json) =>
    _$KDSStationImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      stationType: $enumDecode(_$KDSStationTypeEnumMap, json['stationType']),
      online: json['online'] as bool,
    );

Map<String, dynamic> _$$KDSStationImplToJson(_$KDSStationImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'stationType': _$KDSStationTypeEnumMap[instance.stationType]!,
      'online': instance.online,
    };

const _$KDSStationTypeEnumMap = {
  KDSStationType.PREP: 'PREP',
  KDSStationType.EXPO: 'EXPO',
  KDSStationType.BEVERAGE: 'BEVERAGE',
  KDSStationType.GRILL: 'GRILL',
  KDSStationType.BAR: 'BAR',
  KDSStationType.PANTRY: 'PANTRY',
  KDSStationType.FRY: 'FRY',
  KDSStationType.PASTRY: 'PASTRY',
  KDSStationType.GENERAL: 'GENERAL',
};

_$KDSTicketImpl _$$KDSTicketImplFromJson(Map<String, dynamic> json) =>
    _$KDSTicketImpl(
      id: json['id'] as String,
      tableNumber: json['tableNumber'] as String,
      serverName: json['serverName'] as String,
      status: $enumDecode(_$KDSTicketStatusEnumMap, json['status']),
      firedAt: DateTime.parse(json['firedAt'] as String),
      items:
          (json['items'] as List<dynamic>?)
              ?.map((e) => KDSTicketItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$KDSTicketImplToJson(_$KDSTicketImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tableNumber': instance.tableNumber,
      'serverName': instance.serverName,
      'status': _$KDSTicketStatusEnumMap[instance.status]!,
      'firedAt': instance.firedAt.toIso8601String(),
      'items': instance.items,
    };

const _$KDSTicketStatusEnumMap = {
  KDSTicketStatus.NEW: 'NEW',
  KDSTicketStatus.COOKING: 'COOKING',
  KDSTicketStatus.READY: 'READY',
  KDSTicketStatus.BUMPED: 'BUMPED',
};

_$KDSTicketItemImpl _$$KDSTicketItemImplFromJson(Map<String, dynamic> json) =>
    _$KDSTicketItemImpl(
      id: json['id'] as String,
      menuItemId: json['menuItemId'] as String,
      name: json['name'] as String,
      quantity: (json['quantity'] as num).toInt(),
      status: $enumDecode(_$KDSItemStatusEnumMap, json['status']),
      customNote: json['customNote'] as String?,
      modifiers:
          (json['modifiers'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$KDSTicketItemImplToJson(_$KDSTicketItemImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'menuItemId': instance.menuItemId,
      'name': instance.name,
      'quantity': instance.quantity,
      'status': _$KDSItemStatusEnumMap[instance.status]!,
      'customNote': instance.customNote,
      'modifiers': instance.modifiers,
    };

const _$KDSItemStatusEnumMap = {
  KDSItemStatus.PENDING: 'PENDING',
  KDSItemStatus.COOKING: 'COOKING',
  KDSItemStatus.READY: 'READY',
};
