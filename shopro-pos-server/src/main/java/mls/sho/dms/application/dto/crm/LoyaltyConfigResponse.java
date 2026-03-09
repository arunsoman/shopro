package mls.sho.dms.application.dto.crm;

import java.math.BigDecimal;
import java.util.UUID;

public record LoyaltyConfigResponse(
    UUID id,
    BigDecimal earningRate,
    BigDecimal redemptionValue,
    int minimumRedemptionPoints,
    int pointExpirationDays,
    boolean defaultSmsOptIn,
    boolean defaultEmailOptIn,
    int feedbackWindowHours,
    boolean smsGatewayEnabled,
    boolean emailGatewayEnabled
) {}
