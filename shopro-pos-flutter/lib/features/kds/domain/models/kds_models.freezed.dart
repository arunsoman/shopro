// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'kds_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

KDSStation _$KDSStationFromJson(Map<String, dynamic> json) {
  return _KDSStation.fromJson(json);
}

/// @nodoc
mixin _$KDSStation {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  KDSStationType get stationType => throw _privateConstructorUsedError;
  bool get online => throw _privateConstructorUsedError;

  /// Serializes this KDSStation to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of KDSStation
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $KDSStationCopyWith<KDSStation> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $KDSStationCopyWith<$Res> {
  factory $KDSStationCopyWith(
    KDSStation value,
    $Res Function(KDSStation) then,
  ) = _$KDSStationCopyWithImpl<$Res, KDSStation>;
  @useResult
  $Res call({String id, String name, KDSStationType stationType, bool online});
}

/// @nodoc
class _$KDSStationCopyWithImpl<$Res, $Val extends KDSStation>
    implements $KDSStationCopyWith<$Res> {
  _$KDSStationCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of KDSStation
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? stationType = null,
    Object? online = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            stationType: null == stationType
                ? _value.stationType
                : stationType // ignore: cast_nullable_to_non_nullable
                      as KDSStationType,
            online: null == online
                ? _value.online
                : online // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$KDSStationImplCopyWith<$Res>
    implements $KDSStationCopyWith<$Res> {
  factory _$$KDSStationImplCopyWith(
    _$KDSStationImpl value,
    $Res Function(_$KDSStationImpl) then,
  ) = __$$KDSStationImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String id, String name, KDSStationType stationType, bool online});
}

/// @nodoc
class __$$KDSStationImplCopyWithImpl<$Res>
    extends _$KDSStationCopyWithImpl<$Res, _$KDSStationImpl>
    implements _$$KDSStationImplCopyWith<$Res> {
  __$$KDSStationImplCopyWithImpl(
    _$KDSStationImpl _value,
    $Res Function(_$KDSStationImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of KDSStation
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? stationType = null,
    Object? online = null,
  }) {
    return _then(
      _$KDSStationImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        stationType: null == stationType
            ? _value.stationType
            : stationType // ignore: cast_nullable_to_non_nullable
                  as KDSStationType,
        online: null == online
            ? _value.online
            : online // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$KDSStationImpl implements _KDSStation {
  const _$KDSStationImpl({
    required this.id,
    required this.name,
    required this.stationType,
    required this.online,
  });

  factory _$KDSStationImpl.fromJson(Map<String, dynamic> json) =>
      _$$KDSStationImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final KDSStationType stationType;
  @override
  final bool online;

  @override
  String toString() {
    return 'KDSStation(id: $id, name: $name, stationType: $stationType, online: $online)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$KDSStationImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.stationType, stationType) ||
                other.stationType == stationType) &&
            (identical(other.online, online) || other.online == online));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, stationType, online);

  /// Create a copy of KDSStation
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$KDSStationImplCopyWith<_$KDSStationImpl> get copyWith =>
      __$$KDSStationImplCopyWithImpl<_$KDSStationImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$KDSStationImplToJson(this);
  }
}

abstract class _KDSStation implements KDSStation {
  const factory _KDSStation({
    required final String id,
    required final String name,
    required final KDSStationType stationType,
    required final bool online,
  }) = _$KDSStationImpl;

  factory _KDSStation.fromJson(Map<String, dynamic> json) =
      _$KDSStationImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  KDSStationType get stationType;
  @override
  bool get online;

