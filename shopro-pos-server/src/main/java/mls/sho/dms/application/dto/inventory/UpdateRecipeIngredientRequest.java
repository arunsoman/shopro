package mls.sho.dms.application.dto.inventory;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record UpdateRecipeIngredientRequest(
    UUID ingredientId,
    
    UUID subRecipeId,

    @NotNull(message = "Quantity is required.")
    BigDecimal quantity
) {}
