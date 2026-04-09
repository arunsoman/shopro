package mls.sho.dms.application.event.inventory;

import mls.sho.dms.entity.inventory.vendor.VendorBid;
import mls.sho.dms.entity.inventory.vendor.VendorBidStatus;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

/**
 * Event fired whenever a Vendor Bid changes its status.
 */
public class BidStateChangedEvent extends ApplicationEvent {
    private final VendorBid bid;
    private final VendorBidStatus fromStatus;
    private final VendorBidStatus toStatus;
    private final UUID actorId;
    private final String reason;

    public BidStateChangedEvent(Object source, VendorBid bid, VendorBidStatus fromStatus, VendorBidStatus toStatus, UUID actorId, String reason) {
        super(source);
        this.bid = bid;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.actorId = actorId;
        this.reason = reason;
    }

    public VendorBid getBid() { return bid; }
    public VendorBidStatus getFromStatus() { return fromStatus; }
    public VendorBidStatus getToStatus() { return toStatus; }
    public UUID getActorId() { return actorId; }
    public String getReason() { return reason; }
}
