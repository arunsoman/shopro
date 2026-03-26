package mls.sho.dms.application.event.edp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.entity.edp.EventStore;
import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.repository.order.OrderItemRepository;
import mls.sho.dms.application.service.inventory.RecipeService;
import mls.sho.dms.service.edp.EventStoreService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Consumer responsible for stock depletion when items are fired to the kitchen.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventConsumer {

    private final RecipeService recipeService;
    private final OrderItemRepository orderItemRepository;
    private final EventStoreService eventStoreService;

    private static final String CONSUMER_ID = "INV_SYNC";

    /**
     * Listens for order events. Synchronous to ensure stock is updated before transaction closes.
     */
    @EventListener
    @Transactional
    public void onEvent(EventStore event) {
        if (!"order.fire".equals(event.getEventType())) {
            return;
        }

        log.info("InventoryConsumer processing order.fire (Event ID: {})", event.getId());

        try {
            UUID orderItemId = UUID.fromString(event.getPayload().get("orderItemId").toString());
            OrderItem item = orderItemRepository.findById(orderItemId)
                    .orElseThrow(() -> new RuntimeException("OrderItem not found: " + orderItemId));

            recipeService.depleteForOrderItem(item);
            
            // Mark the event as processed locally
            eventStoreService.updateCheckpoint(CONSUMER_ID, event.getId());
        } catch (Exception e) {
            log.error("Failed to deplete inventory for event {}: {}", event.getId(), e.getMessage());
            // In a robust system, we would move this to a DLQ or retry queue.
        }
    }
}
