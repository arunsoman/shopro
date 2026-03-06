package mls.sho.dms.application.dto.order;

import mls.sho.dms.entity.order.OrderItemStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderItemResponse(
    UUID id,
    UUID menuItemId,
    String itemName,
    int quantity,
    BigDecimal unitPrice,
    BigDecimal modifierUpchargeTotal,
    BigDecimal lineTotal, // quantity * (unitPrice + modifierUpchargeTotal)
    OrderItemStatus status,
    String customNote,
    boolean hasAllergyFlag,
    boolean isSubtraction,
    int courseNumber,
    Instant firedAt,
    List<OrderItemModifierResponse> modifiers
) {}
