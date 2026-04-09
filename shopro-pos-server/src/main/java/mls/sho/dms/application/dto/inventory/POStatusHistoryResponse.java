package mls.sho.dms.application.dto.inventory;

import lombok.Builder;
import lombok.Data;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrderStatus;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class POStatusHistoryResponse {
    private UUID id;
    private PurchaseOrderStatus fromStatus;
    private PurchaseOrderStatus toStatus;
    private UUID actorId;
    private String actorName;
    private String reason;
    private Instant createdAt;
}
