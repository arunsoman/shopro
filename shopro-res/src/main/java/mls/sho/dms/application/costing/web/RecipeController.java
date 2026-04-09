package mls.sho.dms.application.costing.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.costing.dto.RecipeDTO;
import mls.sho.dms.application.costing.service.RecipeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing batch and sub-recipes.
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public List<RecipeDTO> getRecipes(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) Boolean active) {
        return recipeService.getRecipes(restaurantId, active);
    }

    @GetMapping("/{id}")
    public RecipeDTO getRecipe(
            @PathVariable Long restaurantId,
            @PathVariable Long id) {
        return recipeService.getRecipeDetail(restaurantId, id);
    }

    @PostMapping
    public RecipeDTO createRecipe(
            @PathVariable Long restaurantId,
            @RequestBody RecipeDTO dto) {
        return recipeService.createRecipe(restaurantId, dto);
    }

    @PutMapping("/{id}")
    public RecipeDTO updateRecipe(
            @PathVariable Long restaurantId,
            @PathVariable Long id,
            @RequestBody RecipeDTO dto) {
        return recipeService.updateRecipe(restaurantId, id, dto);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<Void> deleteRecipe(
            @PathVariable Long restaurantId,
            @PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}
