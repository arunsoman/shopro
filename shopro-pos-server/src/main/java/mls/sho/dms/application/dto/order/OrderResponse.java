package mls.sho.dms.application.dto.order;

import mls.sho.dms.entity.order.TicketStatus;
import mls.sho.dms.entity.order.OrderType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
    UUID id,
    String orderNumber, // Can be generated or ID-based
    TicketStatus status,
    OrderType orderType,
    UUID tableId,
    String tableName,
    UUID serverId,
    String serverName,
    UUID customerProfileId,
    String customerName,
    String deliveryAddress,
    int coverCount,
    BigDecimal subtotal,
    BigDecimal taxAmount,
    BigDecimal tipAmount,
    BigDecimal discountAmount,
    BigDecimal totalAmount,
    String vehicleModel,
    String vehicleColor,
    String vehiclePlate,
    List<OrderItemResponse> items,
    List<OrderAuditResponse> auditTimeline,
    Instant createdAt,
    Instant paidAt
) {}
