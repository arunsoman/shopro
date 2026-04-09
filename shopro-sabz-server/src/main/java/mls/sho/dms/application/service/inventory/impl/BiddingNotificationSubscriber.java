package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.event.inventory.RFQStateChangedEvent;
import mls.sho.dms.application.service.core.NotificationEngine;
import mls.sho.dms.entity.inventory.RFQ;
import mls.sho.dms.entity.inventory.RfqStatus;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class BiddingNotificationSubscriber {

    private final NotificationEngine notificationEngine;

    @EventListener
    public void handleRFQStateChanged(RFQStateChangedEvent event) {
        RFQ rfq = event.getRfq();
        RfqStatus toStatus = event.getToStatus();

        log.info("Handling RFQ state change notification for RFQ {} to status {}", rfq.getId(), toStatus);

        String typeCode = "BID_" + toStatus.name();
        String title = "Bid Status Update: " + toStatus.name();
        String body = String.format("The bid for %s has been moved to %s.", 
                rfq.getIngredient().getName(), toStatus.name());

        if (event.getReason() != null && !event.getReason().isEmpty()) {
            body += " Reason: " + event.getReason();
        }

        Map<String, Object> data = new HashMap<>();
        data.put("rfqId", rfq.getId());
        data.put("ingredientName", rfq.getIngredient().getName());
        data.put("status", toStatus.name());
        data.put("requiredQty", rfq.getRequiredQty());

        // Routing is handled by NotificationEngine based on typeCode policies
        notificationEngine.sendNotification(typeCode, title, body, data, rfq.getId().toString());
    }
}
