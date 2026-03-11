package mls.sho.dms.application.dto.inventory;

import mls.sho.dms.entity.inventory.VendorBidStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record VendorBidResponse(
    UUID id,
    UUID rfqId,
    UUID supplierId,
    String supplierName,
    BigDecimal unitPrice,
    BigDecimal quantityAvailable,
    LocalDate deliveryDate,
    String paymentTerms,
    String notes,
    VendorBidStatus status,
    Instant createdAt
) {}
