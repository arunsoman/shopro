package mls.sho.dms.application.dto.inventory;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record RecipeResponse(
    UUID id,
    UUID targetId, // Can be MenuItem ID or SubRecipe ID
    int recipeVersion,
    BigDecimal totalFoodCost,
    List<RecipeIngredientResponse> ingredients
) {}
