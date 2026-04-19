package mls.sho.dms.application.inventory.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.application.inventory.repository.InventoryBalanceRepository;
import mls.sho.dms.entity.Ingredient;
import mls.sho.dms.entity.Restaurant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import mls.sho.dms.application.inventory.dto.IngredientCostDto;
import mls.sho.dms.application.inventory.dto.InventoryDtos.LowStockAlertDto;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository repository;
    private final InventoryBalanceRepository balanceRepository;

    @Transactional(readOnly = true)
    public IngredientCostDto getIngredientCosts(Long id) {
        Ingredient ingredient = getIngredient(id);
        BigDecimal puPrice = ingredient.getPurchaseUnitPrice() != null ? ingredient.getPurchaseUnitPrice() : BigDecimal.ZERO;
        
        BigDecimal ruCost = (ingredient.getRuPerPu() != null && ingredient.getRuPerPu().compareTo(BigDecimal.ZERO) > 0)
            ? puPrice.divide(ingredient.getRuPerPu(), 4, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        BigDecimal iuCost = (ingredient.getIuPerPu() != null && ingredient.getIuPerPu().compareTo(BigDecimal.ZERO) > 0)
            ? puPrice.divide(ingredient.getIuPerPu(), 4, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        return IngredientCostDto.builder()
                .ingredientId(id)
                .ruCost(ruCost)
                .iuCost(iuCost)
                .build();
    }

    @Transactional(readOnly = true)
    public List<Ingredient> getAllIngredients(Long restaurantId) {
        return repository.findAllByRestaurantId(restaurantId);
    }

    @Transactional(readOnly = true)
    public List<Ingredient> getFilteredIngredients(
            Long restaurantId, 
            mls.sho.dms.common.enums.InventoryType type, 
            mls.sho.dms.common.enums.InventoryCategory category, 
            Boolean active, 
            String search) {
        return repository.findFiltered(restaurantId, type, category, active, search);
    }

    @Transactional(readOnly = true)
    public List<Ingredient> getLowStockIngredients(Long restaurantId) {
        return repository.findAllLowStock(restaurantId);
    }

    @Transactional(readOnly = true)
    public List<LowStockAlertDto> getLowStockAlerts(Long restaurantId) {
        List<Ingredient> lowStockIngredients = repository.findAllLowStock(restaurantId);

        return lowStockIngredients.stream()
            .map(ingredient -> {
                BigDecimal parLevel = ingredient.getParLevel() != null ? ingredient.getParLevel() : BigDecimal.ZERO;
                // Read the authoritative balance from InventoryIngredientBalance, not the deprecated onHand
                BigDecimal currentBalance = balanceRepository
                        .findCurrentBalance(restaurantId, ingredient.getId())
                        .orElse(BigDecimal.ZERO);
                BigDecimal shortfallAmount = parLevel.subtract(currentBalance);

                return LowStockAlertDto.builder()
                    .ingredientId(ingredient.getId())
                    .itemCode(ingredient.getItemCode())
                    .description(ingredient.getDescription())
                    .inventoryUnit(ingredient.getInventoryUnit() != null ? ingredient.getInventoryUnit().name() : null)
                    .parLevel(parLevel)
                    .onHand(currentBalance)
                    .shortfallAmount(shortfallAmount)
                    .build();
            })
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getLowStockCount(Long restaurantId) {
        return repository.countLowStock(restaurantId);
    }

    @Transactional
    public Ingredient saveIngredient(Ingredient ingredient) {
        return repository.save(ingredient);
    }

    @Transactional(readOnly = true)
    public Ingredient getIngredient(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));
    }

    @Transactional
    public void deactivateIngredient(Long id) {
        Ingredient ingredient = getIngredient(id);
        ingredient.setActive(false);
        repository.save(ingredient);
    }
}
