package mls.sho.dms.application.dto.order;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemModifierResponse(
    UUID id,
    UUID modifierOptionId,
    String label,
    BigDecimal upchargeAmount
) {}
