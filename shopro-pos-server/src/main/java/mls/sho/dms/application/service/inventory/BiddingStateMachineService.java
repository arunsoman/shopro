package mls.sho.dms.application.service.inventory;

import mls.sho.dms.entity.inventory.RfqStatus;
import java.util.Set;
import java.util.UUID;

/**
 * Service to manage RFQ state transitions with validation and audit.
 */
public interface BiddingStateMachineService {
    
    /**
     * Transitions an RFQ to a target state.
     */
    void transition(UUID rfqId, RfqStatus targetState, UUID actorId, String reason);

    /**
     * Gets set of valid status transitions for the current state of an RFQ.
     */
    Set<RfqStatus> getAllowedTransitions(UUID rfqId);
}
