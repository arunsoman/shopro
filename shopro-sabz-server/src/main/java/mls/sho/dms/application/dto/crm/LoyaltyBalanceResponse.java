package mls.sho.dms.application.dto.crm;

import java.math.BigDecimal;
import java.util.UUID;

public record LoyaltyBalanceResponse(
    UUID customerId,
    int availablePoints,
    BigDecimal lifetimeSpend,
    String tierName,
    BigDecimal pointMultiplier,
    BigDecimal nextTierThreshold,
    BigDecimal spendToNextTier
) {}
