package mls.sho.dms.application.inventory.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

/**
 * Calculated unit costs for an ingredient.
 */
@Data
@Builder
public class IngredientCostDto {
    private Long ingredientId;
    private BigDecimal ruCost;
    private BigDecimal iuCost;
}
