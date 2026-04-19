package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mls.sho.dms.common.enums.MenuEngClassification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Response DTO for category-specific menu engineering analysis.
 * Each category has its own WINNER/WORKHORSE/OPPORTUNITY/LOSER classification.
 * 
 * OUTPUT: POST /analyze/by-category
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryAnalysisResultDTO {
    
    /**
     * Name of the category.
     */
    private String categoryName;
    
    /**
     * Category ID (0 for Uncategorized).
     */
    private Long categoryId;
    
    /**
     * Total items in this category.
     */
    private Integer itemCount;
    
    /**
     * Total quantity sold in this category.
     */
    private Integer totalQuantitySold;
    
    /**
     * Total revenue from this category.
     */
    private BigDecimal totalRevenue;
    
    /**
     * Total profit from this category.
     */
    private BigDecimal totalProfit;
    
    /**
     * Average contribution margin for this category.
     */
    private BigDecimal avgContributionMargin;
    
    /**
     * Average food cost percentage for this category.
     */
    private BigDecimal avgFoodCostPct;
    
    /**
     * Average popularity score for items in this category.
     */
    private BigDecimal avgPopularityScore;
    
    /**
     * Count of items in each classification.
     */
    private Map<MenuEngClassification, Long> classificationCounts;
    
    /**
     * Detailed results for each menu item in the category.
     */
    private List<MenuEngResultDTO> items;
    
    /**
     * Category-specific popularity threshold.
     */
    private BigDecimal categoryPopularityThreshold;
    
    /**
     * Category-specific margin threshold.
     */
    private BigDecimal categoryMarginThreshold;
}
