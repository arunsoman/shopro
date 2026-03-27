package mls.sho.dms.application.event.edp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.entity.edp.EventStore;
import mls.sho.dms.service.edp.EventStoreService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Map;

/**
 * Global EDP consumer that relays all database events to WebSockets.
 * Listens AFTER_COMMIT to ensure real-time clients only see final, persisted state.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketRelayConsumer {

    private final SimpMessagingTemplate messagingTemplate;
    private final EventStoreService eventStoreService;
    private long lastSentEventId = -1L;

    private static final String CONSUMER_ID = "WEBSOCKET_RELAY";

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEvent(EventStore event) {
        // Optimization: Defensive check against catch-up re-pulses
        if (event.getId() <= lastSentEventId) {
            log.trace("Skipping relay for already-sent event ID: {}", event.getId());
            return;
        }
        
        log.debug("Relaying event {} (ID: {}) to WebSockets", event.getEventType(), event.getId());
        lastSentEventId = event.getId();

        String destination = resolveDestination(event);
        if (destination != null) {
            messagingTemplate.convertAndSend(destination, event);
        }

        // Update checkpoint (Self-Correction: In a monolith, this is simple. 
        // In a high-throughput system, we'd batch this).
        eventStoreService.updateCheckpoint(CONSUMER_ID, event.getId());
    }

    private String resolveDestination(EventStore event) {
        String type = event.getEventType();
        Map<String, Object> payload = event.getPayload();

        if (type.startsWith("order.")) {
            // Forward to general order topic and specific order topic
            String orderId = String.valueOf(payload.get("orderId"));
            messagingTemplate.convertAndSend("/topic/orders/" + orderId, event);
            return "/topic/orders";
        }

        if (type.startsWith("kds.")) {
            if (payload.containsKey("orderId")) {
                String orderId = String.valueOf(payload.get("orderId"));
                messagingTemplate.convertAndSend("/topic/orders/" + orderId, event);
            }
            return "/topic/kds/status";
        }

        if (type.startsWith("table.")) {
            return "/topic/tables";
        }

        if (type.startsWith("qr_session.")) {
            return "/topic/tableside/pending";
        }

        // Default to a generic EDP stream for debugging/admin tools
        return "/topic/edp/stream";
    }
}
