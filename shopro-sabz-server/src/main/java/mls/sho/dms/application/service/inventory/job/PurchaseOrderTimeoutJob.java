package mls.sho.dms.application.service.inventory.job;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.POStateMachineService;
import mls.sho.dms.entity.inventory.PurchaseOrder;
import mls.sho.dms.entity.inventory.PurchaseOrderStatus;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

/**
 * Job that periodically checks for SENT purchase orders that haven't been acknowledged
 * within the configured timeout period (default 24h).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PurchaseOrderTimeoutJob {

    private final PurchaseOrderRepository poRepository;
    private final POStateMachineService poStateMachineService;
    private final AlertService alertService;

    @Value("${shopro.inventory.po-ack-timeout-hours:24}")
    private int timeoutHours;

    // Default system actor for automated transitions
    private static final UUID SYSTEM_ACTOR_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    /**
     * Runs every hour to check for unacknowledged POs.
     */
    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void checkUnacknowledgedPOs() {
        log.debug("Running Purchase Order Timeout Job...");
        
        Instant cutoffTime = Instant.now().minus(timeoutHours, ChronoUnit.HOURS);
        
        // Find SENT POs sent before the cutoff time
        List<PurchaseOrder> stalledPos = poRepository.findByStatusAndSentAtBefore(PurchaseOrderStatus.SENT, cutoffTime);
        
        if (!stalledPos.isEmpty()) {
            log.info("Found {} POs that exceeded acknowledgment timeout ({} hours)", stalledPos.size(), timeoutHours);
            
            for (PurchaseOrder po : stalledPos) {
                try {
                    // Transition to CANCELLED or just alert? 
                    // User requirements say "Alert manager", so we alert. 
                    // We might not want to auto-cancel a PO yet without manager review.
                    
                    alertService.sendNotification(
                        "Manager",
                        "High Priority: Unacknowledged PO",
                        "Purchase Order #" + po.getId() + " (Supplier: " + po.getSupplier().getCompanyName() + 
                        ") has been in SENT status for over " + timeoutHours + " hours without acknowledgment."
                    );
                    
                    log.warn("Alert dispatched for stalled PO: {}", po.getId());
                } catch (Exception e) {
                    log.error("Failed to process timeout for PO {}: {}", po.getId(), e.getMessage());
                }
            }
        }
    }
}
