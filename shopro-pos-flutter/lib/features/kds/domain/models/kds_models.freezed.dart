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
  DateTime? get prepStartedAt => throw _privateConstructorUsedError;
  int get priority => throw _privateConstructorUsedError;
  int get preparationTimeMinutes => throw _privateConstructorUsedError;

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
    DateTime? prepStartedAt,
    int priority,
    int preparationTimeMinutes,
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
    Object? prepStartedAt = freezed,
    Object? priority = null,
    Object? preparationTimeMinutes = null,
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
            prepStartedAt: freezed == prepStartedAt
                ? _value.prepStartedAt
                : prepStartedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            priority: null == priority
                ? _value.priority
                : priority // ignore: cast_nullable_to_non_nullable
                      as int,
            preparationTimeMinutes: null == preparationTimeMinutes
                ? _value.preparationTimeMinutes
                : preparationTimeMinutes // ignore: cast_nullable_to_non_nullable
                      as int,
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
    DateTime? prepStartedAt,
    int priority,
    int preparationTimeMinutes,
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
    Object? prepStartedAt = freezed,
    Object? priority = null,
    Object? preparationTimeMinutes = null,
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
        prepStartedAt: freezed == prepStartedAt
            ? _value.prepStartedAt
            : prepStartedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        priority: null == priority
            ? _value.priority
            : priority // ignore: cast_nullable_to_non_nullable
                  as int,
        preparationTimeMinutes: null == preparationTimeMinutes
            ? _value.preparationTimeMinutes
            : preparationTimeMinutes // ignore: cast_nullable_to_non_nullable
                  as int,
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
    this.prepStartedAt,
    this.priority = 0,
    this.preparationTimeMinutes = 10,
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
  final DateTime? prepStartedAt;
  @override
  @JsonKey()
  final int priority;
  @override
  @JsonKey()
  final int preparationTimeMinutes;

  @override
  String toString() {
    return 'KDSTicketItem(id: $id, menuItemId: $menuItemId, name: $name, quantity: $quantity, status: $status, customNote: $customNote, modifiers: $modifiers, prepStartedAt: $prepStartedAt, priority: $priority, preparationTimeMinutes: $preparationTimeMinutes)';
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
            ) &&
            (identical(other.prepStartedAt, prepStartedAt) ||
                other.prepStartedAt == prepStartedAt) &&
            (identical(other.priority, priority) ||
                other.priority == priority) &&
            (identical(other.preparationTimeMinutes, preparationTimeMinutes) ||
                other.preparationTimeMinutes == preparationTimeMinutes));
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
    prepStartedAt,
    priority,
    preparationTimeMinutes,
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
    final DateTime? prepStartedAt,
    final int priority,
    final int preparationTimeMinutes,
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
  @override
  DateTime? get prepStartedAt;
  @override
  int get priority;
  @override
  int get preparationTimeMinutes;

  /// Create a copy of KDSTicketItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$KDSTicketItemImplCopyWith<_$KDSTicketItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
