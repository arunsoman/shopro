// Order models and status enums

class TaxBreakdownEntry {
  final String ruleCode;
  final String ruleName;
  final double rate;
  final double amount;

  TaxBreakdownEntry({
    required this.ruleCode,
    required this.ruleName,
    required this.rate,
    required this.amount,
  });

  factory TaxBreakdownEntry.fromJson(Map<String, dynamic> json) {
    return TaxBreakdownEntry(
      ruleCode: json['ruleCode'] as String,
      ruleName: json['ruleName'] as String,
      rate: (json['rate'] as num).toDouble(),
      amount: (json['amount'] as num).toDouble(),
    );
  }
}

enum PaymentMethod { cash, card, giftCard, applePay, googlePay, mipay }

extension PaymentMethodExt on PaymentMethod {
  String get jsonValue {
    switch (this) {
      case PaymentMethod.cash:
        return 'CASH';
      case PaymentMethod.card:
        return 'CARD';
      case PaymentMethod.giftCard:
        return 'GIFT_CARD';
      case PaymentMethod.applePay:
        return 'APPLE_PAY';
      case PaymentMethod.googlePay:
        return 'GOOGLE_PAY';
      case PaymentMethod.mipay:
        return 'MIPAY';
    }
  }
}

enum OrderItemStatus { pending, held, sent, ready, delivered, voided }

extension OrderItemStatusExt on OrderItemStatus {
  String get jsonValue => name.toUpperCase();
}

enum OrderType { dineIn, takeaway, delivery, curbside }

extension OrderTypeExt on OrderType {
  String get jsonValue {
    switch (this) {
      case OrderType.dineIn:
        return 'DINE_IN';
      case OrderType.takeaway:
        return 'TAKEAWAY';
      case OrderType.delivery:
        return 'DELIVERY';
      case OrderType.curbside:
        return 'CURBSIDE';
    }
  }

  static OrderType fromJson(String value) {
    switch (value) {
      case 'DINE_IN':
        return OrderType.dineIn;
      case 'TAKEAWAY':
        return OrderType.takeaway;
      case 'DELIVERY':
        return OrderType.delivery;
      case 'CURBSIDE':
        return OrderType.curbside;
      default:
        return OrderType.dineIn;
    }
  }
}

enum TicketStatus {
  open,
  submitted,
  ready,
  served,
  partiallyPaid,
  paid,
  closed,
  voided,
}

extension TicketStatusExt on TicketStatus {
  String get jsonValue {
    if (this == TicketStatus.partiallyPaid) return 'PARTIALLY_PAID';
    return name.toUpperCase();
  }

  static TicketStatus fromJson(String value) {
    switch (value) {
      case 'OPEN':
        return TicketStatus.open;
      case 'SUBMITTED':
        return TicketStatus.submitted;
      case 'READY':
        return TicketStatus.ready;
      case 'PARTIALLY_PAID':
        return TicketStatus.partiallyPaid;
      case 'PAID':
        return TicketStatus.paid;
      case 'VOIDED':
        return TicketStatus.voided;
      default:
        return TicketStatus.open;
    }
  }
}

