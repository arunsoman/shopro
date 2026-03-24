package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.mplace.entity.BidInvitation;
import mls.sho.mplace.entity.OperationMode;
import mls.sho.mplace.entity.Quote;
import mls.sho.mplace.repository.BidInvitationRepository;
import mls.sho.mplace.repository.QuoteRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * Background engine for Bidding Automation.
 * Handles: 
 * 1. Automatic Awarding (when deadline passes in AUTO mode)
 * 2. Recurring Bid Launches (when nextRunDate passes)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BidAutomationScheduler {

    private final BidInvitationRepository bidInvitationRepository;
    private final QuoteRepository quoteRepository;
    private final BidService bidService;

    /**
     * Every 5 minutes, scan for pending automation tasks.
     */
    @Scheduled(fixedDelay = 300000)
    @Transactional
    public void processAutomation() {
        LocalDateTime now = LocalDateTime.now();
        
        // 1. Handle Automatic Awarding
        List<BidInvitation> pendingAutoAwards = bidInvitationRepository.findAll().stream()
                .filter(b -> b.getOperationMode() == OperationMode.AUTOMATIC)
                .filter(b -> b.getStatus() == BidInvitation.BidStatus.OPEN)
                .filter(b -> b.getDeadline().isBefore(now))
                .toList();

        for (BidInvitation bid : pendingAutoAwards) {
            log.info("Processing Auto-Award for Bid: {}", bid.getId());
            performAutoAward(bid);
        }

        // 2. Handle Recurring Launches
        List<BidInvitation> pendingRecurring = bidInvitationRepository.findAll().stream()
                .filter(b -> b.getNextRunDate() != null)
                .filter(b -> b.getNextRunDate().isBefore(now))
                .toList();
        
        for (BidInvitation bid : pendingRecurring) {
            log.info("Launching Recurring Bid for: {}", bid.getTitle());
            launchNextCycle(bid);
        }
    }

    private void performAutoAward(BidInvitation bid) {
        List<Quote> quotes = quoteRepository.findByBidInvitation_Id(bid.getId());
        if (quotes.isEmpty()) {
            log.warn("No quotes found for auto-award bid: {}. Closing bid.", bid.getId());
            bid.setStatus(BidInvitation.BidStatus.CLOSED);
            bidInvitationRepository.save(bid);
            return;
        }

        // Strategy: Lowest Price (Initially, weight-logic mock can be added here)
        Quote winner = quotes.stream()
                .min(Comparator.comparing(Quote::getTotalAmount))
                .orElse(null);

        if (winner != null) {
            log.info("Auto-Awarding Winner: {} for Bid: {}", winner.getSupplier().getName(), bid.getId());
            bidService.awardBid(bid.getId(), winner.getId());
        }
    }

    private void launchNextCycle(BidInvitation template) {
        // Clone items and settings into a new BidInvitation
        // Implementation note: This could be a complex deep-copy 
        // For now, we update the nextRunDate of the template to prevent re-processing
        template.setNextRunDate(null); // Or calculate next-next run if needed
        bidInvitationRepository.save(template);
        
        // Logic to create a NEW BidInvitation based on the template would go here
        log.info("Next cycle launch logic triggered (stub) for: {}", template.getId());
    }
}
