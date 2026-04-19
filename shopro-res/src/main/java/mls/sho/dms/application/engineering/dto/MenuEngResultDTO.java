package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mls.sho.dms.common.enums.MenuEngClassification;

import java.math.BigDecimal;

/**
 * Response DTO for menu engineering analysis result.
 * 
 * OUTPUT: POST /analyze, POST /run, GET /periods/{id}/results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuEngResultDTO {
    
    /**
     * Unique identifier of the menu item.
     */
    private Long itemId;
    
    /**
     * Name of the menu item.
     */
    private String itemName;
    
    /**
     * Category name of the menu item.
     */
    private String categoryName;
    
    /**
     * Selling price of the menu item.
     */
    private BigDecimal sellPrice;
    
    /**
     * Cost of the menu item (food cost).
     */
    private BigDecimal itemCost;
    
    /**
     * Number of units sold in the period.
     */
    private Integer quantitySold;
    
    /**
     * Classification based on menu engineering matrix:
     * - WINNER: High popularity, high margin (Stars)
     * - WORKHORSE: High popularity, low margin (Plow Horses)
     * - OPPORTUNITY: Low popularity, high margin (Puzzles)
     * - LOSER: Low popularity, low margin (Dogs)
     */
    private MenuEngClassification classification;
    
    /**
     * Contribution margin per unit (sell price - item cost).
     */
    private BigDecimal contributionMargin;
    
    /**
     * Food cost percentage (item cost / sell price * 100).
     */
    private BigDecimal foodCostPct;
    
    /**
     * Total revenue (sell price * quantity sold).
     */
    private BigDecimal totalRevenue;
    
    /**
     * Total profit (contribution margin * quantity sold).
     */
    private BigDecimal totalProfit;
    
    /**
     * Popularity score (quantity sold / average quantity sold).
     */
    private BigDecimal popularityScore;
    
    /**
     * Whether the item's food cost exceeds the warning threshold.
     */
    private Boolean foodCostWarning;
}
