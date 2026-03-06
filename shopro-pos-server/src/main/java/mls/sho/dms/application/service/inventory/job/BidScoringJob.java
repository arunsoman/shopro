package mls.sho.dms.application.service.inventory.job;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.inventory.PurchaseOrderLineRepository;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.inventory.RFQRepository;
import mls.sho.dms.repository.inventory.VendorBidRepository;
import mls.sho.dms.repository.staff.StaffMemberRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class BidScoringJob {

    private final RFQRepository rfqRepository;
    private final VendorBidRepository vendorBidRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderLineRepository purchaseOrderLineRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final AlertService alertService;

    // Configurable weights (US-13.3)
    private static final double PRICE_WEIGHT = 0.50;
    private static final double DELIVERY_WEIGHT = 0.30;
    private static final double RATING_WEIGHT = 0.20;

    @Scheduled(fixedRateString = "${shopro.inventory.bid-scoring-rate:60000}") // Every minute
    @Transactional
    public void evaluateExpiredRfqs() {
        log.info("Starting bid scoring job...");
        
        List<RFQ> openRfqs = rfqRepository.findByStatus(RfqStatus.OPEN);
        Instant now = Instant.now();
        int processedCount = 0;

        for (RFQ rfq : openRfqs) {
            if (rfq.getBidDeadline().isBefore(now)) {
                processRfq(rfq);
                processedCount++;
            }
        }
        
        if (processedCount > 0) {
            log.info("Bid scoring job complete. Processed {} expired RFQs.", processedCount);
        }
    }

    private void processRfq(RFQ rfq) {
        List<VendorBid> bids = vendorBidRepository.findByRfqIdAndStatus(rfq.getId(), VendorBidStatus.SUBMITTED);

        if (bids.isEmpty()) {
            // US-13.3 Edge Case: No bids submitted -> extend deadline by 30 mins
            log.warn("RFQ #{} had NO bids. Auto-extending deadline by 30 minutes.", rfq.getId());
            rfq.setBidDeadline(rfq.getBidDeadline().plus(30, ChronoUnit.MINUTES));
            rfqRepository.save(rfq);
            
            // Notify Manager
            alertService.sendNotification(
                "Manager", 
                "RFQ Deadline Extended: " + rfq.getIngredient().getName(), 
                "No bids received for RFQ #" + rfq.getId() + ". Extended deadline by 30 minutes."
            );
            return;
        }

        if (bids.size() == 1) {
            // Auto-award if only 1 bid
            awardBid(rfq, bids.get(0), bids);
            return;
        }

        // --- Step 1: Find best/lowest values for scoring ---
        BigDecimal lowestPrice = bids.stream()
            .map(VendorBid::getUnitPrice)
            .min(BigDecimal::compareTo)
            .orElseThrow();
            
        long fastestDeliveryDays = bids.stream()
            .mapToLong(b -> ChronoUnit.DAYS.between(LocalDate.now(), b.getDeliveryDate()))
            .min()
            .orElse(1);
        if (fastestDeliveryDays <= 0) fastestDeliveryDays = 1; // Prevent div/0

        // --- Step 2: Score bids ---
        VendorBid winningBid = null;
        double highestScore = -1.0;

        for (VendorBid bid : bids) {
            double priceScore = lowestPrice.doubleValue() / Math.max(0.01, bid.getUnitPrice().doubleValue()) * 100.0;
            
            long deliveryDays = ChronoUnit.DAYS.between(LocalDate.now(), bid.getDeliveryDate());
            if (deliveryDays <= 0) deliveryDays = 1;
            double deliveryScore = (double) fastestDeliveryDays / deliveryDays * 100.0;
            
            double ratingScore = bid.getSupplier().getVendorRating() != null 
                ? bid.getSupplier().getVendorRating().doubleValue() : 70.0;

            double compositeScore = (priceScore * PRICE_WEIGHT) 
                                  + (deliveryScore * DELIVERY_WEIGHT) 
                                  + (ratingScore * RATING_WEIGHT);
            
            log.debug("Bid {} scored: Price={}, Delivery={}, Rating={}, Total={}", 
                bid.getId(), priceScore, deliveryScore, ratingScore, compositeScore);

            // Tie breaker logic: Score -> Delivery Days -> Price
            if (compositeScore > highestScore) {
                highestScore = compositeScore;
                winningBid = bid;
            } else if (Math.abs(compositeScore - highestScore) < 0.01 && winningBid != null) {
                long currentWinnerDays = ChronoUnit.DAYS.between(LocalDate.now(), winningBid.getDeliveryDate());
                long newBidDays = deliveryDays;
                
                if (newBidDays < currentWinnerDays) {
                    winningBid = bid; // Tie breaker 1: Faster delivery
                } else if (newBidDays == currentWinnerDays) {
                    if (bid.getUnitPrice().compareTo(winningBid.getUnitPrice()) < 0) {
                        winningBid = bid; // Tie breaker 2: Lower price
                    }
                }
            }
        }

        // --- Step 3: Award ---
        awardBid(rfq, winningBid, bids);
    }

    private void awardBid(RFQ rfq, VendorBid winningBid, List<VendorBid> allBids) {
        log.info("Awarding RFQ #{} to Bid #{} from Supplier {}", rfq.getId(), winningBid.getId(), winningBid.getSupplier().getCompanyName());

        // Update bid statuses
        for (VendorBid bid : allBids) {
            if (bid.getId().equals(winningBid.getId())) {
                bid.setStatus(VendorBidStatus.WON);
            } else {
                bid.setStatus(VendorBidStatus.LOST);
                // Alert losing vendor
                String vendorEmail = bid.getSupplier().getContactEmail();
                if (vendorEmail != null) {
                    alertService.dispatchEmail(
                        vendorEmail, 
                        "RFQ Update: " + rfq.getIngredient().getName(),
                        "Thank you for your bid on RFQ #" + rfq.getId() + ". We have selected another vendor on this occasion."
                    );
                }
            }
        }
        vendorBidRepository.saveAll(allBids);

        rfq.setStatus(RfqStatus.CLOSED);
        rfqRepository.save(rfq);

        // Generate DRAFT Purchase Order
        createDraftPurchaseOrder(rfq, winningBid);
    }

    private void createDraftPurchaseOrder(RFQ rfq, VendorBid winningBid) {
        // Look for a system user or default staff member
        Optional<StaffMember> systemUser = staffMemberRepository.findAll().stream()
            .filter(u -> u.getRole() == mls.sho.dms.entity.staff.StaffRole.MANAGER)
            .findFirst();

        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(winningBid.getSupplier());
        po.setStatus(PurchaseOrderStatus.DRAFT);
        po.setExpectedDeliveryDate(winningBid.getDeliveryDate());
        
        systemUser.ifPresent(po::setGeneratedBy);
        
        BigDecimal qty = winningBid.getQuantityAvailable().min(rfq.getRequiredQty());
        BigDecimal lineTotal = winningBid.getUnitPrice().multiply(qty);
        po.setTotalValue(lineTotal);

        PurchaseOrder savedPo = purchaseOrderRepository.save(po);

        PurchaseOrderLine poLine = new PurchaseOrderLine();
        poLine.setPurchaseOrder(savedPo);
        poLine.setIngredient(rfq.getIngredient());
        poLine.setOrderedQty(qty);
        poLine.setUnitCost(winningBid.getUnitPrice());
        
        purchaseOrderLineRepository.save(poLine);

        // Alert Manager
        alertService.sendNotification(
            "Manager", 
            "Bid Awarded & PO Drafted: " + rfq.getIngredient().getName(), 
            "Bid scoring complete for " + rfq.getIngredient().getName() + ". Winning vendor: " + 
            winningBid.getSupplier().getCompanyName() + " at $" + winningBid.getUnitPrice() + "/unit. Draft PO #" + savedPo.getId() + " created."
        );
    }
}
