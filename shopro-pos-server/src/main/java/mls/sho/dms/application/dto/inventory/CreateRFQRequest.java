package mls.sho.dms.application.dto.inventory;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateRFQRequest(
    @NotNull UUID ingredientId,
    @NotNull @DecimalMin("0.0001") BigDecimal requiredQty,
    @NotNull LocalDate desiredDeliveryDate
) {}
