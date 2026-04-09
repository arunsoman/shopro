package mls.sho.dms.application.inventory.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/** Namespace container for inventory intelligence DTOs. Do NOT add @Builder/@Data here. */
public class InventoryIntelligenceDtos {

    @Data
    @Builder
    public static class MenuProfitabilityDto {
        private Long menuId;
        private String menuName;
        private BigDecimal sellPrice;
        private BigDecimal actualCostBasis;
        private BigDecimal grossMargin;
        private BigDecimal foodCostPct;
        private List<IngredientCostDetailDto> costBreakdown;
    }

    @Data
    @Builder
    public static class IngredientCostDetailDto {
        private String ingredientName;
        private BigDecimal quantityUsed;
        private String unit;
        private BigDecimal currentLotPrice;
        private BigDecimal lineCostContribution;
    }

    @Data
    @Builder
    public static class WasteSummaryDto {
        private Long restaurantId;
        private BigDecimal totalWasteValue;
        private List<WasteCategoryDto> breakdowns;
    }

    @Data
    @Builder
    public static class WasteCategoryDto {
        private String reason;
        private BigDecimal value;
        private BigDecimal quantity;
    }
}
