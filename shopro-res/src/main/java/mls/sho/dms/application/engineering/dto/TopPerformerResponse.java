package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO for top performers report.
 * 
 * OUTPUT: GET /periods/{id}/report/top-performers
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopPerformerResponse {
    
    /**
     * Rank in top performers list (1-based).
     */
    private Integer rank;
    
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
     * Classification.
     */
    private String classification;
    
    /**
     * Quantity sold.
     */
    private Integer quantitySold;
    
    /**
     * Total revenue.
     */
    private BigDecimal revenue;
    
    /**
     * Total profit.
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
}
