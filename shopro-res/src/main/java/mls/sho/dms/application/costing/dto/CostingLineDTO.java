package mls.sho.dms.application.costing.dto;

import lombok.Data;
import mls.sho.dms.common.enums.RecipeUnit;
import java.math.BigDecimal;

/**
 * DTO for a single costing line in a Menu Item (Ingredient or Batch Recipe).
 */
@Data
public class CostingLineDTO {
    private Long id;
    private Long ingredientId;
    private Long batchRecipeId;
    private String description;
    private BigDecimal quantity;
    private RecipeUnit unit;
    private BigDecimal unitCost;
    private BigDecimal lineTotal;
}
