package mls.sho.dms.dto.order;

import mls.sho.dms.entity.order.OrderItemStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderItemDto(
    UUID id,
    UUID menuItemId,
    String name,
    int quantity,
    BigDecimal unitPrice,
    BigDecimal modifierUpchargeTotal,
    BigDecimal calculatedTotal,
    OrderItemStatus status,
    String customNote,
    boolean hasAllergyFlag,
    boolean isSubtraction,
    int courseNumber,
    java.time.Instant firedAt,
    List<OrderItemModifierDto> modifiers
) {}
