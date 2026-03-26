package mls.sho.dms.application.event.edp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.entity.edp.EventStore;
import mls.sho.dms.entity.kds.KDSItemStatus;
import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.entity.order.OrderItemStatus;
import mls.sho.dms.repository.order.OrderItemRepository;
import mls.sho.dms.service.edp.EventStoreService;
import mls.sho.dms.application.service.order.OrderService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Consumer that synchronizes KDS item status changes back to the POS Order items.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class PosStatusConsumer {

    private final OrderItemRepository orderItemRepository;
    private final OrderService orderService;
    private final EventStoreService eventStoreService;

    private static final String CONSUMER_NAME = "pos_status_sync";

    @EventListener
    @Transactional
    public void onKdsItemStatusChanged(EventStore event) {
        if (!"kds.item.status_changed".equals(event.getEventType())) {
            return;
        }

        Map<String, Object> data = event.getPayload();
        UUID orderItemId = UUID.fromString(data.get("orderItemId").toString());
        String statusStr = data.get("newStatus").toString();
        KDSItemStatus kdsStatus = KDSItemStatus.valueOf(statusStr);

        log.info("[EDP] Processing {} for order item: {}", event.getEventType(), orderItemId);

        orderItemRepository.findById(orderItemId).ifPresent(orderItem -> {
            OrderItemStatus newPosStatus = mapToPosStatus(kdsStatus);
            if (orderItem.getStatus() != newPosStatus) {
                log.debug("[EDP] Syncing item {} status to {}", orderItemId, newPosStatus);
                orderItem.setStatus(newPosStatus);
                orderItemRepository.save(orderItem);
                
                // Recalculate ticket status if needed
                orderService.updateTicketStatusFromItems(orderItem.getTicket().getId());
            }
        });

        // Track checkpoint
        eventStoreService.updateCheckpoint(CONSUMER_NAME, event.getId());
    }

    private OrderItemStatus mapToPosStatus(KDSItemStatus kdsStatus) {
        return switch (kdsStatus) {
            case PENDING -> OrderItemStatus.HELD; // Should theoretically be HELD or SENT
            case COOKING, PAUSED -> OrderItemStatus.SENT;
            case READY -> OrderItemStatus.READY;
            case SERVED -> OrderItemStatus.DELIVERED;
        };
    }
}
