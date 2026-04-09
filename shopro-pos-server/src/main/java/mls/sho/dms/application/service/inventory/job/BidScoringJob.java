package mls.sho.dms.application.service.inventory.job;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.BidStateMachineService;
import mls.sho.dms.application.service.inventory.POGeneratorService;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrder;
import mls.sho.dms.entity.inventory.procurement.RFQ;
import mls.sho.dms.entity.inventory.procurement.RfqStatus;
import mls.sho.dms.entity.inventory.vendor.VendorBid;
import mls.sho.dms.entity.inventory.vendor.VendorBidStatus;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.inventory.RFQRepository;
import mls.sho.dms.repository.inventory.VendorBidRepository;
import mls.sho.dms.repository.staff.StaffRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class BidScoringJob {

    private final RFQRepository rfqRepository;
    private final VendorBidRepository vendorBidRepository;
    private final StaffRepository staffMemberRepository;
    private final AlertService alertService;
    private final POGeneratorService poGeneratorService;
    private final BidStateMachineService bidStateMachineService;

    // Configurable weights (US-13.3)
    private static final double PRICE_WEIGHT = 0.50;
    private static final double DELIVERY_WEIGHT = 0.30;
    private static final double RATING_WEIGHT = 0.20;
    
    // Auto-award only if gap between top 2 bids is significant (US-13.3)
    private static final double AUTO_AWARD_GAP_THRESHOLD = 10.0; 

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
            
        long fastestDeliveryDaysRaw = bids.stream()
            .mapToLong(b -> ChronoUnit.DAYS.between(LocalDate.now(), b.getDeliveryDate()))
            .min()
            .orElse(1);
        final long fastestDeliveryDays = fastestDeliveryDaysRaw <= 0 ? 1 : fastestDeliveryDaysRaw;

        // --- Step 2: Score bids ---
        VendorBid winningBid = null;
        double highestScore = -1.0;

        for (VendorBid bid : bids) {
            double compositeScore = calculateScore(bid, lowestPrice, fastestDeliveryDays);
            
            log.debug("Bid {} scored: Total={}", bid.getId(), compositeScore);

            // Tie breaker logic: Score -> Delivery Days -> Price
            if (compositeScore > highestScore) {
                highestScore = compositeScore;
                winningBid = bid;
            } else if (Math.abs(compositeScore - highestScore) < 0.01 && winningBid != null) {
                long currentWinnerDays = ChronoUnit.DAYS.between(LocalDate.now(), winningBid.getDeliveryDate());
                long newBidDays = ChronoUnit.DAYS.between(LocalDate.now(), bid.getDeliveryDate());
                if (newBidDays <= 0) newBidDays = 1;
                
                if (newBidDays < currentWinnerDays) {
                    winningBid = bid; // Tie breaker 1: Faster delivery
                } else if (newBidDays == currentWinnerDays) {
                    if (bid.getUnitPrice().compareTo(winningBid.getUnitPrice()) < 0) {
                        winningBid = bid; // Tie breaker 2: Lower price
                    }
                }
            }
        }

        // --- Step 3: Check Gap for Auto-Award (US-13.3) ---
        final double currentHighest = highestScore;
        List<Double> scores = bids.stream()
            .map(b -> calculateScore(b, lowestPrice, fastestDeliveryDays))
            .sorted(Comparator.reverseOrder())
            .toList();
            
        double secondHighest = scores.size() > 1 ? scores.get(1) : 0.0;
        double gap = currentHighest - secondHighest;
        
        if (gap >= AUTO_AWARD_GAP_THRESHOLD) {
            log.info("Auto-award gap threshold met (gap: {}). Awarding RFQ #{} automatically.", gap, rfq.getId());
            awardBid(rfq, winningBid, bids);
        } else {
            log.info("Auto-award gap threshold NOT met (gap: {}). RFQ #{} remains for manual review.", gap, rfq.getId());
            rfq.setStatus(RfqStatus.PENDING_REVIEW); // New status to flag for manager
            rfqRepository.save(rfq);
            
            alertService.sendNotification(
                "Manager",
                "RFQ Manual Review Required: " + rfq.getIngredient().getName(),
                "Bid scoring for RFQ #" + rfq.getId() + " is complete but gap is only " + String.format("%.2f", gap) + " pts. Please review and award manually."
            );
        }
    }

    private double calculateScore(VendorBid bid, BigDecimal lowestPrice, long fastestDeliveryDays) {
        double priceScore = lowestPrice.doubleValue() / Math.max(0.01, bid.getUnitPrice().doubleValue()) * 100.0;
        
        long deliveryDays = ChronoUnit.DAYS.between(LocalDate.now(), bid.getDeliveryDate());
        if (deliveryDays <= 0) deliveryDays = 1;
        double deliveryScore = (double) fastestDeliveryDays / deliveryDays * 100.0;
        
        double ratingScore = bid.getSupplier().getVendorRating() != null 
            ? bid.getSupplier().getVendorRating().doubleValue() : 70.0;

        return (priceScore * PRICE_WEIGHT) 
             + (deliveryScore * DELIVERY_WEIGHT) 
             + (ratingScore * RATING_WEIGHT);
    }

    private void awardBid(RFQ rfq, VendorBid winningBid, List<VendorBid> allBids) {
        log.info("Awarding RFQ #{} to Bid #{} from Supplier {}", rfq.getId(), winningBid.getId(), winningBid.getSupplier().getCompanyName());

        // Update bid statuses via state machine
        for (VendorBid bid : allBids) {
            if (bid.getId().equals(winningBid.getId())) {
                bidStateMachineService.transition(bid.getId(), VendorBidStatus.WON, null, "Auto-awarded by scoring system");
            } else {
                bidStateMachineService.transition(bid.getId(), VendorBidStatus.LOST, null, "Auto-scored: Another bid had higher rank");
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

        // Alert Manager
        alertService.sendNotification(
            "Manager", 
            "Bid Awarded & PO Dispatched: " + rfq.getIngredient().getName(), 
            "Bid scoring complete for " + rfq.getIngredient().getName() + ". Winning vendor: " + 
            winningBid.getSupplier().getCompanyName() + " at $" + winningBid.getUnitPrice() + "/unit. PO SENT to supplier."
        );
    }

    private void createDraftPurchaseOrder(RFQ rfq, VendorBid winningBid) {
        // Look for a management staff member
        List<StaffMember> activeStaff = staffMemberRepository.findByActiveTrue();
        
        StaffMember creator = activeStaff.stream()
            .filter(u -> {
                String roleName = u.getRole() != null ? u.getRole().getName() : "";
                return roleName.equals("OWNER") || roleName.equals("GENERAL_MANAGER") || 
                       roleName.equals("MANAGER") || roleName.equals("KITCHEN_MANAGER");
            })
            .findFirst()
            .orElseGet(() -> activeStaff.isEmpty() ? null : activeStaff.get(0));

        UUID creatorId = creator != null ? creator.getId() : null;
        PurchaseOrder savedPo = poGeneratorService.createFromBid(winningBid.getId(), creatorId);

        // Alert Manager
        alertService.sendNotification(
            "Manager", 
            "Bid Awarded & PO Drafted: " + rfq.getIngredient().getName(), 
            "Bid scoring complete for " + rfq.getIngredient().getName() + ". Winning vendor: " + 
            winningBid.getSupplier().getCompanyName() + " at $" + winningBid.getUnitPrice() + "/unit. Draft PO #" + savedPo.getId() + " created."
        );
    }
}
