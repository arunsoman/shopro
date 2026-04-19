package mls.sho.dms.application.inventory.exception;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Exception thrown when an order cannot be fulfilled due to insufficient inventory.
 * Supports partial fulfillment by indicating which ingredients are short.
 */
@Getter
@Setter
public class InsufficientInventoryException extends RuntimeException {
    
    private final List<IngredientShortage> shortages = new ArrayList<>();
    private final boolean canPartialFulfill;
    
    public InsufficientInventoryException(String message) {
        super(message);
        this.canPartialFulfill = false;
    }
    
    public InsufficientInventoryException(String message, boolean canPartialFulfill) {
        super(message);
        this.canPartialFulfill = canPartialFulfill;
    }
    
    /**
     * Add an ingredient shortage detail.
     */
    public void addShortage(Long ingredientId, String ingredientName, 
                           BigDecimal required, BigDecimal available, 
                           String unit) {
        IngredientShortage shortage = new IngredientShortage();
        shortage.setIngredientId(ingredientId);
        shortage.setIngredientName(ingredientName);
        shortage.setRequired(required);
        shortage.setAvailable(available);
        shortage.setUnit(unit);
        shortage.setShortBy(required.subtract(available));
        this.shortages.add(shortage);
    }
    
    @Getter
    @Setter
    public static class IngredientShortage {
        private Long ingredientId;
        private String ingredientName;
        private BigDecimal required;
        private BigDecimal available;
        private String unit;
        private BigDecimal shortBy;
    }
}
