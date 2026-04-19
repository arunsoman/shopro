package mls.sho.dms.application.costing.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.util.List;

/**
 * Aggregated DTO for the Menu Item Precision Costing Editor.
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class CostCardDTO extends MenuItemDTO {
    private List<CostingLineDTO> ingredientLines;
    private List<CostingLineDTO> recipeLines; // Used for frontend state separation or just merged in costingLines
    private List<CostingLineDTO> costingLines; // Unified list of all ingredients and recipes
    
    private BigDecimal plateCost;
    private BigDecimal totalCost;
    private BigDecimal foodCostPct;
    private BigDecimal gpDollars;
}
