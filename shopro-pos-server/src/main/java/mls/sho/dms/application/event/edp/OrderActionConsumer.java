package mls.sho.dms.application.event.edp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.entity.edp.EventStore;
import mls.sho.dms.service.edp.EventStoreService;
import mls.sho.dms.service.kds.KDSService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Consumer that handles high-level order actions and synchronizes them with KDS.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class OrderActionConsumer {

    private final KDSService kdsService;
    private final EventStoreService eventStoreService;

    private static final String CONSUMER_NAME = "order_action_sync";

    @EventListener
    @Transactional
    public void onOrderEvent(EventStore event) {
        String type = event.getEventType();
        if (!type.equals("order.cancel") && !type.equals("order.item_void")) {
            return;
        }

        Map<String, Object> data = event.getPayload();
        log.info("[EDP] Processing {} for order lifecycle", type);

        try {
            if ("order.cancel".equals(type)) {
                UUID orderId = UUID.fromString(data.get("orderId").toString());
                kdsService.cancelKDSTickets(orderId);
            } else if ("order.item_void".equals(type)) {
                UUID orderItemId = UUID.fromString(data.get("orderItemId").toString());
                kdsService.voidItemInKDS(orderItemId);
            }
        } catch (Exception e) {
            log.error("[EDP] Error processing order event {}: {}", type, e.getMessage());
            // In a production system, we might DLQ this or retry
        }

        // Track checkpoint
        eventStoreService.updateCheckpoint(CONSUMER_NAME, event.getId());
    }
}
