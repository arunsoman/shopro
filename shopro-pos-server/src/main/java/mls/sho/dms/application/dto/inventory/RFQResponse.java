package mls.sho.dms.application.dto.inventory;

import mls.sho.dms.entity.inventory.RfqStatus;
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
    Instant bidDeadline
) {}
