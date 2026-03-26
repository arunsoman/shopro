package mls.sho.dms.application.event.edp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    private static final String CONSUMER_ID = "STATION_ROUTER";

    @EventListener
    @Transactional
    public void onEvent(EventStore event) {
        if (!"order.fire".equals(event.getEventType())) {
            return;
        }

        log.info("StationConsumer processing order.fire (Event ID: {})", event.getId());

        try {
            UUID orderId = UUID.fromString(event.getPayload().get("orderId").toString());
            UUID orderItemId = UUID.fromString(event.getPayload().get("orderItemId").toString());

            OrderTicket ticket = orderTicketRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
            
            OrderItem item = orderItemRepository.findById(orderItemId)
                    .orElseThrow(() -> new RuntimeException("OrderItem not found: " + orderItemId));

            int unitIndex = Integer.parseInt(event.getPayload().getOrDefault("unitIndex", "1").toString());

            // Route this specific unit to KDS stations
            kdsService.routeItemUnit(ticket, item, unitIndex);

            eventStoreService.updateCheckpoint(CONSUMER_ID, event.getId());
        } catch (Exception e) {
            log.error("Failed to route item for event {}: {}", event.getId(), e.getMessage());
        }
    }
}