  /// Create a copy of KDSStation
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$KDSStationImplCopyWith<_$KDSStationImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

KDSTicket _$KDSTicketFromJson(Map<String, dynamic> json) {
  return _KDSTicket.fromJson(json);
}

/// @nodoc
mixin _$KDSTicket {
  String get id => throw _privateConstructorUsedError;
  String get tableNumber => throw _privateConstructorUsedError;
  String get serverName => throw _privateConstructorUsedError;
  KDSTicketStatus get status => throw _privateConstructorUsedError;
  DateTime get firedAt => throw _privateConstructorUsedError;
  List<KDSTicketItem> get items => throw _privateConstructorUsedError;

  /// Serializes this KDSTicket to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of KDSTicket
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $KDSTicketCopyWith<KDSTicket> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $KDSTicketCopyWith<$Res> {
  factory $KDSTicketCopyWith(KDSTicket value, $Res Function(KDSTicket) then) =
      _$KDSTicketCopyWithImpl<$Res, KDSTicket>;
  @useResult
  $Res call({
    String id,
    String tableNumber,
    String serverName,
    KDSTicketStatus status,
    DateTime firedAt,
    List<KDSTicketItem> items,
  });
}

/// @nodoc
class _$KDSTicketCopyWithImpl<$Res, $Val extends KDSTicket>
    implements $KDSTicketCopyWith<$Res> {
  _$KDSTicketCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of KDSTicket
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tableNumber = null,
    Object? serverName = null,
    Object? status = null,
    Object? firedAt = null,
    Object? items = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            tableNumber: null == tableNumber
                ? _value.tableNumber
                : tableNumber // ignore: cast_nullable_to_non_nullable
                      as String,
            serverName: null == serverName
                ? _value.serverName
                : serverName // ignore: cast_nullable_to_non_nullable
                      as String,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as KDSTicketStatus,
            firedAt: null == firedAt
                ? _value.firedAt
                : firedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            items: null == items
                ? _value.items
                : items // ignore: cast_nullable_to_non_nullable
                      as List<KDSTicketItem>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$KDSTicketImplCopyWith<$Res>
    implements $KDSTicketCopyWith<$Res> {
  factory _$$KDSTicketImplCopyWith(
    _$KDSTicketImpl value,
    $Res Function(_$KDSTicketImpl) then,
  ) = __$$KDSTicketImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String tableNumber,
    String serverName,
    KDSTicketStatus status,
    DateTime firedAt,
    List<KDSTicketItem> items,
  });
}

/// @nodoc
class __$$KDSTicketImplCopyWithImpl<$Res>
    extends _$KDSTicketCopyWithImpl<$Res, _$KDSTicketImpl>
    implements _$$KDSTicketImplCopyWith<$Res> {
  __$$KDSTicketImplCopyWithImpl(
    _$KDSTicketImpl _value,
    $Res Function(_$KDSTicketImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of KDSTicket
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tableNumber = null,
    Object? serverName = null,
    Object? status = null,
    Object? firedAt = null,
    Object? items = null,
  }) {
    return _then(
      _$KDSTicketImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        tableNumber: null == tableNumber
            ? _value.tableNumber
            : tableNumber // ignore: cast_nullable_to_non_nullable
                  as String,
        serverName: null == serverName
            ? _value.serverName
            : serverName // ignore: cast_nullable_to_non_nullable
                  as String,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as KDSTicketStatus,
        firedAt: null == firedAt
            ? _value.firedAt
            : firedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        items: null == items
            ? _value._items
            : items // ignore: cast_nullable_to_non_nullable
                  as List<KDSTicketItem>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$KDSTicketImpl implements _KDSTicket {
  const _$KDSTicketImpl({
    required this.id,
    required this.tableNumber,
    required this.serverName,
    required this.status,
    required this.firedAt,
    final List<KDSTicketItem> items = const [],
  }) : _items = items;

  factory _$KDSTicketImpl.fromJson(Map<String, dynamic> json) =>
      _$$KDSTicketImplFromJson(json);

  @override
  final String id;
  @override
  final String tableNumber;
  @override
  final String serverName;
  @override
  final KDSTicketStatus status;
  @override
  final DateTime firedAt;
  final List<KDSTicketItem> _items;
  @override
  @JsonKey()
  List<KDSTicketItem> get items {
    if (_items is EqualUnmodifiableListView) return _items;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_items);
  }

  @override
  String toString() {
    return 'KDSTicket(id: $id, tableNumber: $tableNumber, serverName: $serverName, status: $status, firedAt: $firedAt, items: $items)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$KDSTicketImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tableNumber, tableNumber) ||
                other.tableNumber == tableNumber) &&
            (identical(other.serverName, serverName) ||
                other.serverName == serverName) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.firedAt, firedAt) || other.firedAt == firedAt) &&
            const DeepCollectionEquality().equals(other._items, _items));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    tableNumber,
    serverName,
    status,
    firedAt,
    const DeepCollectionEquality().hash(_items),
  );

  /// Create a copy of KDSTicket
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$KDSTicketImplCopyWith<_$KDSTicketImpl> get copyWith =>
      __$$KDSTicketImplCopyWithImpl<_$KDSTicketImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$KDSTicketImplToJson(this);
  }
}

