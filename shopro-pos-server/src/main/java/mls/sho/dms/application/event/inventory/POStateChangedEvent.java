package mls.sho.dms.application.event.inventory;

import mls.sho.dms.entity.inventory.procurement.PurchaseOrder;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrderStatus;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

/**
 * Event fired whenever a Purchase Order changes its status.
 */
public class POStateChangedEvent extends ApplicationEvent {
    private final PurchaseOrder purchaseOrder;
    private final PurchaseOrderStatus fromStatus;
    private final PurchaseOrderStatus toStatus;
    private final UUID actorId;
    private final String reason;

    public POStateChangedEvent(Object source, PurchaseOrder purchaseOrder, PurchaseOrderStatus fromStatus, PurchaseOrderStatus toStatus, UUID actorId, String reason) {
        super(source);
        this.purchaseOrder = purchaseOrder;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.actorId = actorId;
        this.reason = reason;
    }

    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public PurchaseOrderStatus getFromStatus() { return fromStatus; }
    public PurchaseOrderStatus getToStatus() { return toStatus; }
    public UUID getActorId() { return actorId; }
    public String getReason() { return reason; }
}
