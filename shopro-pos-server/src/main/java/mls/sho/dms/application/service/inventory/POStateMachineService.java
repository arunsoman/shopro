package mls.sho.dms.application.service.inventory;

import mls.sho.dms.entity.inventory.PurchaseOrderStatus;
import java.util.Set;
import java.util.UUID;

/**
 * Service responsible for managing legal state transitions for Purchase Orders.
 */
public interface POStateMachineService {

    /**
     * Attempts to transition a PO to a new status.
     * @param poId The PO to transition.
     * @param targetState The desired new status.
     * @param actorId The ID of the persona (Staff or Supplier) triggering the change.
     * @param reason Optional reason for the transition.
     * @throws IllegalStateException if the transition is not allowed.
     */
    void transition(UUID poId, PurchaseOrderStatus targetState, UUID actorId, String reason);

    /**
     * Returns the set of statuses the PO can legally move to from its current state.
     */
    Set<PurchaseOrderStatus> getAllowedTransitions(UUID poId);
}
