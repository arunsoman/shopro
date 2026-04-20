package mls.sho.dms.application.inventory.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.application.inventory.repository.InventoryLedgerRepository;
import mls.sho.dms.common.enums.InventoryType;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Provides global inventory stats (not scoped to a single restaurant).
 */
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryStatsController {

    private final InventoryLedgerRepository ledgerRepository;
    private final IngredientRepository ingredientRepository;
    private final mls.sho.dms.application.purchasing.repository.PurchaseOrderRepository poRepository;

    @GetMapping("/stats")
    public Map<String, Object> getGlobalStats() {
        // Sum across all restaurants by iterating distinct ledger totals per type
        BigDecimal foodValue = ledgerRepository.sumGlobalValueByType(InventoryType.FOOD);
        BigDecimal barValue  = ledgerRepository.sumGlobalValueByType(InventoryType.BAR);
        
        List<Long> onOrderIds = poRepository.findGlobalIngredientsOnOrder();
        long belowParCount   = onOrderIds.isEmpty() 
            ? ingredientRepository.countBelowParGlobalNoExits() 
            : ingredientRepository.countBelowParGlobalNotIn(onOrderIds);

        return Map.of(
            "foodInventoryValue", foodValue  != null ? foodValue  : BigDecimal.ZERO,
            "barInventoryValue",  barValue   != null ? barValue   : BigDecimal.ZERO,
            "belowParCount",      belowParCount
        );
    }
}
