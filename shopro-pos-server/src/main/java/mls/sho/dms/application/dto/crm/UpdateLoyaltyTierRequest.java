package mls.sho.dms.application.dto.crm;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record UpdateLoyaltyTierRequest(
    @NotBlank(message = "Tier name is required")
    String name,

    @NotNull(message = "Spend threshold is required")
    @DecimalMin(value = "0.00", message = "Spend threshold cannot be negative")
    BigDecimal spendThreshold,

    @NotNull(message = "Point multiplier is required")
    @DecimalMin(value = "1.0", message = "Point multiplier must be at least 1.0")
    BigDecimal pointMultiplier
) {}
