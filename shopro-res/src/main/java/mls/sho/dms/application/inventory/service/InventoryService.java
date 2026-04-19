package mls.sho.dms.application.inventory.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.inventory.dto.InventoryDtos.*;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.application.inventory.repository.InventoryBalanceRepository;
import mls.sho.dms.application.inventory.repository.InventoryLedgerRepository;
import mls.sho.dms.common.enums.InventoryType;
import mls.sho.dms.common.enums.InventoryCategory;
import mls.sho.dms.entity.Ingredient;
import mls.sho.dms.entity.InventoryIngredientBalance;
import mls.sho.dms.entity.Restaurant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryLedgerRepository ledgerRepository;
    private final InventoryBalanceRepository balanceRepository;
    private final IngredientRepository ingredientRepository;
    private final InventoryIntelligenceService intelligenceService;

    @Transactional
    public void reconcile(Restaurant restaurant, Long ingredientId, BigDecimal physicalCount, String actor) {
        Ingredient ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));
        intelligenceService.recordReconciliation(restaurant, ingredient, physicalCount, actor);
    }

    @Transactional(readOnly = true)
    public BigDecimal getLatestTotalValue(Long restaurantId, InventoryType type) {
        BigDecimal val = ledgerRepository.sumValueByType(restaurantId, type);
        return val != null ? val : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public InventoryStats getInventoryHubStats(Long restaurantId, IngredientService ingredientService) {
        return InventoryStats.builder()
                .foodInventoryValue(getLatestTotalValue(restaurantId, InventoryType.FOOD))
                .barInventoryValue(getLatestTotalValue(restaurantId, InventoryType.BAR))
                .belowParCount(ingredientService.getLowStockCount(restaurantId))
                .build();
    }

    @Transactional(readOnly = true)
    public LatestInventoryDto getLatestInventory(Long restaurantId, InventoryType type) {
        List<InventoryLedgerRepository.CategorySubtotal> subtotals =
                ledgerRepository.findCategorySubtotals(restaurantId, type);

        List<CategorySubtotalDto> breakdown = subtotals.stream()
                .map(subtotal -> CategorySubtotalDto.builder()
                        .category(subtotal.category().name())
                        .subtotal(subtotal.totalValue())
                        .build())
                .collect(Collectors.toList());

        BigDecimal total = subtotals.stream()
                .map(InventoryLedgerRepository.CategorySubtotal::totalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return LatestInventoryDto.builder()
                .totalValue(total)
                .categoryBreakdown(breakdown)
                .build();
    }

    // ============================================================
    // NEW: Fast Balance Lookup Methods (using summary table)
    // ============================================================

    /**
     * Get current balance for an ingredient (O(1) lookup).
     * 
     * @param restaurantId Restaurant ID
     * @param ingredientId Ingredient ID
     * @return Current balance (positive = in stock, negative = depleted)
     */
    @Transactional(readOnly = true)
    public BigDecimal getCurrentBalance(Long restaurantId, Long ingredientId) {
        return balanceRepository.findCurrentBalance(restaurantId, ingredientId)
                .orElse(BigDecimal.ZERO);
    }

    /**
     * Check if ingredient has sufficient stock for an order (O(1) lookup).
     * 
     * @param restaurantId Restaurant ID
     * @param ingredientId Ingredient ID
     * @param requiredQty Required quantity
     * @return true if sufficient stock available
     */
    @Transactional(readOnly = true)
    public boolean hasSufficientStock(Long restaurantId, Long ingredientId, BigDecimal requiredQty) {
        return balanceRepository.hasSufficientStock(restaurantId, ingredientId, requiredQty);
    }

    /**
     * Get all low-stock ingredients for a restaurant.
     * 
     * @param restaurantId Restaurant ID
     * @return List of ingredients below reorder point
     */
    @Transactional(readOnly = true)
    public List<InventoryIngredientBalance> getLowStockIngredients(Long restaurantId) {
        return balanceRepository.findLowStockIngredients(restaurantId);
    }

    /**
     * Get all out-of-stock ingredients.
     * 
     * @param restaurantId Restaurant ID
     * @return List of ingredients with balance <= 0
     */
    @Transactional(readOnly = true)
    public List<InventoryIngredientBalance> getOutOfStockIngredients(Long restaurantId) {
        return balanceRepository.findOutOfStockIngredients(restaurantId);
    }

    /**
     * Get inventory summary for dashboard (all ingredients with positive balance).
     * 
     * @param restaurantId Restaurant ID
     * @return List of ingredients with current balances
     */
    @Transactional(readOnly = true)
    public List<InventoryIngredientBalance> getInventorySummary(Long restaurantId) {
        return balanceRepository.findInventorySummary(restaurantId);
    }

    /**
     * Get count of ingredients with negative balances (data integrity check).
     * 
     * @param restaurantId Restaurant ID
     * @return Count of negative balance ingredients
     */
    @Transactional(readOnly = true)
    public long getNegativeBalanceCount(Long restaurantId) {
        return balanceRepository.countNegativeBalances(restaurantId);
    }

    /**
     * Get total positive inventory balance.
     * 
     * @param restaurantId Restaurant ID
     * @return Sum of all positive balances
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalPositiveBalance(Long restaurantId) {
        return balanceRepository.getTotalPositiveBalance(restaurantId);
    }

    /**
     * Validate order ingredients in batch (for order placement).
     * 
     * @param restaurantId Restaurant ID
     * @param ingredientRequirements Map of ingredient_id -> required_qty
     * @return true if all ingredients have sufficient stock
     */
    @Transactional(readOnly = true)
    public boolean validateOrderIngredients(Long restaurantId, Map<Long, BigDecimal> ingredientRequirements) {
        for (Map.Entry<Long, BigDecimal> entry : ingredientRequirements.entrySet()) {
            Long ingredientId = entry.getKey();
            BigDecimal requiredQty = entry.getValue();
            
            if (!hasSufficientStock(restaurantId, ingredientId, requiredQty)) {
                log.warn("Insufficient stock for ingredient {}: required={}, available={}",
                    ingredientId, requiredQty, 
                    getCurrentBalance(restaurantId, ingredientId));
                return false;
            }
        }
        return true;
    }
}
