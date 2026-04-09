package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.*;

import java.util.List;
import java.util.UUID;

public interface SupplierPortalService {
    SupplierDashboardResponse getDashboard(UUID supplierId);
    List<RFQResponse> getActiveRfqs(UUID supplierId);
    List<SupplierInventoryView> getInventoryVisibility(UUID supplierId);
    void submitPortalBid(UUID rfqId, UUID supplierUserId, VendorBidRequest request);
    void proposePrice(UUID supplierUserId, VendorPriceProposalRequest proposal);
    List<PurchaseOrderResponse> getPurchaseOrders(UUID supplierId);
    List<PriceProposalResponse> getMyProposals(UUID supplierId);
    
    PurchaseOrderResponse acknowledgeOrder(UUID supplierUserId, UUID poId);
    PurchaseOrderResponse counterOfferOrder(UUID supplierUserId, UUID poId, CounterOfferRequest request);
    PurchaseOrderResponse shipOrder(UUID supplierUserId, UUID poId, ShipActionRequest request);
}
