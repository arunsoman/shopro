// Order models and status enums

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
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'],
      menuItemId: json['menuItemId'],
      // Backend returns 'itemName', fallback to 'name' for compatibility
      name: json['itemName'] ?? json['name'],
      quantity: json['quantity'],
      unitPrice: (json['unitPrice'] as num).toDouble(),
      modifierUpchargeTotal: (json['modifierUpchargeTotal'] as num).toDouble(),
      // Backend returns 'lineTotal', fallback to 'calculatedTotal'
      calculatedTotal: ((json['lineTotal'] ?? json['calculatedTotal']) as num)
          .toDouble(),
      status: OrderItemStatus.values.firstWhere(
        (e) => e.name.toUpperCase() == (json['status'] as String).toUpperCase(),
        orElse: () => OrderItemStatus.pending,
      ),
      customNote: json['customNote'],
      hasAllergyFlag: json['hasAllergyFlag'] ?? false,
      isSubtraction: json['isSubtraction'] ?? false,
      courseNumber: json['courseNumber'] ?? 1,
      subtractions: const [],
      firedAt: json['firedAt'] != null ? DateTime.parse(json['firedAt']) : null,
      modifiers:
          (json['modifiers'] as List?)
              ?.map((m) => OrderItemModifier.fromJson(m))
              .toList() ??
          const [],
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
      id: json['id'],
      // Backend may return 'modifierOptionId' directly
      modifierOptionId: json['modifierOptionId'] as String,
      label: json['label'] as String,
      upchargeAmount: (json['upchargeAmount'] as num).toDouble(),
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
      id: json['id'],
      eventType: json['eventType'],
      details: json['details'],
      performedBy: json['performedBy'],
      createdAt: DateTime.parse(json['createdAt']),
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
  final String? ticketSuffix; // e.g., "A", "B" for multi-order tables
  final DateTime createdAt;
  final DateTime? paidAt;

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
  });

  factory OrderTicket.fromJson(Map<String, dynamic> json) {
    return OrderTicket(
      id: json['id'],
      orderNumber: json['orderNumber'],
      status: TicketStatus.values.firstWhere(
        (e) => e.name.toUpperCase() == (json['status'] as String).toUpperCase(),
        orElse: () => TicketStatus.open,
      ),
      orderType: OrderType.values.firstWhere(
        (e) =>
            e.name.toUpperCase() == (json['orderType'] as String).toUpperCase(),
        orElse: () => OrderType.dineIn,
      ),
      tableId: json['tableId'],
      // Backend returns 'tableName', fallback to 'tableDisplay'
      tableDisplay: json['tableName'] ?? json['tableDisplay'],
      serverId: json['serverId'],
      serverName: json['serverName'],
      customerProfileId: json['customerProfileId'],
      customerName: json['customerName'],
      deliveryAddress: json['deliveryAddress'],
      coverCount: json['coverCount'] as int,
      subtotal: (json['subtotal'] as num).toDouble(),
      taxAmount: (json['taxAmount'] as num).toDouble(),
      tipAmount: (json['tipAmount'] as num).toDouble(),
      discountAmount: (json['discountAmount'] as num).toDouble(),
      totalAmount: (json['totalAmount'] as num).toDouble(),
      items: (json['items'] as List).map((i) => OrderItem.fromJson(i)).toList(),
      auditTimeline:
          (json['auditTimeline'] as List?)
              ?.map((a) => OrderAuditEntry.fromJson(a))
              .toList() ??
          const [],
      ticketSuffix: json['ticketSuffix'],
      createdAt: DateTime.parse(json['createdAt']),
      paidAt: json['paidAt'] != null ? DateTime.parse(json['paidAt']) : null,
    );
  }
}
