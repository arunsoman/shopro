package mls.sho.dms.application.event.edp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.order.OrderService;
import mls.sho.dms.entity.edp.EventStore;
import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.entity.order.OrderTicket;
import mls.sho.dms.repository.order.OrderItemRepository;
import mls.sho.dms.repository.order.OrderTicketRepository;
import mls.sho.dms.service.kds.KDSService;
import mls.sho.dms.service.edp.EventStoreService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

/**
 * Consumer responsible for routing items to KDS stations when fired.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StationEventConsumer {

    private final KDSService kdsService;
    private final OrderTicketRepository orderTicketRepository;
    private final OrderItemRepository orderItemRepository;
    private final EventStoreService eventStoreService;
    private final OrderService orderService;

    private static final String CONSUMER_ID = "STATION_ROUTER";

    @EventListener
    @Transactional
    public void onEvent(EventStore event) {
        // Always Acknowledge to prevent stalling the entire system
        eventStoreService.updateCheckpoint(CONSUMER_ID, event.getId());

        if (!"order.created".equals(event.getEventType()) && 
            !"order.fire".equals(event.getEventType()) &&
            !"order.item_decrement".equals(event.getEventType())) {
            return;
        }

        try {
            Map<String, Object> payload = event.getPayload();
            UUID orderId = UUID.fromString(payload.get("orderId").toString());
            UUID orderItemId = UUID.fromString(payload.get("orderItemId").toString());
            int unitIndex = Integer.parseInt(payload.getOrDefault("unitIndex", "1").toString());

            if ("order.item_decrement".equals(event.getEventType())) {
                log.info("[KDS] Handling decrement for item {} unit {}", orderItemId, unitIndex);
                String result = kdsService.decrementSpecificUnit(orderItemId, unitIndex);
                
                // Construct result payload by copying original
                Map<String, Object> resultPayload = new HashMap<>(payload);
                resultPayload.put("status", result);
                resultPayload.put("timestamp", java.time.Instant.now().toString());

                if ("OK".equals(result)) {
                    log.info("[KDS] Decrement SUCCESS for item {} unit {}. Updating Order and publishing OK.", orderItemId, unitIndex);
                    
                    // FORMAL DB UPDATE: Now that KDS has confirmed, we decrease the quantity in the order tables
                    orderService.processConfirmedDecrement(orderId, orderItemId, 1);
                    
                    eventStoreService.append("order.item_decrement_ok", resultPayload);
                } else {
                    log.warn("[KDS] Decrement FAILED for item {} unit {} (Reason: {}). Publishing KO.", 
                        orderItemId, unitIndex, result);
                    eventStoreService.append("order.item_decrement_ko", resultPayload);
                }
                return;
            }

            OrderTicket ticket = orderTicketRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
            
            OrderItem item = orderItemRepository.findById(orderItemId)
                    .orElseThrow(() -> new RuntimeException("OrderItem not found: " + orderItemId));

            // Route this specific unit to KDS stations
            kdsService.routeItemUnit(ticket, item, unitIndex);
        } catch (Exception e) {
            log.error("Failed to route item for event {}: {}", event.getId(), e.getMessage());
        }
    }
}
