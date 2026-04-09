package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.CreatePurchaseOrderRequest;
import mls.sho.dms.application.dto.inventory.PurchaseOrderResponse;
import mls.sho.dms.application.dto.inventory.POStatusHistoryResponse;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrder;

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

    /**
     * Creates a manual Purchase Order.
     */
    PurchaseOrder createOrder(CreatePurchaseOrderRequest request, UUID generatedById);

    /**
     * Cancels a Purchase Order if it is in a revokable state.
     */
    void cancelOrder(UUID poId);

    /**
     * Sends an APPROVED Purchase Order to the supplier.
     */
    PurchaseOrder sendOrder(UUID poId, UUID staffId);

    /**
     * Acknowledges a Purchase Order by the supplier.
     */
    PurchaseOrder acknowledgeOrder(UUID poId);

    /**
     * Marks a Purchase Order as shipped/sent by the supplier.
     */
    PurchaseOrder shipOrder(UUID poId, String trackingNumber, String deliveryNoteRef, UUID invoiceFileId);
    
    List<POStatusHistoryResponse> getStatusHistory(UUID poId);
}
