package mls.sho.dms.application.inventory.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.kds.event.PosTicketReadyEvent;
import mls.sho.dms.application.pos.repository.OrderRepository;
import mls.sho.dms.application.pos.entity.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Listener that reconciles KDS activity with the physical inventory ledger.
 * Triggered when a ticket is marked as READY at the Expo station.
 */
@Component
@RequiredArgsConstructor
public class InventoryFulfillmentListener {
    private static final Logger log = LoggerFactory.getLogger(InventoryFulfillmentListener.class);
    private final InventoryIntelligenceService inventoryService;
    private final OrderRepository orderRepository;

    @EventListener
    @Transactional
    public void onPosTicketReady(PosTicketReadyEvent event) {
        log.info("KDS signaled READY for Order ID: {}. Triggering fulfillment.", event.getPosOrderId());
        
        Order order = orderRepository.findById(event.getPosOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + event.getPosOrderId()));

        try {
            inventoryService.orderFulfillment(order);
        } catch (Exception e) {
            log.error("Failed to fulfill inventory for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }
}
