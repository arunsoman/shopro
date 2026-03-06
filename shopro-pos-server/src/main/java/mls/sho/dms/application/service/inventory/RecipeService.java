package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.RecipeResponse;
import mls.sho.dms.application.dto.inventory.UpdateRecipeRequest;
import mls.sho.dms.entity.order.OrderItem;

import java.util.UUID;

public interface RecipeService {
    RecipeResponse findLatestByMenuItem(UUID menuItemId);
    RecipeResponse updateRecipe(UUID menuItemId, UpdateRecipeRequest request);
    
    RecipeResponse findLatestBySubRecipe(UUID subRecipeId);
    RecipeResponse updateSubRecipeRecipe(UUID subRecipeId, UpdateRecipeRequest request);

    /** Deplete raw ingredients for a single OrderItem based on its recipe. */
    void depleteForOrderItem(OrderItem item);
}
