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
import java.time.Instant;
import java.util.List;
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
            !"purchase.invoice_matched".equals(type) &&
            !"finance.manual_entry".equals(type) &&
            !"finance.petty_cash_fetched".equals(type) &&
            !"finance.cash_expense_paid".equals(type) &&
            !"finance.staff_advance_paid".equals(type)) {
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
                case "finance.manual_entry":
                    processManualEntry(payload);
                    break;
                case "finance.petty_cash_fetched":
                    handlePettyCashFetched(payload);
                    break;
                case "finance.cash_expense_paid":
                    handleCashExpensePaid(payload);
                    break;
                case "finance.staff_advance_paid":
                    handleStaffAdvancePaid(payload);
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

    private void processManualEntry(Map<String, Object> payload) {
        String description = (String) payload.get("description");
        Instant entryDate = Instant.parse((String) payload.get("entryDate"));
        List<Map<String, Object>> linesData = (List<Map<String, Object>>) payload.get("lines");
        
        List<FinancialService.LineRequest> lines = linesData.stream()
                .map(l -> new FinancialService.LineRequest(
                        (String) l.get("accountCode"),
                        new BigDecimal(l.get("debit").toString()),
                        new BigDecimal(l.get("credit").toString())
                ))
                .toList();

        log.info("Processing manual journal entry: {} on {}", description, entryDate);
        financialService.postEntry(entryDate, description, null, lines);
    }

    private void handlePettyCashFetched(Map<String, Object> payload) {
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String initiator = (String) payload.getOrDefault("initiatedBy", "System");
        String desc = "Petty Cash Replenishment (Main Safe → Petty Cash) - Initiated by " + initiator;
        
        List<FinancialService.LineRequest> lines = List.of(
            new FinancialService.LineRequest("1005", amount, BigDecimal.ZERO), // Debit Petty Cash
            new FinancialService.LineRequest("1000", BigDecimal.ZERO, amount)  // Credit Main Cash
        );
        financialService.postEntry(Instant.now(), desc, null, lines);
    }

    private void handleCashExpensePaid(Map<String, Object> payload) {
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String category = (String) payload.getOrDefault("category", "General Expense");
        String initiator = (String) payload.getOrDefault("initiatedBy", "System");
        String desc = "Cash Expense: " + category + " - Initiated by " + initiator;
        
        List<FinancialService.LineRequest> lines = List.of(
            new FinancialService.LineRequest("6000", amount, BigDecimal.ZERO), // Debit Expense
            new FinancialService.LineRequest("1005", BigDecimal.ZERO, amount)  // Credit Petty Cash
        );
        financialService.postEntry(Instant.now(), desc, null, lines);
    }

    private void handleStaffAdvancePaid(Map<String, Object> payload) {
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String staffName = (String) payload.getOrDefault("staffName", "Unknown Staff");
        String initiator = (String) payload.getOrDefault("initiatedBy", "System");
        String desc = "Staff Advance: " + staffName + " - Initiated by " + initiator;
        
        List<FinancialService.LineRequest> lines = List.of(
            new FinancialService.LineRequest("1210", amount, BigDecimal.ZERO), // Debit Staff Advance Asset
            new FinancialService.LineRequest("1000", BigDecimal.ZERO, amount)  // Credit Main Cash
        );
        financialService.postEntry(Instant.now(), desc, null, lines);
    }
}
