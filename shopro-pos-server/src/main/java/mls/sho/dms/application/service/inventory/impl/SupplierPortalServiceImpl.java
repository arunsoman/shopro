package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.inventory.*;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.SupplierPortalService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.repository.inventory.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplierPortalServiceImpl implements SupplierPortalService {

    private final RFQRepository rfqRepository;
    private final VendorBidRepository bidRepository;
    private final SupplierUserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final SupplierIngredientPricingRepository pricingRepository;
    private final AlertService alertService;

    @Override
    @Transactional(readOnly = true)
    public SupplierDashboardResponse getDashboard(UUID supplierId) {
        // Active RFQs for ingredients they supply
        List<UUID> ingredientIds = pricingRepository.findByIngredientIdInSupplierCatalog(supplierId);
        int activeRfqs = rfqRepository.countActiveRfqsByIngredientIds(ingredientIds, RfqStatus.OPEN);
        
        long pendingBids = bidRepository.countBySupplierIdAndStatus(supplierId, VendorBidStatus.SUBMITTED);
        
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        long wonLast30 = bidRepository.countBySupplierIdAndStatusAndCreatedAtAfter(
                supplierId, VendorBidStatus.WON, thirtyDaysAgo);
        
        long totalBidsLast30 = bidRepository.countBySupplierIdAndCreatedAtAfter(supplierId, thirtyDaysAgo);
        double winRate = totalBidsLast30 > 0 ? (double) wonLast30 / totalBidsLast30 : 0.0;

        return new SupplierDashboardResponse(
            activeRfqs,
            (int) pendingBids,
            (int) wonLast30,
            winRate,
            Instant.now()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<RFQResponse> getActiveRfqs(UUID supplierId) {
        List<UUID> ingredientIds = pricingRepository.findByIngredientIdInSupplierCatalog(supplierId);
        return rfqRepository.findOpenRfqsByIngredientIds(ingredientIds, RfqStatus.OPEN).stream()
                .map(this::mapToRfqResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierInventoryView> getInventoryVisibility(UUID supplierId) {
        return pricingRepository.findBySupplierId(supplierId).stream()
                .map(p -> {
                    RawIngredient ing = p.getIngredient();
                    double parLevel = ing.getParLevel() != null ? ing.getParLevel().doubleValue() : 0.0;
                    double currentStock = ing.getCurrentStock() != null ? ing.getCurrentStock().doubleValue() : 0.0;
                    return new SupplierInventoryView(
                        ing.getId(),
                        ing.getName(),
                        currentStock,
                        ing.getUnitOfMeasure(),
                        parLevel,
                        currentStock < parLevel,
                        p.getUnitPrice().doubleValue()
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void submitPortalBid(UUID rfqId, UUID supplierUserId, VendorBidRequest request) {
        RFQ rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));
        
        if (rfq.getStatus() != RfqStatus.OPEN) {
            throw new RuntimeException("RFQ is not open for bidding");
        }

        SupplierUser user = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"));

        VendorBid bid = new VendorBid();
        bid.setRfq(rfq);
        bid.setSupplier(user.getSupplier());
        bid.setSubmittedBy(user);
        bid.setUnitPrice(request.unitPrice());
        bid.setQuantityAvailable(request.quantityAvailable());
        bid.setDeliveryDate(request.deliveryDate());
        bid.setPaymentTerms(request.paymentTerms());
        bid.setNotes(request.notes());
        bid.setStatus(VendorBidStatus.SUBMITTED);

        bidRepository.save(bid);
        log.info("Supplier Portal: Bid submitted by {} for RFQ #{}", user.getFullName(), rfqId);
    }

    @Override
    @Transactional
    public void proposePrice(UUID supplierUserId, VendorPriceProposalRequest proposal) {
        SupplierUser user = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new RuntimeException("Supplier user not found"));
        
        // Log the proposal and send notification
        String message = String.format("Supplier %s has proposed a proactive price of $%.2f for %s. (Notes: %s)", 
            user.getSupplier().getCompanyName(), proposal.getProposedPrice(), proposal.getIngredientId(), proposal.getNotes());
        
        alertService.sendNotification("PROCUREMENT_MANAGER", "New Price Proposal", message);
        log.info("Supplier Portal: Price proposal received from {} for ingredient {}", user.getFullName(), proposal.getIngredientId());
    }

    private RFQResponse mapToRfqResponse(RFQ rfq) {
        return new RFQResponse(
            rfq.getId(),
            rfq.getIngredient().getId(),
            rfq.getIngredient().getName(),
            rfq.getRequiredQty(),
            rfq.getStatus(),
            rfq.getDesiredDeliveryDate(),
            rfq.getBidDeadline()
        );
    }
}
