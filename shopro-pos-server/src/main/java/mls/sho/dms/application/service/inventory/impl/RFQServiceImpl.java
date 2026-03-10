package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.inventory.CreateRFQRequest;
import mls.sho.dms.application.dto.inventory.RFQResponse;
import mls.sho.dms.application.dto.inventory.VendorBidRequest;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.RFQService;
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

        List<SupplierIngredientPricing> eligibleSuppliers = pricingRepository.findByIngredientId(ingredient.getId());
        
        if (eligibleSuppliers.isEmpty()) {
            alertService.sendNotification(
                "Manager", 
                "Manual Intervention Required: " + ingredient.getName(), 
                ingredient.getName() + " has hit Reorder level but has no eligible vendors. Manual intervention required."
            );
            return null;
        }

        int maxLeadTime = eligibleSuppliers.stream()
            .mapToInt(p -> p.getSupplier().getLeadTimeDays())
            .max()
            .orElse(3);

        RFQ rfq = new RFQ();
        rfq.setIngredient(ingredient);
        rfq.setRequiredQty(qtyNeeded);
        rfq.setStatus(RfqStatus.OPEN);
        rfq.setDesiredDeliveryDate(LocalDate.now().plusDays(maxLeadTime));
        rfq.setBidDeadline(Instant.now().plus(2, ChronoUnit.HOURS));
        
        RFQ savedRfq = rfqRepository.save(rfq);
        
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
            log.info("Manual RFQ created: #{} for ingredient {}", saved.getId(), ingredient.getName());
            return mapToResponse(saved);
        } catch (Exception e) {
            log.error("Failed to create manual RFQ", e);
            throw e;
        }
    }

    @Override
    public List<RFQResponse> getAllRfqs(RfqStatus status) {
        List<RFQ> rfqs = (status == null) ? rfqRepository.findAll() : rfqRepository.findByStatus(status);
        return rfqs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public RFQResponse getRfqById(UUID id) {
        return rfqRepository.findById(id)
            .map(this::mapToResponse)
            .orElseThrow(() -> new RuntimeException("RFQ not found"));
    }

    @Override
    @Transactional
    public void submitBid(UUID rfqId, VendorBidRequest request) {
        RFQ rfq = rfqRepository.findById(rfqId)
            .orElseThrow(() -> new RuntimeException("RFQ not found"));

        if (rfq.getStatus() != RfqStatus.OPEN) {
            throw new RuntimeException("RFQ is no longer open for bidding");
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
        log.info("Bid submitted by {} for RFQ #{}", supplier.getCompanyName(), rfqId);
    }

    @Override
    @Transactional
    public void cancelRfq(UUID rfqId) {
        RFQ rfq = rfqRepository.findById(rfqId)
            .orElseThrow(() -> new ResourceNotFoundException("RFQ not found"));

        if (rfq.getStatus() != RfqStatus.OPEN) {
            throw new BusinessRuleException("RFQ can only be cancelled when in OPEN status");
        }

        rfq.setStatus(RfqStatus.CANCELLED);
        rfqRepository.save(rfq);
        log.info("RFQ {} has been cancelled", rfqId);
    }

    private RFQResponse mapToResponse(RFQ rfq) {
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
