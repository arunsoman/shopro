package mls.sho.dms.application.inventory.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.inventory.service.IngredientService;
import mls.sho.dms.application.inventory.dto.InventoryDtos.LowStockAlertDto;
import mls.sho.dms.application.inventory.entity.Ingredient;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controller for managing ingredients independently of inventory periods.
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/ingredients")
@RequiredArgsConstructor
public class IngredientController {

    private final IngredientService ingredientService;
    private final mls.sho.dms.application.common.TenantGuard tenantGuard;

    @GetMapping
    public List<Ingredient> getIngredients(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) mls.sho.dms.common.enums.InventoryType type,
            @RequestParam(required = false) mls.sho.dms.common.enums.InventoryCategory category,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search) {
        return ingredientService.getFilteredIngredients(restaurantId, type, category, active, search);
    }

    @GetMapping("/search")
    public List<Ingredient> searchIngredients(
            @PathVariable Long restaurantId,
            @RequestParam String fragment) {
        return ingredientService.getFilteredIngredients(restaurantId, null, null, true, fragment);
    }

    @GetMapping("/low-stock")
    public List<LowStockAlertDto> getLowStock(@PathVariable Long restaurantId) {
        return ingredientService.getLowStockAlerts(restaurantId);
    }

    @GetMapping("/{id}")
    public Ingredient getIngredient(@PathVariable Long restaurantId, @PathVariable Long id) {
        tenantGuard.ingredient(restaurantId, id);
        return ingredientService.getIngredient(id);
    }

    @GetMapping("/{id}/costs")
    public mls.sho.dms.application.inventory.dto.IngredientCostDto getIngredientCosts(
            @PathVariable Long restaurantId,
            @PathVariable Long id) {
        tenantGuard.ingredient(restaurantId, id);
        return ingredientService.getIngredientCosts(id);
    }

    @PostMapping
    public Ingredient createIngredient(@PathVariable Long restaurantId, @RequestBody Ingredient ingredient) {
        ingredient.setRestaurant(new mls.sho.dms.entity.Restaurant());
        ingredient.getRestaurant().setId(restaurantId);
        return ingredientService.saveIngredient(ingredient);
    }

    @PutMapping("/{id}")
    public Ingredient updateIngredient(@PathVariable Long restaurantId, @PathVariable Long id, @RequestBody Ingredient ingredient) {
        ingredient.setId(id);
        ingredient.setRestaurant(new mls.sho.dms.entity.Restaurant());
        ingredient.getRestaurant().setId(restaurantId);
        return ingredientService.saveIngredient(ingredient);
    }

    @DeleteMapping("/{id}")
    public void deactivateIngredient(@PathVariable Long restaurantId, @PathVariable Long id) {
        tenantGuard.ingredient(restaurantId, id);
        ingredientService.deactivateIngredient(id);
    }
}
