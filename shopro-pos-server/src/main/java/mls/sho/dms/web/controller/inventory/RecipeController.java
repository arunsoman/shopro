package mls.sho.dms.web.controller.inventory;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.RecipeResponse;
import mls.sho.dms.application.dto.inventory.UpdateRecipeRequest;
import mls.sho.dms.application.service.inventory.RecipeService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/recipes")
@RequiredArgsConstructor
@Tag(name = "Inventory Recipes", description = "Menu item to ingredient mappings")
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping("/menu-item/{menuItemId}")
    public RecipeResponse getRecipeByMenuItem(@PathVariable UUID menuItemId) {
        return recipeService.findLatestByMenuItem(menuItemId);
    }

    @PostMapping("/menu-item/{menuItemId}")
    public RecipeResponse updateRecipeByMenuItem(
            @PathVariable UUID menuItemId,
            @Valid @RequestBody UpdateRecipeRequest request) {
        return recipeService.updateRecipe(menuItemId, request);
    }

    @GetMapping("/sub-recipe/{subRecipeId}")
    public RecipeResponse getRecipeBySubRecipe(@PathVariable UUID subRecipeId) {
        return recipeService.findLatestBySubRecipe(subRecipeId);
    }

    @PostMapping("/sub-recipe/{subRecipeId}")
    public RecipeResponse updateRecipeBySubRecipe(
            @PathVariable UUID subRecipeId,
            @Valid @RequestBody UpdateRecipeRequest request) {
        return recipeService.updateSubRecipeRecipe(subRecipeId, request);
    }
}
