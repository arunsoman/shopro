package mls.sho.dms.application.dto.inventory;

import mls.sho.dms.entity.inventory.procurement.RfqStatus;
import mls.sho.dms.entity.inventory.vendor.VendorBidStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RFQResponse(
    UUID id,
    UUID ingredientId,
    String ingredientName,
    BigDecimal requiredQty,
    RfqStatus status,
    LocalDate desiredDeliveryDate,
    Instant bidDeadline,
    boolean alreadyBid,
    VendorBidStatus currentBidStatus
) {}
