package mls.sho.dms.application.dto.inventory;

import java.math.BigDecimal;
import java.util.UUID;

public record RecipeIngredientResponse(
    UUID ingredientId,
    String ingredientName,
    BigDecimal quantity,
    String unitOfMeasure,
    BigDecimal effectiveCost
) {}
