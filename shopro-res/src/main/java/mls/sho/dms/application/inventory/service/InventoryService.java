package mls.sho.dms.application.inventory.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.inventory.dto.InventoryDtos.*;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.application.inventory.repository.InventoryLedgerRepository;
import mls.sho.dms.common.enums.InventoryType;
import mls.sho.dms.common.enums.InventoryCategory;
import mls.sho.dms.entity.Ingredient;
import mls.sho.dms.entity.Restaurant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryLedgerRepository ledgerRepository;
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
}