class OrderItem {
  final String id;
  final String menuItemId;
  final String name;
  final int quantity;
  final double unitPrice;
  final double modifierUpchargeTotal;
  final double calculatedTotal;
  final OrderItemStatus status;
  final String? customNote;
  final bool hasAllergyFlag;
  final bool isSubtraction;
  final int courseNumber;
  final List<String> subtractions;
  final DateTime? firedAt;
  final List<OrderItemModifier> modifiers;
  final List<TaxBreakdownEntry> taxBreakdowns;
  final bool isCancellable;
  OrderItem({
    required this.id,
    required this.menuItemId,
    required this.name,
    required this.quantity,
    required this.unitPrice,
    required this.modifierUpchargeTotal,
    required this.calculatedTotal,
    required this.status,
    this.customNote,
    this.hasAllergyFlag = false,
    this.isSubtraction = false,
    this.courseNumber = 1,
    this.subtractions = const [],
    this.firedAt,
    this.modifiers = const [],
    this.taxBreakdowns = const [],
    this.isCancellable = true,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id']?.toString() ?? '',
      menuItemId: json['menuItemId']?.toString() ?? '',
      name: (json['itemName'] ?? json['name'])?.toString() ?? 'Unknown Item',
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0.0,
      modifierUpchargeTotal: (json['modifierUpchargeTotal'] as num?)?.toDouble() ?? 0.0,
      calculatedTotal: ((json['lineTotal'] ?? json['calculatedTotal']) as num?)?.toDouble() ?? 0.0,
      status: OrderItemStatus.values.firstWhere(
        (e) => e.name.toUpperCase() == (json['status']?.toString().toUpperCase() ?? 'PENDING'),
        orElse: () => OrderItemStatus.pending,
      ),
      customNote: json['customNote']?.toString(),
      hasAllergyFlag: json['hasAllergyFlag'] ?? false,
      isSubtraction: json['isSubtraction'] ?? false,
      courseNumber: (json['courseNumber'] as num?)?.toInt() ?? 1,
      subtractions: const [],
      firedAt: json['firedAt'] != null ? DateTime.tryParse(json['firedAt'].toString()) : null,
      modifiers: (json['modifiers'] as List?)
              ?.map((m) => OrderItemModifier.fromJson(m as Map<String, dynamic>))
              .toList() ??
          const [],
      taxBreakdowns: (json['taxBreakdowns'] as List?)
              ?.map((t) => TaxBreakdownEntry.fromJson(t as Map<String, dynamic>))
              .toList() ??
          const [],
      isCancellable: json['isCancellable'] ?? true,
    );
  }
}

class OrderItemModifier {
  final String id;
  final String modifierOptionId;
  final String label;
  final double upchargeAmount;

  OrderItemModifier({
    required this.id,
    required this.modifierOptionId,
    required this.label,
    required this.upchargeAmount,
  });

