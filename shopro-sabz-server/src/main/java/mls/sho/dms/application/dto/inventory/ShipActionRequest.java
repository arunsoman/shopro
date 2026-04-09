package mls.sho.dms.application.dto.inventory;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class ShipActionRequest {
    private String trackingNumber;
    private String deliveryNoteRef;
    private UUID invoiceFileId;
}
