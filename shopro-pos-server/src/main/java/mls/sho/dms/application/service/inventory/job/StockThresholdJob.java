package mls.sho.dms.application.service.inventory.job;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.RFQService;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class StockThresholdJob {

    private final RawIngredientRepository ingredientRepository;
    private final AlertService alertService;
    private final RFQService rfqService;
    
    // Simple in-memory debounce map to prevent alerting multiple times per 24h
    // Maps Ingredient ID -> Last Alert Time
    private final Map<UUID, Instant> lastAlertTimes = new HashMap<>();

    @Scheduled(fixedRateString = "${shopro.inventory.stock-check-rate:3600000}") // Default 1 hour
    @Transactional(readOnly = true)
    public void evaluateStockThresholds() {
        log.info("Starting stock threshold evaluation job...");
        
        List<RawIngredient> ingredients = ingredientRepository.findAll();
        Instant now = Instant.now();
        int alertCount = 0;

        for (RawIngredient ingredient : ingredients) {
            if (ingredient.getCurrentStock() == null) continue;
            
            boolean needsAlert = false;
            boolean critical = false;

            if (ingredient.getCriticalLevel() != null && ingredient.getCurrentStock().compareTo(ingredient.getCriticalLevel()) <= 0) {
                needsAlert = true;
                critical = true;
            } else if (ingredient.getSafetyLevel() != null && ingredient.getCurrentStock().compareTo(ingredient.getSafetyLevel()) <= 0) {
                needsAlert = true;
            }
            
            if (needsAlert) {
                Instant lastAlert = lastAlertTimes.get(ingredient.getId());
                // Debounce: 24 hours
                if (lastAlert == null || ChronoUnit.HOURS.between(lastAlert, now) >= 24) {
                    if (critical) {
                        alertService.sendCriticalStockAlert(ingredient);
                    } else {
                        alertService.sendSafetyStockAlert(ingredient);
                    }
                    lastAlertTimes.put(ingredient.getId(), now);
                    alertCount++;
                }
            }
            
            // US-13.1 Check Reorder Point for RFQ generation
            if (ingredient.isAutoReplenish() && ingredient.getReorderPoint() != null && ingredient.getCurrentStock().compareTo(ingredient.getReorderPoint()) <= 0) {
                rfqService.generateRfqIfEligible(ingredient);
            }
        }
        
        log.info("Stock threshold evaluation complete. Dispatched {} alerts.", alertCount);
    }
    
    // For testing/manual trigger
    public void triggerEvaluationNow() {
        evaluateStockThresholds();
    }
}
