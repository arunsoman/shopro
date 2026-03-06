package mls.sho.dms.dto.order;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemModifierDto(
    UUID id,
    UUID modifierOptionId,
    String optionName,
    BigDecimal upchargeAmount
) {}
