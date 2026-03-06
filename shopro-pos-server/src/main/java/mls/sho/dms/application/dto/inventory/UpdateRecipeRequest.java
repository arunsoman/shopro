package mls.sho.dms.application.dto.inventory;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record UpdateRecipeRequest(
    @NotEmpty(message = "At least one ingredient is required.")
    List<UpdateRecipeIngredientRequest> ingredients
) {}
