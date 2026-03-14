package mls.sho.dms.tax.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record TaxCalculationRequest(
    @NotNull UUID ticketId,
    @NotNull String orderType, // DINE_IN, TAKEAWAY
    BigDecimal serviceChargeAmount,
    @NotEmpty List<TaxLineItemRequest> items
) {}
