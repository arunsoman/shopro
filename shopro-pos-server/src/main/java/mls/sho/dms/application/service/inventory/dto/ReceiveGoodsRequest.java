package mls.sho.dms.application.service.inventory.dto;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public class ReceiveGoodsRequest {
    private UUID receiverId;
    private Map<UUID, BigDecimal> receivedQuantities; // Ingredient ID -> Quantity
    private String deliveryNoteReference;
    private String notes;

    public UUID getReceiverId() { return receiverId; }
    public void setReceiverId(UUID receiverId) { this.receiverId = receiverId; }
    public Map<UUID, BigDecimal> getReceivedQuantities() { return receivedQuantities; }
    public void setReceivedQuantities(Map<UUID, BigDecimal> receivedQuantities) { this.receivedQuantities = receivedQuantities; }
    public String getDeliveryNoteReference() { return deliveryNoteReference; }
    public void setDeliveryNoteReference(String deliveryNoteReference) { this.deliveryNoteReference = deliveryNoteReference; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
