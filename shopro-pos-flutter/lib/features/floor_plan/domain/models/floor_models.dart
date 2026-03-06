enum TableStatus {
  available,
  occupied,
  ordered,
  delivered,
  dirty,
  held,
  inactive,
}

enum TableShape { rectangle, round, oval, decor }

class TableInfo {
  final String id;
  final String name;
  final int capacity;
  final TableStatus status;
  final double posX;
  final double posY;
  final double width;
  final double height;
  final String? currentOrderTime;
  final TableShape shape;
  final String? sectionId;
  final String? assignedStaffId;
  final String? assignedStaffName;

  TableInfo({
    required this.id,
    required this.name,
    required this.capacity,
    required this.status,
    required this.posX,
    required this.posY,
    required this.width,
    required this.height,
    this.currentOrderTime,
    this.shape = TableShape.rectangle,
    this.sectionId,
    this.assignedStaffId,
    this.assignedStaffName,
  });

  TableInfo copyWith({
    String? id,
    String? name,
    int? capacity,
    TableStatus? status,
    double? posX,
    double? posY,
    double? width,
    double? height,
    String? currentOrderTime,
    TableShape? shape,
    String? sectionId,
    String? assignedStaffId,
    String? assignedStaffName,
  }) {
    return TableInfo(
      id: id ?? this.id,
      name: name ?? this.name,
      capacity: capacity ?? this.capacity,
      status: status ?? this.status,
      posX: posX ?? this.posX,
      posY: posY ?? this.posY,
      width: width ?? this.width,
      height: height ?? this.height,
      currentOrderTime: currentOrderTime ?? this.currentOrderTime,
      shape: shape ?? this.shape,
      sectionId: sectionId ?? this.sectionId,
      assignedStaffId: assignedStaffId ?? this.assignedStaffId,
      assignedStaffName: assignedStaffName ?? this.assignedStaffName,
    );
  }
}

enum WaitlistStatus { waiting, ready, seated, cancelled }

class WaitlistEntry {
  final String id;
  final String customerName;
  final int partySize;
  final String waitTimeDisplay;
  final WaitlistStatus status;
  final bool isVIP;

  WaitlistEntry({
    required this.id,
    required this.customerName,
    required this.partySize,
    required this.waitTimeDisplay,
    required this.status,
    this.isVIP = false,
  });

  WaitlistEntry copyWith({
    String? id,
    String? customerName,
    int? partySize,
    String? waitTimeDisplay,
    WaitlistStatus? status,
    bool? isVIP,
  }) {
    return WaitlistEntry(
      id: id ?? this.id,
      customerName: customerName ?? this.customerName,
      partySize: partySize ?? this.partySize,
      waitTimeDisplay: waitTimeDisplay ?? this.waitTimeDisplay,
      status: status ?? this.status,
      isVIP: isVIP ?? this.isVIP,
    );
  }
}
