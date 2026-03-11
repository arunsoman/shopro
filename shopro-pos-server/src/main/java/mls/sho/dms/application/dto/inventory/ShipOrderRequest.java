package mls.sho.dms.application.dto.inventory;

import lombok.Data;
import java.util.UUID;

@Data
public class ShipOrderRequest {
    private String trackingNumber;
    private String deliveryNoteRef;
    private UUID invoiceFileId;
}
