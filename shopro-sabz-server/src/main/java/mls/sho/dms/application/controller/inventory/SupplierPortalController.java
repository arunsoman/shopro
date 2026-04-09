package mls.sho.dms.application.controller.inventory;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.*;
import mls.sho.dms.application.service.inventory.SupplierPortalService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/supplier/portal")
@RequiredArgsConstructor
public class SupplierPortalController {

    private final SupplierPortalService portalService;

    @GetMapping("/{supplierId}/dashboard")
    public SupplierDashboardResponse getDashboard(@PathVariable UUID supplierId) {
        return portalService.getDashboard(supplierId);
    }

    @GetMapping("/{supplierId}/rfqs")
    public List<RFQResponse> getActiveRfqs(@PathVariable UUID supplierId) {
        return portalService.getActiveRfqs(supplierId);
    }

    @GetMapping("/{supplierId}/inventory")
    public List<SupplierInventoryView> getInventoryVisibility(@PathVariable UUID supplierId) {
        return portalService.getInventoryVisibility(supplierId);
    }

    @PostMapping("/{rfqId}/bid")
    public void submitBid(@PathVariable UUID rfqId, @RequestParam UUID userId, @RequestBody VendorBidRequest bidRequest) {
        portalService.submitPortalBid(rfqId, userId, bidRequest);
    }

    @PostMapping("/propose-price")
    public void proposePrice(@RequestParam UUID userId, @RequestBody VendorPriceProposalRequest proposalRequest) {
        portalService.proposePrice(userId, proposalRequest);
    }

    @GetMapping("/{supplierId}/pos")
    public List<PurchaseOrderResponse> getPurchaseOrders(@PathVariable UUID supplierId) {
        return portalService.getPurchaseOrders(supplierId);
    }

    @GetMapping("/{supplierId}/proposals")
    public List<PriceProposalResponse> getMyProposals(@PathVariable UUID supplierId) {
        return portalService.getMyProposals(supplierId);
    }

    @PostMapping("/pos/{poId}/acknowledge")
    public PurchaseOrderResponse acknowledgeOrder(@PathVariable UUID poId, @RequestParam UUID userId) {
        return portalService.acknowledgeOrder(userId, poId);
    }

    @PostMapping("/pos/{poId}/counter-offer")
    public PurchaseOrderResponse counterOfferOrder(@PathVariable UUID poId, @RequestParam UUID userId, @RequestBody CounterOfferRequest request) {
        return portalService.counterOfferOrder(userId, poId, request);
    }

    @PostMapping("/pos/{poId}/ship")
    public PurchaseOrderResponse shipOrder(@PathVariable UUID poId, @RequestParam UUID userId, @RequestBody ShipActionRequest request) {
        return portalService.shipOrder(userId, poId, request);
    }
}
