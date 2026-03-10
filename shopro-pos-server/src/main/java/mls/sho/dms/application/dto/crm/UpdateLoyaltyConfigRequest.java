package mls.sho.dms.application.dto.crm;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record UpdateLoyaltyConfigRequest(
    @NotNull(message = "Earning rate is required")
    @DecimalMin(value = "0.01", message = "Earning rate must be greater than 0")
    BigDecimal earningRate,

    @NotNull(message = "Redemption value is required")
    @DecimalMin(value = "0.0001", message = "Redemption value must be greater than 0")
    BigDecimal redemptionValue,

    @Min(value = 1, message = "Minimum redemption points must be at least 1")
    int minimumRedemptionPoints,

    @Min(value = 0, message = "Expiration days cannot be negative")
    int pointExpirationDays,

    boolean defaultSmsOptIn,
    boolean defaultEmailOptIn,
    
    @Min(value = 1, message = "Feedback window must be at least 1 hour")
    int feedbackWindowHours,
    
    boolean smsGatewayEnabled,
    boolean emailGatewayEnabled
) {}