  factory OrderItemModifier.fromJson(Map<String, dynamic> json) {
    return OrderItemModifier(
      id: json['id']?.toString() ?? '',
      modifierOptionId: json['modifierOptionId']?.toString() ?? '',
      label: json['label']?.toString() ?? 'Modifier',
      upchargeAmount: (json['upchargeAmount'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class OrderAuditEntry {
  final String id;
  final String eventType;
  final String details;
  final String performedBy;
  final DateTime createdAt;

  OrderAuditEntry({
    required this.id,
    required this.eventType,
    required this.details,
    required this.performedBy,
    required this.createdAt,
  });

  factory OrderAuditEntry.fromJson(Map<String, dynamic> json) {
    return OrderAuditEntry(
      id: json['id']?.toString() ?? '',
      eventType: json['eventType']?.toString() ?? 'SYSTEM',
      details: json['details']?.toString() ?? '',
      performedBy: json['performedBy']?.toString() ?? 'SYSTEM',
      createdAt: json['createdAt'] != null 
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}

class OrderTicket {
  final String id;
  final String orderNumber;
  final TicketStatus status;
  final OrderType orderType;
  final String? tableId;
  final String? tableDisplay;
  final String serverId;
  final String serverName;
  final String? customerProfileId;
  final String? customerName;
  final String? deliveryAddress;
  final int coverCount;
  final double subtotal;
  final double taxAmount;
  final double tipAmount;
  final double discountAmount;
  final double totalAmount;
  final List<OrderItem> items;
  final List<OrderAuditEntry> auditTimeline;
  final Map<String, double> taxSummary;
  final String? ticketSuffix; // e.g., "A", "B" for multi-order tables
  final DateTime createdAt;
  final DateTime? paidAt;
  final bool isCancellable;
  OrderTicket({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.orderType,
    this.tableId,
    this.tableDisplay,
    required this.serverId,
    required this.serverName,
    this.customerProfileId,
    this.customerName,
    this.deliveryAddress,
    required this.coverCount,
    required this.subtotal,
    required this.taxAmount,
    required this.tipAmount,
    required this.discountAmount,
    required this.totalAmount,
    required this.items,
    this.auditTimeline = const [],
    this.ticketSuffix,
    required this.createdAt,
    this.paidAt,
    this.taxSummary = const {},
    this.isCancellable = true,
  });

  OrderTicket copyWith({
    String? id,
    String? orderNumber,
    TicketStatus? status,
    OrderType? orderType,
    String? tableId,
    String? tableDisplay,
    String? serverId,
    String? serverName,
    String? customerProfileId,
    String? customerName,
    String? deliveryAddress,
    int? coverCount,
    double? subtotal,
    double? taxAmount,
    double? tipAmount,
    double? discountAmount,
    double? totalAmount,
    List<OrderItem>? items,
    List<OrderAuditEntry>? auditTimeline,
    Map<String, double>? taxSummary,
    String? ticketSuffix,
    DateTime? createdAt,
    DateTime? paidAt,
    bool? isCancellable,
  }) {
    return OrderTicket(
      id: id ?? this.id,
      orderNumber: orderNumber ?? this.orderNumber,
      status: status ?? this.status,
      orderType: orderType ?? this.orderType,
      tableId: tableId ?? this.tableId,
      tableDisplay: tableDisplay ?? this.tableDisplay,
      serverId: serverId ?? this.serverId,
      serverName: serverName ?? this.serverName,
      customerProfileId: customerProfileId ?? this.customerProfileId,
      customerName: customerName ?? this.customerName,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      coverCount: coverCount ?? this.coverCount,
      subtotal: subtotal ?? this.subtotal,
      taxAmount: taxAmount ?? this.taxAmount,
      tipAmount: tipAmount ?? this.tipAmount,
      discountAmount: discountAmount ?? this.discountAmount,
      totalAmount: totalAmount ?? this.totalAmount,
      items: items ?? this.items,
      auditTimeline: auditTimeline ?? this.auditTimeline,
      taxSummary: taxSummary ?? this.taxSummary,
      ticketSuffix: ticketSuffix ?? this.ticketSuffix,
      createdAt: createdAt ?? this.createdAt,
      paidAt: paidAt ?? this.paidAt,
      isCancellable: isCancellable ?? this.isCancellable,
    );
  }

  factory OrderTicket.fromJson(Map<String, dynamic> json) {
    return OrderTicket(
      id: json['id']?.toString() ?? '',
      orderNumber: json['orderNumber']?.toString() ?? 'ORD-0000',
      status: TicketStatus.values.firstWhere(
        (e) => e.name.toUpperCase() == (json['status']?.toString().toUpperCase() ?? 'OPEN'),
        orElse: () => TicketStatus.open,
      ),
      orderType: OrderType.values.firstWhere(
        (e) => e.name.toUpperCase() == (json['orderType']?.toString().toUpperCase() ?? 'DINE_IN'),
        orElse: () => OrderType.dineIn,
      ),
      tableId: json['tableId']?.toString(),
      tableDisplay: (json['tableName'] ?? json['tableDisplay'])?.toString(),
      serverId: json['serverId']?.toString() ?? '',
      serverName: json['serverName']?.toString() ?? 'Staff',
      customerProfileId: json['customerProfileId']?.toString(),
      customerName: json['customerName']?.toString(),
      deliveryAddress: json['deliveryAddress']?.toString(),
      coverCount: (json['coverCount'] as num?)?.toInt() ?? 1,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      taxAmount: (json['taxAmount'] as num?)?.toDouble() ?? 0.0,
      tipAmount: (json['tipAmount'] as num?)?.toDouble() ?? 0.0,
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0.0,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      items: (json['items'] as List?)
              ?.map((i) => OrderItem.fromJson(i as Map<String, dynamic>))
              .toList() ??
          const [],
      auditTimeline: (json['auditTimeline'] as List?)
              ?.map((a) => OrderAuditEntry.fromJson(a as Map<String, dynamic>))
              .toList() ??
          const [],
      ticketSuffix: json['ticketSuffix']?.toString(),
      createdAt: json['createdAt'] != null 
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      paidAt: json['paidAt'] != null ? DateTime.tryParse(json['paidAt'].toString()) : null,
      taxSummary: (json['taxSummary'] as Map<String, dynamic>?)?.map(
            (k, v) => MapEntry(k, (v as num?)?.toDouble() ?? 0.0),
          ) ??
          const {},
      isCancellable: json['isCancellable'] ?? true,
    );
  }
}
