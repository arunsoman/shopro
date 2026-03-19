package mls.sho.dms.application.service.inventory;

import mls.sho.dms.entity.inventory.VendorBidStatus;
import java.util.UUID;

/**
 * Service responsible for managing legal state transitions for Vendor Bids.
 */
public interface BidStateMachineService {

    /**
     * Transitions a bid to a target state.
     * @param bidId The bid to transition.
     * @param targetState The desired new status.
     * @param actorId The ID of the persona (Staff or Supplier) triggering the change.
     * @param reason Optional reason for the transition.
     */
    void transition(UUID bidId, VendorBidStatus targetState, UUID actorId, String reason);
}