mixin _$KDSExpoGroup {
  String get tableNumber => throw _privateConstructorUsedError;
  DateTime? get occupancyStart => throw _privateConstructorUsedError;
  String? get serverName => throw _privateConstructorUsedError;
  int? get guestCount => throw _privateConstructorUsedError;
  List<KDSTicketItem> get items => throw _privateConstructorUsedError;
  List<String> get ticketIds => throw _privateConstructorUsedError;

  /// Create a copy of KDSExpoGroup
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $KDSExpoGroupCopyWith<KDSExpoGroup> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $KDSExpoGroupCopyWith<$Res> {
  factory $KDSExpoGroupCopyWith(
    KDSExpoGroup value,
    $Res Function(KDSExpoGroup) then,
  ) = _$KDSExpoGroupCopyWithImpl<$Res, KDSExpoGroup>;
  @useResult
  $Res call({
    String tableNumber,
    DateTime? occupancyStart,
    String? serverName,
    int? guestCount,
    List<KDSTicketItem> items,
    List<String> ticketIds,
  });
}

/// @nodoc
class _$KDSExpoGroupCopyWithImpl<$Res, $Val extends KDSExpoGroup>
    implements $KDSExpoGroupCopyWith<$Res> {
  _$KDSExpoGroupCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of KDSExpoGroup
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? tableNumber = null,
    Object? occupancyStart = freezed,
    Object? serverName = freezed,
    Object? guestCount = freezed,
    Object? items = null,
    Object? ticketIds = null,
  }) {
    return _then(
      _value.copyWith(
            tableNumber: null == tableNumber
                ? _value.tableNumber
                : tableNumber // ignore: cast_nullable_to_non_nullable
                      as String,
            occupancyStart: freezed == occupancyStart
                ? _value.occupancyStart
                : occupancyStart // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            serverName: freezed == serverName
                ? _value.serverName
                : serverName // ignore: cast_nullable_to_non_nullable
                      as String?,
            guestCount: freezed == guestCount
                ? _value.guestCount
                : guestCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            items: null == items
                ? _value.items
                : items // ignore: cast_nullable_to_non_nullable
                      as List<KDSTicketItem>,
            ticketIds: null == ticketIds
                ? _value.ticketIds
                : ticketIds // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$KDSExpoGroupImplCopyWith<$Res>
    implements $KDSExpoGroupCopyWith<$Res> {
  factory _$$KDSExpoGroupImplCopyWith(
    _$KDSExpoGroupImpl value,
    $Res Function(_$KDSExpoGroupImpl) then,
  ) = __$$KDSExpoGroupImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String tableNumber,
    DateTime? occupancyStart,
    String? serverName,
    int? guestCount,
    List<KDSTicketItem> items,
    List<String> ticketIds,
  });
}

/// @nodoc
class __$$KDSExpoGroupImplCopyWithImpl<$Res>
    extends _$KDSExpoGroupCopyWithImpl<$Res, _$KDSExpoGroupImpl>
    implements _$$KDSExpoGroupImplCopyWith<$Res> {
  __$$KDSExpoGroupImplCopyWithImpl(
    _$KDSExpoGroupImpl _value,
    $Res Function(_$KDSExpoGroupImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of KDSExpoGroup
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? tableNumber = null,
    Object? occupancyStart = freezed,
    Object? serverName = freezed,
    Object? guestCount = freezed,
    Object? items = null,
    Object? ticketIds = null,
  }) {
    return _then(
      _$KDSExpoGroupImpl(
        tableNumber: null == tableNumber
            ? _value.tableNumber
            : tableNumber // ignore: cast_nullable_to_non_nullable
                  as String,
        occupancyStart: freezed == occupancyStart
            ? _value.occupancyStart
            : occupancyStart // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        serverName: freezed == serverName
            ? _value.serverName
            : serverName // ignore: cast_nullable_to_non_nullable
                  as String?,
        guestCount: freezed == guestCount
            ? _value.guestCount
            : guestCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        items: null == items
            ? _value._items
            : items // ignore: cast_nullable_to_non_nullable
                  as List<KDSTicketItem>,
        ticketIds: null == ticketIds
            ? _value._ticketIds
            : ticketIds // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc

class _$KDSExpoGroupImpl implements _KDSExpoGroup {
  const _$KDSExpoGroupImpl({
    required this.tableNumber,
    required this.occupancyStart,
    this.serverName,
    this.guestCount,
    final List<KDSTicketItem> items = const [],
    final List<String> ticketIds = const [],
  }) : _items = items,
       _ticketIds = ticketIds;

  @override
  final String tableNumber;
  @override
  final DateTime? occupancyStart;
  @override
  final String? serverName;
  @override
  final int? guestCount;
  final List<KDSTicketItem> _items;
  @override
  @JsonKey()
  List<KDSTicketItem> get items {
    if (_items is EqualUnmodifiableListView) return _items;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_items);
  }

  final List<String> _ticketIds;
  @override
  @JsonKey()
  List<String> get ticketIds {
    if (_ticketIds is EqualUnmodifiableListView) return _ticketIds;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_ticketIds);
  }

  @override
  String toString() {
    return 'KDSExpoGroup(tableNumber: $tableNumber, occupancyStart: $occupancyStart, serverName: $serverName, guestCount: $guestCount, items: $items, ticketIds: $ticketIds)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$KDSExpoGroupImpl &&
            (identical(other.tableNumber, tableNumber) ||
                other.tableNumber == tableNumber) &&
            (identical(other.occupancyStart, occupancyStart) ||
                other.occupancyStart == occupancyStart) &&
            (identical(other.serverName, serverName) ||
                other.serverName == serverName) &&
            (identical(other.guestCount, guestCount) ||
                other.guestCount == guestCount) &&
            const DeepCollectionEquality().equals(other._items, _items) &&
            const DeepCollectionEquality().equals(
              other._ticketIds,
              _ticketIds,
            ));
  }

  @override
  int get hashCode => Object.hash(
    runtimeType,
    tableNumber,
    occupancyStart,
    serverName,
    guestCount,
    const DeepCollectionEquality().hash(_items),
    const DeepCollectionEquality().hash(_ticketIds),
  );

  /// Create a copy of KDSExpoGroup
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$KDSExpoGroupImplCopyWith<_$KDSExpoGroupImpl> get copyWith =>
      __$$KDSExpoGroupImplCopyWithImpl<_$KDSExpoGroupImpl>(this, _$identity);
}

abstract class _KDSExpoGroup implements KDSExpoGroup {
  const factory _KDSExpoGroup({
    required final String tableNumber,
    required final DateTime? occupancyStart,
    final String? serverName,
    final int? guestCount,
    final List<KDSTicketItem> items,
    final List<String> ticketIds,
  }) = _$KDSExpoGroupImpl;

  @override
  String get tableNumber;
  @override
  DateTime? get occupancyStart;
  @override
  String? get serverName;
  @override
  int? get guestCount;
  @override
  List<KDSTicketItem> get items;
  @override
  List<String> get ticketIds;

  /// Create a copy of KDSExpoGroup
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$KDSExpoGroupImplCopyWith<_$KDSExpoGroupImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
mixin _$KDSAllDayItem {
  String get name => throw _privateConstructorUsedError;
  int get totalQuantity => throw _privateConstructorUsedError;
  int get quantityPending => throw _privateConstructorUsedError;
  int get quantityReady => throw _privateConstructorUsedError;
  String get category => throw _privateConstructorUsedError;

  /// Create a copy of KDSAllDayItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $KDSAllDayItemCopyWith<KDSAllDayItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $KDSAllDayItemCopyWith<$Res> {
  factory $KDSAllDayItemCopyWith(
    KDSAllDayItem value,
    $Res Function(KDSAllDayItem) then,
  ) = _$KDSAllDayItemCopyWithImpl<$Res, KDSAllDayItem>;
  @useResult
  $Res call({
    String name,
    int totalQuantity,
    int quantityPending,
    int quantityReady,
    String category,
  });
}

/// @nodoc
class _$KDSAllDayItemCopyWithImpl<$Res, $Val extends KDSAllDayItem>
    implements $KDSAllDayItemCopyWith<$Res> {
  _$KDSAllDayItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of KDSAllDayItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? totalQuantity = null,
    Object? quantityPending = null,
    Object? quantityReady = null,
    Object? category = null,
  }) {
    return _then(
      _value.copyWith(
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            totalQuantity: null == totalQuantity
                ? _value.totalQuantity
                : totalQuantity // ignore: cast_nullable_to_non_nullable
                      as int,
            quantityPending: null == quantityPending
                ? _value.quantityPending
                : quantityPending // ignore: cast_nullable_to_non_nullable
                      as int,
            quantityReady: null == quantityReady
                ? _value.quantityReady
                : quantityReady // ignore: cast_nullable_to_non_nullable
                      as int,
            category: null == category
                ? _value.category
                : category // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$KDSAllDayItemImplCopyWith<$Res>
    implements $KDSAllDayItemCopyWith<$Res> {
  factory _$$KDSAllDayItemImplCopyWith(
    _$KDSAllDayItemImpl value,
    $Res Function(_$KDSAllDayItemImpl) then,
  ) = __$$KDSAllDayItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String name,
    int totalQuantity,
    int quantityPending,
    int quantityReady,
    String category,
  });
}

/// @nodoc
class __$$KDSAllDayItemImplCopyWithImpl<$Res>
    extends _$KDSAllDayItemCopyWithImpl<$Res, _$KDSAllDayItemImpl>
    implements _$$KDSAllDayItemImplCopyWith<$Res> {
  __$$KDSAllDayItemImplCopyWithImpl(
    _$KDSAllDayItemImpl _value,
    $Res Function(_$KDSAllDayItemImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of KDSAllDayItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? totalQuantity = null,
    Object? quantityPending = null,
    Object? quantityReady = null,
    Object? category = null,
  }) {
    return _then(
      _$KDSAllDayItemImpl(
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        totalQuantity: null == totalQuantity
            ? _value.totalQuantity
            : totalQuantity // ignore: cast_nullable_to_non_nullable
                  as int,
        quantityPending: null == quantityPending
            ? _value.quantityPending
            : quantityPending // ignore: cast_nullable_to_non_nullable
                  as int,
        quantityReady: null == quantityReady
            ? _value.quantityReady
            : quantityReady // ignore: cast_nullable_to_non_nullable
                  as int,
        category: null == category
            ? _value.category
            : category // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc

class _$KDSAllDayItemImpl implements _KDSAllDayItem {
  const _$KDSAllDayItemImpl({
    required this.name,
    required this.totalQuantity,
    required this.quantityPending,
    required this.quantityReady,
    required this.category,
  });

  @override
  final String name;
  @override
  final int totalQuantity;
  @override
  final int quantityPending;
  @override
  final int quantityReady;
  @override
  final String category;

  @override
  String toString() {
    return 'KDSAllDayItem(name: $name, totalQuantity: $totalQuantity, quantityPending: $quantityPending, quantityReady: $quantityReady, category: $category)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$KDSAllDayItemImpl &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.totalQuantity, totalQuantity) ||
                other.totalQuantity == totalQuantity) &&
            (identical(other.quantityPending, quantityPending) ||
                other.quantityPending == quantityPending) &&
            (identical(other.quantityReady, quantityReady) ||
                other.quantityReady == quantityReady) &&
            (identical(other.category, category) ||
                other.category == category));
  }

  @override
  int get hashCode => Object.hash(
    runtimeType,
    name,
    totalQuantity,
    quantityPending,
    quantityReady,
    category,
  );

  /// Create a copy of KDSAllDayItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$KDSAllDayItemImplCopyWith<_$KDSAllDayItemImpl> get copyWith =>
      __$$KDSAllDayItemImplCopyWithImpl<_$KDSAllDayItemImpl>(this, _$identity);
}

abstract class _KDSAllDayItem implements KDSAllDayItem {
  const factory _KDSAllDayItem({
    required final String name,
    required final int totalQuantity,
    required final int quantityPending,
    required final int quantityReady,
    required final String category,
  }) = _$KDSAllDayItemImpl;

  @override
  String get name;
  @override
  int get totalQuantity;
  @override
  int get quantityPending;
  @override
  int get quantityReady;
  @override
  String get category;

  /// Create a copy of KDSAllDayItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$KDSAllDayItemImplCopyWith<_$KDSAllDayItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
