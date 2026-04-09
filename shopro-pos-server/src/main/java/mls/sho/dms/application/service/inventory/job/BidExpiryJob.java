package mls.sho.dms.application.service.inventory.job;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.inventory.BiddingStateMachineService;
import mls.sho.dms.entity.inventory.procurement.RFQ;
import mls.sho.dms.entity.inventory.procurement.RfqStatus;
import mls.sho.dms.repository.inventory.RFQRepository;
import mls.sho.dms.repository.inventory.VendorBidRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Scheduled job that automatically expires OPEN RFQs with no bids received after deadline.
 * Transitions: OPEN -> FAILED (no participation)
 * Transitions: OPEN -> CANCELLED (detected via inbuilt logic, manual trigger only)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BidExpiryJob {

    private final RFQRepository rfqRepository;
    private final VendorBidRepository vendorBidRepository;
    private final BiddingStateMachineService stateMachineService;
    private final mls.sho.dms.application.service.inventory.AlertService alertService;

    // Default system actor for automated transitions  
    private static final UUID SYSTEM_ACTOR_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    /**
     * Runs every 30 minutes to check for expired bids.
     */
    @Scheduled(fixedDelay = 30 * 60 * 1000)
    public void expireDeadlinePassed() {
        List<RFQ> openRfqs = rfqRepository.findByStatus(RfqStatus.OPEN);

        for (RFQ rfq : openRfqs) {
            if (rfq.getBidDeadline() != null && rfq.getBidDeadline().isBefore(Instant.now())) {
                boolean hasBids = !vendorBidRepository.findByRfqId(rfq.getId()).isEmpty();
                String reason;
                RfqStatus targetStatus;

                if (hasBids) {
                    // Bids were received — move to PENDING_REVIEW for procurement staff to evaluate
                    targetStatus = RfqStatus.PENDING_REVIEW;
                    reason = "Bid deadline passed. Bids available for review.";
                } else {
                    // No bids received — mark as FAILED
                    targetStatus = RfqStatus.FAILED;
                    reason = "Bid deadline passed. No supplier participation received.";
                }

                try {
                    stateMachineService.transition(rfq.getId(), targetStatus, SYSTEM_ACTOR_ID, reason);
                    log.info("Auto-transitioned expired RFQ {} to {} - {}", rfq.getId(), targetStatus, reason);
                    
                    if (targetStatus == RfqStatus.FAILED) {
                        alertService.sendNotification(
                            "Manager",
                            "Auto-Restock Failed: No Bids",
                            "RFQ for " + rfq.getIngredient().getName() + " (ID: " + rfq.getId() + ") failed because no vendor submitted a bid by the deadline."
                        );
                    }
                } catch (Exception e) {
                    log.error("Failed to auto-transition expired RFQ {}: {}", rfq.getId(), e.getMessage());
                }
            }
        }
    }
}
