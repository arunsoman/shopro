package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.inventory.*;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.POStateMachineService;
import mls.sho.dms.application.service.inventory.SupplierPortalService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.repository.inventory.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

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
    private final RawIngredientRepository ingredientRepository;
    private final PurchaseOrderRepository poRepository;
    private final VendorPriceProposalRepository proposalRepository;
    private final AlertService alertService;
    private final POStateMachineService poStateMachineService;

    @Override
    @Transactional(readOnly = true)
    public SupplierDashboardResponse getDashboard(UUID supplierId) {
        // Active RFQs for ingredients they supply or are preferred vendors for
        java.util.Set<UUID> ingredientIds = new java.util.HashSet<>(pricingRepository.findByIngredientIdInSupplierCatalog(supplierId));
        ingredientRepository.findBySupplierId(supplierId).forEach(ing -> ingredientIds.add(ing.getId()));
        
        int activeRfqs = rfqRepository.countActiveRfqsByIngredientIds(new java.util.ArrayList<>(ingredientIds), RfqStatus.OPEN);
        
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
        java.util.Set<UUID> ingredientIds = new java.util.HashSet<>(pricingRepository.findByIngredientIdInSupplierCatalog(supplierId));
        ingredientRepository.findBySupplierId(supplierId).forEach(ing -> ingredientIds.add(ing.getId()));
        
        return rfqRepository.findOpenRfqsByIngredientIds(new java.util.ArrayList<>(ingredientIds), RfqStatus.OPEN).stream()
                .map(this::mapToRfqResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierInventoryView> getInventoryVisibility(UUID supplierId) {
        java.util.Map<UUID, SupplierInventoryView> visibilityMap = new java.util.HashMap<>();
        
        // 1. Ingredients in their custom catalog
        pricingRepository.findBySupplierId(supplierId).forEach(p -> {
            RawIngredient ing = p.getIngredient();
            visibilityMap.put(ing.getId(), mapToInventoryView(ing, p.getUnitPrice().doubleValue()));
        });
        
        // 2. Ingredients where they are the preferred supplier (don't overwrite custom catalog)
        ingredientRepository.findBySupplierId(supplierId).forEach(ing -> {
            if (!visibilityMap.containsKey(ing.getId())) {
                visibilityMap.put(ing.getId(), mapToInventoryView(ing, ing.getCostPerUnit().doubleValue()));
            }
        });
        
        return new java.util.ArrayList<>(visibilityMap.values());
    }

    private SupplierInventoryView mapToInventoryView(RawIngredient ing, double unitPrice) {
        double parLevel = ing.getParLevel() != null ? ing.getParLevel().doubleValue() : 0.0;
        double currentStock = ing.getCurrentStock() != null ? ing.getCurrentStock().doubleValue() : 0.0;
        return new SupplierInventoryView(
            ing.getId(),
            ing.getName(),
            currentStock,
            ing.getUnitOfMeasure(),
            parLevel,
            currentStock < parLevel,
            unitPrice
        );
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
    public void proposePrice(UUID supplierUserId, VendorPriceProposalRequest request) {
        SupplierUser user = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new RuntimeException("Supplier user not found"));
        
        RawIngredient ingredient = ingredientRepository.findById(request.getIngredientId())
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));

        VendorPriceProposal proposal = new VendorPriceProposal();
        proposal.setSupplier(user.getSupplier());
        proposal.setIngredient(ingredient);
        proposal.setProposedPrice(BigDecimal.valueOf(request.getProposedPrice()));
        proposal.setNotes(request.getNotes());
        proposal.setSubmittedBy(user);
        
        proposalRepository.save(proposal);

        // Log the proposal and send notification
        String message = String.format("Supplier %s has proposed a proactive price of $%.2f for %s. (Notes: %s)", 
            user.getSupplier().getCompanyName(), proposal.getProposedPrice(), ingredient.getName(), proposal.getNotes());
        
        alertService.sendNotification("PROCUREMENT_MANAGER", "New Price Proposal", message);
        log.info("Supplier Portal: Price proposal received from {} for ingredient {}", user.getFullName(), ingredient.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getPurchaseOrders(UUID supplierId) {
        return poRepository.findBySupplierId(supplierId).stream()
                .map(this::mapPoToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PurchaseOrderResponse acknowledgeOrder(UUID supplierUserId, UUID poId) {
        SupplierUser user = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new RuntimeException("Supplier user not found"));
        
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found"));
        
        if (!po.getSupplier().getId().equals(user.getSupplier().getId())) {
             throw new SecurityException("Unauthorized to acknowledge this PO");
        }

        po.setAcknowledgedAt(Instant.now());
        poStateMachineService.transition(poId, PurchaseOrderStatus.ACKNOWLEDGED, supplierUserId, "Supplier Acknowledged");
        
        return mapPoToResponse(poRepository.findById(poId).get());
    }

    @Override
    @Transactional
    public PurchaseOrderResponse counterOfferOrder(UUID supplierUserId, UUID poId, CounterOfferRequest request) {
        SupplierUser user = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new RuntimeException("Supplier user not found"));
        
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found"));
        
        if (!po.getSupplier().getId().equals(user.getSupplier().getId())) {
             throw new SecurityException("Unauthorized to modify this PO");
        }

        po.setCounterOfferPrice(request.getProposedPrice());
        po.setCounterOfferQty(request.getProposedQuantity());
        po.setCounterOfferNotes(request.getReason());
        po.setCounterOfferDate(Instant.now());

        poStateMachineService.transition(poId, PurchaseOrderStatus.COUNTER_OFFERED, supplierUserId, request.getReason());
        
        return mapPoToResponse(poRepository.findById(poId).get());
    }

    @Override
    @Transactional
    public PurchaseOrderResponse shipOrder(UUID supplierUserId, UUID poId, ShipActionRequest request) {
        SupplierUser user = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new RuntimeException("Supplier user not found"));
        
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found"));
        
        if (!po.getSupplier().getId().equals(user.getSupplier().getId())) {
             throw new SecurityException("Unauthorized to ship this PO");
        }

        po.setTrackingNumber(request.getTrackingNumber());
        po.setDeliveryNoteRef(request.getDeliveryNoteRef());
        po.setInvoiceFileId(request.getInvoiceFileId());
        po.setShippedAt(Instant.now());

        poStateMachineService.transition(poId, PurchaseOrderStatus.SHIPPED, supplierUserId, "Supplier marked as shipped");
        
        return mapPoToResponse(poRepository.findById(poId).get());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PriceProposalResponse> getMyProposals(UUID supplierId) {
        return proposalRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId).stream()
                .map(this::mapToProposalResponse)
                .collect(Collectors.toList());
    }

    private PriceProposalResponse mapToProposalResponse(VendorPriceProposal proposal) {
        try {
            log.debug("Mapping proposal {} for supplier {}", proposal.getId(), proposal.getSupplier().getId());
            
            Double currentPrice = pricingRepository
                    .findBySupplierId(proposal.getSupplier().getId()).stream()
                    .filter(p -> p.getIngredient().getId().equals(proposal.getIngredient().getId()))
                    .findFirst()
                    .map(p -> p.getUnitPrice().doubleValue())
                    .orElse(proposal.getIngredient().getCostPerUnit() != null ? proposal.getIngredient().getCostPerUnit().doubleValue() : 0.0);

            return PriceProposalResponse.builder()
                    .id(proposal.getId())
                    .supplierId(proposal.getSupplier().getId())
                    .supplierName(proposal.getSupplier().getCompanyName())
                    .ingredientId(proposal.getIngredient().getId())
                    .ingredientName(proposal.getIngredient().getName())
                    .unitOfMeasure(proposal.getIngredient().getUnitOfMeasure())
                    .proposedPrice(proposal.getProposedPrice() != null ? proposal.getProposedPrice().doubleValue() : 0.0)
                    .currentPrice(currentPrice)
                    .notes(proposal.getNotes())
                    .status(proposal.getStatus())
                    .createdAt(proposal.getCreatedAt())
                    .generatedPoId(proposal.getGeneratedPo() != null ? proposal.getGeneratedPo().getId() : null)
                    .generatedPoStatus(proposal.getGeneratedPo() != null ? proposal.getGeneratedPo().getStatus().name() : null)
                    .build();
        } catch (Exception e) {
            log.error("Error mapping proposal {}: {}", proposal.getId(), e.getMessage(), e);
            throw e;
        }
    }

    private PurchaseOrderResponse mapPoToResponse(PurchaseOrder po) {
        return PurchaseOrderResponse.builder()
                .id(po.getId())
                .supplierId(po.getSupplier().getId())
                .supplierName(po.getSupplier().getCompanyName())
                .status(po.getStatus())
                .totalValue(po.getTotalValue())
                .expectedDeliveryDate(po.getExpectedDeliveryDate())
                .createdAt(po.getCreatedAt())
                .acknowledgedAt(po.getAcknowledgedAt())
                .shippedAt(po.getShippedAt())
                .counterOfferPrice(po.getCounterOfferPrice())
                .counterOfferQty(po.getCounterOfferQty())
                .counterOfferNotes(po.getCounterOfferNotes())
                .trackingNumber(po.getTrackingNumber())
                .deliveryNoteRef(po.getDeliveryNoteRef())
                .items(po.getLines().stream()
                        .map(line -> PurchaseOrderResponse.PurchaseOrderLineResponse.builder()
                                .id(line.getId())
                                .ingredientId(line.getIngredient().getId())
                                .ingredientName(line.getIngredient().getName())
                                .orderedQty(line.getOrderedQty())
                                .unitCost(line.getUnitCost())
                                .unitOfMeasure(line.getIngredient().getUnitOfMeasure())
                                .build())
                        .collect(Collectors.toList()))
                .build();
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
