package mls.sho.dms.application.dto.inventory;

import java.math.BigDecimal;
import java.util.UUID;

public record SupplierResponse(
    UUID id,
    String companyName,
    String contactName,
    String contactEmail,
    String contactPhone,
    int leadTimeDays,
    BigDecimal vendorRating
) {}
