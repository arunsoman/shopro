package mls.sho.dms.application.dto.crm;

import java.math.BigDecimal;
import java.util.UUID;

public record LoyaltyTierResponse(
    UUID id,
    String name,
    BigDecimal spendThreshold,
    BigDecimal pointMultiplier
) {}
