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
  KDSStationType.prep: 'PREP',
  KDSStationType.expo: 'EXPO',
  KDSStationType.beverage: 'BEVERAGE',
  KDSStationType.grill: 'GRILL',
  KDSStationType.bar: 'BAR',
  KDSStationType.pantry: 'PANTRY',
  KDSStationType.fry: 'FRY',
  KDSStationType.pastry: 'PASTRY',
  KDSStationType.general: 'GENERAL',
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
  KDSTicketStatus.newTicket: 'NEW',
  KDSTicketStatus.cooking: 'COOKING',
  KDSTicketStatus.ready: 'READY',
  KDSTicketStatus.bumped: 'BUMPED',
};

_$KDSTicketItemImpl _$$KDSTicketItemImplFromJson(Map<String, dynamic> json) =>
    _$KDSTicketItemImpl(
      id: json['id'] as String,
      menuItemId: json['menuItemId'] as String,
      name: json['name'] as String,
      quantity: (json['quantity'] as num).toInt(),
      quantityPending: (json['quantityPending'] as num?)?.toInt() ?? 0,
      quantityCooking: (json['quantityCooking'] as num?)?.toInt() ?? 0,
      quantityReady: (json['quantityReady'] as num?)?.toInt() ?? 0,
      quantityServed: (json['quantityServed'] as num?)?.toInt() ?? 0,
      status: $enumDecode(_$KDSItemStatusEnumMap, json['status']),
      customNote: json['customNote'] as String?,
      modifiers:
          (json['modifiers'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      prepStartedAt: json['prepStartedAt'] == null
          ? null
          : DateTime.parse(json['prepStartedAt'] as String),
      priority: (json['priority'] as num?)?.toInt() ?? 0,
      preparationTimeMinutes:
          (json['preparationTimeMinutes'] as num?)?.toInt() ?? 10,
    );

Map<String, dynamic> _$$KDSTicketItemImplToJson(_$KDSTicketItemImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'menuItemId': instance.menuItemId,
      'name': instance.name,
      'quantity': instance.quantity,
      'quantityPending': instance.quantityPending,
      'quantityCooking': instance.quantityCooking,
      'quantityReady': instance.quantityReady,
      'quantityServed': instance.quantityServed,
      'status': _$KDSItemStatusEnumMap[instance.status]!,
      'customNote': instance.customNote,
      'modifiers': instance.modifiers,
      'prepStartedAt': instance.prepStartedAt?.toIso8601String(),
      'priority': instance.priority,
      'preparationTimeMinutes': instance.preparationTimeMinutes,
    };

const _$KDSItemStatusEnumMap = {
  KDSItemStatus.pending: 'PENDING',
  KDSItemStatus.cooking: 'COOKING',
  KDSItemStatus.paused: 'PAUSED',
  KDSItemStatus.ready: 'READY',
  KDSItemStatus.served: 'SERVED',
};
