package mls.sho.dms.application.costing.dto;

import lombok.Data;
import mls.sho.dms.common.enums.KitchenStationType;
import mls.sho.dms.common.enums.RecipeUnit;
import java.math.BigDecimal;

/**
 * DTO for BatchRecipe entity.
 */
import mls.sho.dms.common.enums.RecipeType;
import mls.sho.dms.common.enums.ShelfLife;
import java.util.List;

/**
 * Unified DTO for both Plate and Batch Recipes.
 */
@Data
public class RecipeDTO {
    private Long id;
    private String name;
    private RecipeType recipeType;
    private Long menuItemId;
    private KitchenStationType station;
    private ShelfLife shelfLife;
    private String toolsEquipment;
    private String positionNotes;
    private BigDecimal yieldQuantity;
    private RecipeUnit yieldUnit;
    private boolean active;
    
    // Nested components for the editor
    private List<RecipeIngredientLineDTO> ingredientLines;
    private List<RecipeProcedureStepDTO> procedureSteps;
    
    // Read-only calculated fields
    private BigDecimal totalCost;
    private BigDecimal costPerUnit;
}
