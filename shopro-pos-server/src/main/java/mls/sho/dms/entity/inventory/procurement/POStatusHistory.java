package mls.sho.dms.entity.inventory.procurement;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.util.UUID;

/**
 * Audit trail for all Purchase Order status changes.
 */
@Entity
@Table(name = "po_status_history", indexes = {
    @Index(name = "idx_po_history_po_id", columnList = "po_id")
})
public class POStatusHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "po_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 25)
    private PurchaseOrderStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 25)
    private PurchaseOrderStatus toStatus;

    @Column(name = "actor_id", nullable = false)
    private UUID actorId;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(PurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }
    public PurchaseOrderStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(PurchaseOrderStatus fromStatus) { this.fromStatus = fromStatus; }
    public PurchaseOrderStatus getToStatus() { return toStatus; }
    public void setToStatus(PurchaseOrderStatus toStatus) { this.toStatus = toStatus; }
    public UUID getActorId() { return actorId; }
    public void setActorId(UUID actorId) { this.actorId = actorId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