abstract class _KDSTicket implements KDSTicket {
  const factory _KDSTicket({
    required final String id,
    required final String tableNumber,
    required final String serverName,
    required final KDSTicketStatus status,
    required final DateTime firedAt,
    final List<KDSTicketItem> items,
  }) = _$KDSTicketImpl;

  factory _KDSTicket.fromJson(Map<String, dynamic> json) =
      _$KDSTicketImpl.fromJson;

  @override
  String get id;
  @override
  String get tableNumber;
  @override
  String get serverName;
  @override
  KDSTicketStatus get status;
  @override
  DateTime get firedAt;
  @override
  List<KDSTicketItem> get items;

  /// Create a copy of KDSTicket
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$KDSTicketImplCopyWith<_$KDSTicketImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

KDSTicketItem _$KDSTicketItemFromJson(Map<String, dynamic> json) {
  return _KDSTicketItem.fromJson(json);
}

/// @nodoc
mixin _$KDSTicketItem {
  String get id => throw _privateConstructorUsedError;
  String get menuItemId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  int get quantity => throw _privateConstructorUsedError;
  KDSItemStatus get status => throw _privateConstructorUsedError;
  String? get customNote => throw _privateConstructorUsedError;
  List<String> get modifiers => throw _privateConstructorUsedError;

  /// Serializes this KDSTicketItem to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of KDSTicketItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $KDSTicketItemCopyWith<KDSTicketItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $KDSTicketItemCopyWith<$Res> {
  factory $KDSTicketItemCopyWith(
    KDSTicketItem value,
    $Res Function(KDSTicketItem) then,
  ) = _$KDSTicketItemCopyWithImpl<$Res, KDSTicketItem>;
  @useResult
  $Res call({
    String id,
    String menuItemId,
    String name,
    int quantity,
    KDSItemStatus status,
    String? customNote,
    List<String> modifiers,
  });
}

/// @nodoc
class _$KDSTicketItemCopyWithImpl<$Res, $Val extends KDSTicketItem>
    implements $KDSTicketItemCopyWith<$Res> {
  _$KDSTicketItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of KDSTicketItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? menuItemId = null,
    Object? name = null,
    Object? quantity = null,
    Object? status = null,
    Object? customNote = freezed,
    Object? modifiers = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            menuItemId: null == menuItemId
                ? _value.menuItemId
                : menuItemId // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            quantity: null == quantity
                ? _value.quantity
                : quantity // ignore: cast_nullable_to_non_nullable
                      as int,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as KDSItemStatus,
            customNote: freezed == customNote
                ? _value.customNote
                : customNote // ignore: cast_nullable_to_non_nullable
                      as String?,
            modifiers: null == modifiers
                ? _value.modifiers
                : modifiers // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$KDSTicketItemImplCopyWith<$Res>
    implements $KDSTicketItemCopyWith<$Res> {
  factory _$$KDSTicketItemImplCopyWith(
    _$KDSTicketItemImpl value,
    $Res Function(_$KDSTicketItemImpl) then,
  ) = __$$KDSTicketItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String menuItemId,
    String name,
    int quantity,
    KDSItemStatus status,
    String? customNote,
    List<String> modifiers,
  });
}

