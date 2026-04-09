package mls.sho.dms.dto.order;

import mls.sho.dms.entity.order.OrderType;
import mls.sho.dms.entity.order.TicketStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderTicketDto(
    UUID id,
    UUID tableId,
    String tableDisplay,
    UUID serverId,
    String serverName,
    TicketStatus status,
    OrderType orderType,
    UUID customerProfileId,
    String deliveryAddress,
    int coverCount,
    BigDecimal subtotal,
    BigDecimal taxAmount,
    BigDecimal tipAmount,
    BigDecimal discountAmount,
    BigDecimal totalAmount,
    Instant createdAt,
    Instant paidAt,
    List<OrderItemDto> items
) {}
