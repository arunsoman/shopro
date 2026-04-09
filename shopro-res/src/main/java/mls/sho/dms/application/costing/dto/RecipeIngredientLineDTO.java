package mls.sho.dms.application.costing.dto;

import lombok.Data;
import mls.sho.dms.common.enums.RecipeUnit;
import java.math.BigDecimal;

/**
 * DTO for RecipeIngredientLine entity.
 */
@Data
public class RecipeIngredientLineDTO {
    private Long id;
    private Long ingredientId;
    private String description;
    private BigDecimal quantity;
    private RecipeUnit recipeUnit;
    private BigDecimal ruCost;
    private BigDecimal lineTotal;
}
