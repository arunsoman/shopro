package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.inventory.BidLineItemRequest;
import mls.sho.dms.application.dto.inventory.CreateBidRequest;
import mls.sho.dms.application.dto.inventory.CreateRFQRequest;
import mls.sho.dms.application.dto.inventory.RFQResponse;
import mls.sho.dms.application.dto.inventory.VendorBidRequest;
import mls.sho.dms.application.dto.inventory.VendorBidResponse;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.BidStateMachineService;
import mls.sho.dms.application.service.inventory.RFQService;
import mls.sho.dms.application.service.inventory.POGeneratorService;
import mls.sho.dms.application.service.inventory.BiddingStateMachineService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.repository.inventory.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RFQServiceImpl implements RFQService {

    private final RFQRepository rfqRepository;
    private final RawIngredientRepository ingredientRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final VendorBidRepository vendorBidRepository;
    private final SupplierIngredientPricingRepository pricingRepository;
    private final AlertService alertService;
    private final POGeneratorService poGeneratorService;
    private final BiddingStateMachineService stateMachineService;
    private final BidStateMachineService bidStateMachineService;

    // Default system actor for automated transitions
    private static final UUID SYSTEM_ACTOR_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    @Override
    @Transactional
    public RFQ generateRfqIfEligible(RawIngredient ingredient) {
        if (!ingredient.isAutoReplenish()) {
            return null;
        }

        if (ingredient.getParLevel() == null || ingredient.getCurrentStock() == null) {
            return null;
        }
        
        BigDecimal qtyNeeded = ingredient.getParLevel().subtract(ingredient.getCurrentStock());
        if (qtyNeeded.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        List<RFQ> openRfqs = rfqRepository.findByStatus(RfqStatus.OPEN);
        boolean alreadyHasOpenRfq = openRfqs.stream()
            .anyMatch(r -> r.getIngredient().getId().equals(ingredient.getId()));
            
        if (alreadyHasOpenRfq) {
            return null;
        }

        List<SupplierIngredientPricing> prices = pricingRepository.findByIngredientId(ingredient.getId());
        List<UUID> pool = ingredient.getBidSupplierPool();
        List<SupplierIngredientPricing> eligibleSuppliers;

        if (pool != null && !pool.isEmpty()) {
            eligibleSuppliers = prices.stream()
                .filter(p -> pool.contains(p.getSupplier().getId()))
                .filter(p -> p.getSupplier().isBidEligible())
                .collect(Collectors.toList());
        } else {
            eligibleSuppliers = prices.stream()
                .filter(p -> p.getSupplier().isBidEligible())
                .collect(Collectors.toList());
        }
        
        if (eligibleSuppliers.isEmpty()) {
            alertService.sendNotification(
                "Manager", 
                "Manual Intervention Required: " + ingredient.getName(), 
                ingredient.getName() + " has hit Reorder level (BID mode) but has no eligible vendors in the pool. Manual intervention required."
            );
            return null;
        }

        RFQ rfq = new RFQ();
        rfq.setIngredient(ingredient);
        rfq.setRequiredQty(qtyNeeded);
        rfq.setStatus(RfqStatus.OPEN);
        
        // Automated timing from ingredient settings (X, Y days)
        rfq.setBidDeadline(Instant.now().plus(ingredient.getBidClosingDays(), ChronoUnit.DAYS));
        rfq.setDesiredDeliveryDate(LocalDate.now().plusDays(ingredient.getExpectedArrivalDays()));
        
        RFQ savedRfq = rfqRepository.save(rfq);
        
        // Create Shell PO
        poGeneratorService.createFromRfq(savedRfq.getId(), SYSTEM_ACTOR_ID);
        
        // Record initial state in history and trigger notifications
        stateMachineService.transition(savedRfq.getId(), RfqStatus.OPEN, SYSTEM_ACTOR_ID, "Automated Generation");
        
        alertService.sendNotification(
            "Manager", 
            "RFQ Generated: " + ingredient.getName(), 
            "RFQ #" + savedRfq.getId() + " generated for " + ingredient.getName() + ". Awaiting " + eligibleSuppliers.size() + " vendor bids."
        );
        
        for (SupplierIngredientPricing pricing : eligibleSuppliers) {
            String vendorEmail = pricing.getSupplier().getContactEmail();
            if (vendorEmail != null) {
                String vendorPortalUrl = "http://localhost:3000/vendor/rfq/" + savedRfq.getId() + "?supplier=" + pricing.getSupplier().getId();
                alertService.sendNotification(
                    vendorEmail,
                    "Request for Quotation: " + ingredient.getName(),
                    "Please submit your bid for " + ingredient.getName() + ". Portal: " + vendorPortalUrl
                );
            }
        }

        return savedRfq;
    }

    @Override
    @Transactional
    public RFQResponse createRfq(CreateRFQRequest request) {
        try {
            RawIngredient ingredient = ingredientRepository.findById(request.ingredientId())
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));

            // Check for existing active orders
            List<PurchaseOrder> activePos = purchaseOrderRepository.findActiveOrdersByIngredientId(
                ingredient.getId(), 
                EnumSet.of(PurchaseOrderStatus.CLOSED, PurchaseOrderStatus.CANCELLED, PurchaseOrderStatus.REJECTED)
            );
            if (!activePos.isEmpty()) {
                throw new BusinessRuleException("An active Purchase Order already exists for this ingredient.");
            }

            List<RFQ> activeRfqs = rfqRepository.findActiveRfqsByIngredientId(ingredient.getId(), RfqStatus.OPEN);
            if (!activeRfqs.isEmpty()) {
                throw new BusinessRuleException("An active RFQ already exists for this ingredient.");
            }

            RFQ rfq = new RFQ();
            rfq.setIngredient(ingredient);
            rfq.setRequiredQty(request.requiredQty());
            rfq.setStatus(RfqStatus.OPEN);
            rfq.setDesiredDeliveryDate(request.desiredDeliveryDate());
            rfq.setBidDeadline(Instant.now().plus(24, ChronoUnit.HOURS)); // Manual RFQs get 24h by default

            RFQ saved = rfqRepository.save(rfq);
            
            // Create Shell PO
            poGeneratorService.createFromRfq(saved.getId(), SYSTEM_ACTOR_ID);

            // Record initial state in history and trigger notifications
            stateMachineService.transition(saved.getId(), RfqStatus.OPEN, SYSTEM_ACTOR_ID, "Manual RFQ Creation");
            
            log.info("Manual RFQ created: #{} for ingredient {}", saved.getId(), ingredient.getName());
            return mapToResponse(saved);
        } catch (Exception e) {
            log.error("Failed to create manual RFQ", e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void createBid(CreateBidRequest request) {
        log.info("Creating multi-ingredient bid for {} ingredients and {} suppliers", 
            request.items().size(), request.supplierIds().size());

        for (BidLineItemRequest itemRequest : request.items()) {
            RawIngredient ingredient = ingredientRepository.findById(itemRequest.ingredientId())
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found: " + itemRequest.ingredientId()));

            // Check for existing active RFQs for this ingredient
            List<RFQ> activeRfqs = rfqRepository.findActiveRfqsByIngredientId(ingredient.getId(), RfqStatus.OPEN);
            if (!activeRfqs.isEmpty()) {
                log.warn("Active RFQ already exists for ingredient: {}", ingredient.getName());
                throw new BusinessRuleException("An active RFQ already exists for " + ingredient.getName());
            }

            RFQ rfq = new RFQ();
            rfq.setIngredient(ingredient);
            rfq.setRequiredQty(itemRequest.quantity());
            rfq.setStatus(RfqStatus.OPEN);
            rfq.setDesiredDeliveryDate(itemRequest.deliveryDate());
            rfq.setBidDeadline(request.bidDeadline());

            RFQ saved = rfqRepository.save(rfq);
            
            // Create Shell PO
            poGeneratorService.createFromRfq(saved.getId(), SYSTEM_ACTOR_ID);

            // Record initial state in history and trigger notifications
            stateMachineService.transition(saved.getId(), RfqStatus.OPEN, SYSTEM_ACTOR_ID, "Multi-ingredient Bid Creation");
            
            log.debug("RFQ #{} created for ingredient {}", saved.getId(), ingredient.getName());

            // Notify each invited supplier
            for (UUID supplierId : request.supplierIds()) {
                Supplier supplier = supplierRepository.findById(supplierId)
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + supplierId));
                
                String vendorEmail = supplier.getContactEmail();
                if (vendorEmail != null) {
                    String vendorPortalUrl = "http://localhost:3000/vendor/rfq/" + saved.getId() + "?supplier=" + supplier.getId();
                    alertService.sendNotification(
                        vendorEmail,
                        "New Bid Opportunity: " + ingredient.getName(),
                        "You have been invited to bid for " + ingredient.getName() + " (" + itemRequest.quantity() + "). Deadline: " + request.bidDeadline() + ". Portal: " + vendorPortalUrl
                    );
                }
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<RFQResponse> getAllRfqs(RfqStatus status) {
        List<RFQ> rfqs = (status == null) ? rfqRepository.findAll() : rfqRepository.findByStatus(status);
        return rfqs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RFQResponse getRfqById(UUID id) {
        return rfqRepository.findById(id)
            .map(this::mapToResponse)
            .orElseThrow(() -> new ResourceNotFoundException("RFQ not found"));
    }

    @Override
    @Transactional
    public void cancelRfq(UUID rfqId) {
        RFQ rfq = rfqRepository.findById(rfqId)
            .orElseThrow(() -> new ResourceNotFoundException("RFQ not found"));

        if (rfq.getStatus() != RfqStatus.OPEN) {
            throw new BusinessRuleException("Only open RFQs can be cancelled.");
        }

        stateMachineService.transition(rfqId, RfqStatus.CANCELLED, SYSTEM_ACTOR_ID, "Manual Cancellation");
        log.info("RFQ #{} cancelled.", rfqId);

        // Optionally, notify vendors whose bids might be pending
        List<VendorBid> pendingBids = vendorBidRepository.findByRfqIdAndStatus(rfqId, VendorBidStatus.SUBMITTED);
        for (VendorBid bid : pendingBids) {
            bid.setStatus(VendorBidStatus.REJECTED); // Or a specific 'CANCELLED_BY_RFQ' status
            // alertService.sendNotification(bid.getSupplier().getContactEmail(), "RFQ Cancelled", "The RFQ for " + rfq.getIngredient().getName() + " has been cancelled.");
        }
        vendorBidRepository.saveAll(pendingBids);
    }

    @Override
    @Transactional
    public void submitBid(UUID rfqId, VendorBidRequest request) {
        RFQ rfq = rfqRepository.findById(rfqId)
            .orElseThrow(() -> new ResourceNotFoundException("RFQ not found"));

        if (rfq.getStatus() != RfqStatus.OPEN) {
            throw new BusinessRuleException("RFQ is no longer open for bidding");
        }

        Supplier supplier = supplierRepository.findById(request.supplierId())
            .orElseThrow(() -> new RuntimeException("Supplier not found"));

        VendorBid bid = new VendorBid();
        bid.setRfq(rfq);
        bid.setSupplier(supplier);
        bid.setUnitPrice(request.unitPrice());
        bid.setQuantityAvailable(request.quantityAvailable());
        bid.setDeliveryDate(request.deliveryDate());
        bid.setPaymentTerms(request.paymentTerms());
        bid.setNotes(request.notes());
        bid.setStatus(VendorBidStatus.SUBMITTED);

        vendorBidRepository.save(bid);
        
        // No more PO generation here. One PO per RFQ.
        log.info("Bid submitted by {} for RFQ #{}", supplier.getCompanyName(), rfqId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorBidResponse> getBidsForRfq(UUID rfqId) {
        return vendorBidRepository.findByRfqId(rfqId).stream()
                .map(this::mapToBidResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void awardBid(UUID bidId, UUID staffId) {
        VendorBid bid = vendorBidRepository.findById(bidId)
                .orElseThrow(() -> new ResourceNotFoundException("Bid not found"));

        if (bid.getStatus() != VendorBidStatus.SUBMITTED) {
            throw new BusinessRuleException("Only submitted bids can be awarded");
        }

        RFQ rfq = bid.getRfq();
        if (rfq.getStatus() != RfqStatus.OPEN) {
            throw new BusinessRuleException("RFQ is no longer open");
        }

        // 1. Update the existing PO linked to the RFQ with the awarded bid details first
        // This ensures the supplier is set before status transitions trigger notifications
        poGeneratorService.awardPo(rfq.getId(), bidId, staffId);

        // 2. Reject other bids for this RFQ
        List<VendorBid> allBids = vendorBidRepository.findByRfqId(rfq.getId());
        for (VendorBid alternative : allBids) {
            if (!alternative.getId().equals(bidId) && alternative.getStatus() == VendorBidStatus.SUBMITTED) {
                bidStateMachineService.transition(alternative.getId(), VendorBidStatus.LOST, staffId, "Another bid was preferred");
            }
        }

        // 3. Accept the winning bid via state machine (triggers PO status change to SENT)
        bidStateMachineService.transition(bidId, VendorBidStatus.WON, staffId, "Awarded via Management Console");

        // 4. Update RFQ status to AWARDED via state machine
        stateMachineService.transition(rfq.getId(), RfqStatus.AWARDED, staffId, "Awarded to " + bid.getSupplier().getCompanyName());

        log.info("Bid awarded to {} for RFQ {}. PO updated.", bid.getSupplier().getCompanyName(), rfq.getId());
    }

    private RFQResponse mapToResponse(RFQ rfq) {
        return new RFQResponse(
            rfq.getId(),
            rfq.getIngredient().getId(),
            rfq.getIngredient().getName(),
            rfq.getRequiredQty(),
            rfq.getStatus(),
            rfq.getDesiredDeliveryDate(),
            rfq.getBidDeadline(),
            false,
            null
        );
    }

    private VendorBidResponse mapToBidResponse(VendorBid bid) {
        return new VendorBidResponse(
            bid.getId(),
            bid.getRfq().getId(),
            bid.getSupplier().getId(),
            bid.getSupplier().getCompanyName(),
            bid.getUnitPrice(),
            bid.getQuantityAvailable(),
            bid.getDeliveryDate(),
            bid.getPaymentTerms(),
            bid.getNotes(),
            bid.getStatus(),
            bid.getCreatedAt()
        );
    }
}
