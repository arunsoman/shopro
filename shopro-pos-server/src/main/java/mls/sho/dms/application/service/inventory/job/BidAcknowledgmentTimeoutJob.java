package mls.sho.dms.application.service.inventory.job;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.entity.inventory.vendor.VendorBid;
import mls.sho.dms.entity.inventory.vendor.VendorBidStatus;
import mls.sho.dms.repository.inventory.VendorBidRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Job that periodically checks for WON bids that haven't been acknowledged
 * within the configured timeout period.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BidAcknowledgmentTimeoutJob {

    private final VendorBidRepository bidRepository;
    private final mls.sho.dms.application.service.inventory.BidStateMachineService bidStateMachineService;
    private final mls.sho.dms.application.service.inventory.AlertService alertService;

    @Value("${shopro.inventory.bid-ack-timeout-minutes:60}")
    private int timeoutMinutes;

    /**
     * Runs every 5 minutes to sweep for expired bid acknowledgments.
     */
    @Scheduled(fixedDelay = 300000)
    @Transactional
    public void checkExpiredAcknowledgements() {
        log.debug("Running Bid Acknowledgment Timeout Job...");
        
        Instant cutoffTime = Instant.now().minus(timeoutMinutes, ChronoUnit.MINUTES);
        
        // Find WON bids awarded before the cutoff time
        List<VendorBid> expiredBids = bidRepository.findWonBidsAwardedBefore(cutoffTime);
        
        if (!expiredBids.isEmpty()) {
            log.info("Found {} bids that exceeded acknowledgment timeout ({} mins)", expiredBids.size(), timeoutMinutes);
            
            for (VendorBid bid : expiredBids) {
                try {
                    bidStateMachineService.transition(
                        bid.getId(), 
                        VendorBidStatus.UNACKED, 
                        null, 
                        "Acknowledgment timeout exceeded"
                    );
                    
                    alertService.sendNotification(
                        "Manager",
                        "Restock Alert: Unacknowledged Bid/PO",
                        "Vendor " + bid.getSupplier().getCompanyName() + " failed to acknowledge the award for " + 
                        bid.getRfq().getIngredient().getName() + " within the " + timeoutMinutes + "m timeout."
                    );
                } catch (Exception e) {
                    log.error("Failed to transition expired bid {}: {}", bid.getId(), e.getMessage());
                }
            }
        }
    }
}