/// @nodoc
class __$$KDSTicketItemImplCopyWithImpl<$Res>
    extends _$KDSTicketItemCopyWithImpl<$Res, _$KDSTicketItemImpl>
    implements _$$KDSTicketItemImplCopyWith<$Res> {
  __$$KDSTicketItemImplCopyWithImpl(
    _$KDSTicketItemImpl _value,
    $Res Function(_$KDSTicketItemImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of KDSTicketItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? menuItemId = null,
    Object? name = null,
    Object? quantity = null,
    Object? status = null,
    Object? customNote = freezed,
    Object? modifiers = null,
  }) {
    return _then(
      _$KDSTicketItemImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        menuItemId: null == menuItemId
            ? _value.menuItemId
            : menuItemId // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        quantity: null == quantity
            ? _value.quantity
            : quantity // ignore: cast_nullable_to_non_nullable
                  as int,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as KDSItemStatus,
        customNote: freezed == customNote
            ? _value.customNote
            : customNote // ignore: cast_nullable_to_non_nullable
                  as String?,
        modifiers: null == modifiers
            ? _value._modifiers
            : modifiers // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$KDSTicketItemImpl implements _KDSTicketItem {
  const _$KDSTicketItemImpl({
    required this.id,
    required this.menuItemId,
    required this.name,
    required this.quantity,
    required this.status,
    this.customNote,
    final List<String> modifiers = const [],
  }) : _modifiers = modifiers;

  factory _$KDSTicketItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$KDSTicketItemImplFromJson(json);

  @override
  final String id;
  @override
  final String menuItemId;
  @override
  final String name;
  @override
  final int quantity;
  @override
  final KDSItemStatus status;
  @override
  final String? customNote;
  final List<String> _modifiers;
  @override
  @JsonKey()
  List<String> get modifiers {
    if (_modifiers is EqualUnmodifiableListView) return _modifiers;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_modifiers);
  }

  @override
  String toString() {
    return 'KDSTicketItem(id: $id, menuItemId: $menuItemId, name: $name, quantity: $quantity, status: $status, customNote: $customNote, modifiers: $modifiers)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$KDSTicketItemImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.menuItemId, menuItemId) ||
                other.menuItemId == menuItemId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.customNote, customNote) ||
                other.customNote == customNote) &&
            const DeepCollectionEquality().equals(
              other._modifiers,
              _modifiers,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    menuItemId,
    name,
    quantity,
    status,
    customNote,
    const DeepCollectionEquality().hash(_modifiers),
  );

  /// Create a copy of KDSTicketItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$KDSTicketItemImplCopyWith<_$KDSTicketItemImpl> get copyWith =>
      __$$KDSTicketItemImplCopyWithImpl<_$KDSTicketItemImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$KDSTicketItemImplToJson(this);
  }
}

abstract class _KDSTicketItem implements KDSTicketItem {
  const factory _KDSTicketItem({
    required final String id,
    required final String menuItemId,
    required final String name,
    required final int quantity,
    required final KDSItemStatus status,
    final String? customNote,
    final List<String> modifiers,
  }) = _$KDSTicketItemImpl;

  factory _KDSTicketItem.fromJson(Map<String, dynamic> json) =
      _$KDSTicketItemImpl.fromJson;

  @override
  String get id;
  @override
  String get menuItemId;
  @override
  String get name;
  @override
  int get quantity;
  @override
  KDSItemStatus get status;
  @override
  String? get customNote;
  @override
  List<String> get modifiers;

  /// Create a copy of KDSTicketItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$KDSTicketItemImplCopyWith<_$KDSTicketItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
