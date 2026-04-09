package mls.sho.dms.application.dto.inventory;

import lombok.Builder;
import lombok.Data;
import mls.sho.dms.entity.inventory.InventoryTransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class WasteLogResponse {
    private UUID id;
    private Instant transactedAt;
    private UUID ingredientId;
    private String ingredientName;
    private UUID batchId;
    private BigDecimal quantityDelta;
    private String unitOfMeasure;
    private InventoryTransactionType type;
    private BigDecimal value;
    private String supplierName;
    private String reason;
    private String evidenceUrl;
    private String notes;
}
