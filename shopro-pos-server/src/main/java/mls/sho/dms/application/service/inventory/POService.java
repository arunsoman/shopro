package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.PurchaseOrderResponse;
import mls.sho.dms.entity.inventory.PurchaseOrder;

import java.util.List;
import java.util.UUID;

public interface POService {
    
    List<PurchaseOrderResponse> findAll();

    /**
     * Submits a Draft PO for approval routing based on value.
     */
    PurchaseOrder submitForApproval(UUID poId);

    /**
     * Approves a Pending PO. Must validate user role against the required tier.
     */
    PurchaseOrder approveOrder(UUID poId, UUID approverId);

    /**
     * Rejects a Pending PO.
     */
    PurchaseOrder rejectOrder(UUID poId, UUID approverId, String reason);
}
