package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO for opportunity items report.
 * Items with high margin but low popularity - potential for improvement.
 * 
 * OUTPUT: GET /periods/{id}/report/opportunities
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpportunityItemResponse {
    
    /**
     * Menu item ID.
     */
    private Long itemId;
    
    /**
     * Menu item name.
     */
    private String itemName;
    
    /**
     * Category name.
     */
    private String category;
    
    /**
     * Current quantity sold.
     */
    private Integer quantitySold;
    
    /**
     * Current revenue.
     */
    private BigDecimal revenue;
    
    /**
     * Current profit.
     */
    private BigDecimal profit;
    
    /**
     * Contribution margin per unit.
     */
    private BigDecimal contributionMargin;
    
    /**
     * Food cost percentage.
     */
    private BigDecimal foodCostPct;
    
    /**
     * Projected revenue increase if popularity increases by 50 orders.
     */
    private BigDecimal potentialRevenueIncrease;
    
    /**
     * Suggested action to improve popularity.
     */
    private String suggestedAction;
}
