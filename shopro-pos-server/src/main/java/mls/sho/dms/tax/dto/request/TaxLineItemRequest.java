package mls.sho.dms.tax.dto.request;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record TaxLineItemRequest(
    @NotNull UUID itemId,
    @NotNull BigDecimal unitPrice,
    @NotNull Integer quantity,
    String temperature, // HOT, COLD
    String itemCategory // FOOD, BEVERAGE, ALCOHOL, TOBACCO
) {}
