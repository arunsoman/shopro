package mls.sho.dms.application.pos.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.pos.repository.MenuItemRepository;
import mls.sho.dms.entity.MenuItem;
import mls.sho.dms.entity.Recipe;
import mls.sho.dms.entity.RecipeIngredientLine;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for configuring Menu Item recipes and ingredient linkages.
 * Enables the 'Precision Editor' in the UI.
 */
@Service
@RequiredArgsConstructor
public class MenuItemConfigService {

    private final MenuItemRepository menuItemRepository;

    @Transactional
    public MenuItem updatePrecisionLinkage(Long menuItemId, List<RecipeIngredientLine> newLines) {
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu Item not found"));

        // 1. Get or Create active PLATE recipe
        Recipe recipe = item.getRecipes().stream()
                .filter(r -> r.getRecipeType() == mls.sho.dms.common.enums.RecipeType.PLATE)
                .findFirst()
                .orElseGet(() -> {
                    Recipe newRecipe = new Recipe();
                    newRecipe.setMenuItem(item);
                    newRecipe.setRestaurant(item.getRestaurant());
                    newRecipe.setName(item.getName() + " Recipe");
                    newRecipe.setRecipeType(mls.sho.dms.common.enums.RecipeType.PLATE);
                    newRecipe.setStation(mls.sho.dms.common.enums.KitchenStationType.LINE_COOK);
                    return newRecipe;
                });

        // 2. Clear Existing Lines
        recipe.getIngredientLines().clear();
        
        // 3. Add new lines, ensuring back-reference is set for JPA cascading
        if (newLines != null) {
            int lineNo = 1;
            for (RecipeIngredientLine line : newLines) {
                line.setRecipe(recipe);
                line.setLineNumber(lineNo++);
                recipe.getIngredientLines().add(line);
            }
        }

        item.getRecipes().add(recipe);
        return menuItemRepository.save(item);
    }
}
