package mls.sho.dms.application.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mls.sho.dms.entity.inventory.BatchStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryBatchResponse {
    private UUID id;
    private UUID ingredientId;
    private String ingredientName;
    private UUID locationId;
    private String locationName;
    private String batchNumber;
    private BigDecimal receivedQuantity;
    private BigDecimal currentQuantity;
    private BigDecimal costAtReceipt;
    private Instant receivedDate;
    private Instant expiryDate;
    private BatchStatus status;
}
