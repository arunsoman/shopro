package mls.sho.dms.application.dto.inventory;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record VendorBidRequest(
    @NotNull UUID supplierId,
    @NotNull @DecimalMin("0.0001") BigDecimal unitPrice,
    @NotNull @DecimalMin("0.0001") BigDecimal quantityAvailable,
    @NotNull LocalDate deliveryDate,
    String paymentTerms,
    String notes
) {}
