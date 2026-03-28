package mls.sho.dms.application.event.edp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.finance.FinancialService;
import mls.sho.dms.application.service.inventory.RecipeService;
import mls.sho.dms.entity.edp.EventStore;
import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.repository.order.OrderItemRepository;
import mls.sho.dms.service.edp.EventStoreService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Consumer responsible for reacting to domain events by recording ledger entries.
 * Decouples the core business logic from the financial reporting module.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FinancialEventConsumer {

    private final FinancialService financialService;
    private final RecipeService recipeService;
    private final OrderItemRepository orderItemRepository;
    private final EventStoreService eventStoreService;

    private static final String CONSUMER_ID = "FINANCE_SYNC";

    @EventListener
    @Transactional
    public void onEvent(EventStore event) {
        // Acknowledge checkpoint
        eventStoreService.updateCheckpoint(CONSUMER_ID, event.getId());

        String type = event.getEventType();
        if (!"order.fire".equals(type) && 
            !"order.payment_completed".equals(type) && 
            !"purchase.invoice_matched".equals(type)) {
            return;
        }

        try {
            Map<String, Object> payload = event.getPayload();
            log.trace("Financial consumer handling event: {}", type);

            switch (type) {
                case "order.fire":
                    handleOrderFire(payload);
                    break;
                case "order.payment_completed":
                    handlePaymentCompleted(payload);
                    break;
                case "purchase.invoice_matched":
                    handlePurchaseInvoiceMatched(payload);
                    break;
            }
        } catch (Exception e) {
            log.error("Financial consumer failed on event {}: {}", event.getId(), e.getMessage());
        }
    }

    private void handleOrderFire(Map<String, Object> payload) {
        UUID orderId = UUID.fromString(payload.get("orderId").toString());
        UUID orderItemId = UUID.fromString(payload.get("orderItemId").toString());
        
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("OrderItem not found: " + orderItemId));
        
        // Calculate cost for ONE unit (as fire events are per unit)
        BigDecimal totalCost = recipeService.calculateItemCost(item);
        BigDecimal unitCost = totalCost.divide(new BigDecimal(item.getQuantity()), 4, java.math.RoundingMode.HALF_UP);
        
        log.debug("Recording COGS (Accrual) for order {} item {} unit cost: {}", orderId, orderItemId, unitCost);
        financialService.recordCOGS(orderId, unitCost);
    }

    private void handlePaymentCompleted(Map<String, Object> payload) {
        UUID orderId = UUID.fromString(payload.get("orderId").toString());
        BigDecimal totalAmount = new BigDecimal(payload.get("totalAmount").toString());
        BigDecimal taxAmount = new BigDecimal(payload.getOrDefault("taxAmount", "0").toString());
        
        log.info("Recording Sale (Cash Basis) for order {} amount: {} tax: {}", orderId, totalAmount, taxAmount);
        financialService.recordSale(orderId, totalAmount, taxAmount);
    }

    private void handlePurchaseInvoiceMatched(Map<String, Object> payload) {
        UUID poId = UUID.fromString(payload.get("poId").toString());
        BigDecimal totalAmount = new BigDecimal(payload.get("totalAmount").toString());
        BigDecimal taxAmount = new BigDecimal(payload.getOrDefault("taxAmount", "0").toString());
        
        log.info("Recording Procurement (Accrual) for Invoice matched on PO {} amount: {}", poId, totalAmount);
        financialService.recordPurchase(poId, totalAmount, taxAmount);
    }
}
