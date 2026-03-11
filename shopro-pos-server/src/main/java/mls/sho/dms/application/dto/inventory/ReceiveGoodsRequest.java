package mls.sho.dms.application.dto.inventory;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
public class ReceiveGoodsRequest {
    private UUID receiverId;
    private Map<UUID, BigDecimal> receivedQuantities;
    private String deliveryNoteReference;
    private String notes;
}
