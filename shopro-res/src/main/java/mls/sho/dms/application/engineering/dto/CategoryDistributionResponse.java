package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Response DTO for category distribution report.
 * 
 * OUTPUT: GET /periods/{id}/report/category-distribution
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDistributionResponse {
    
    /**
     * Category name.
     */
    private String category;
    
    /**
     * Number of items in this category.
     */
    private Integer itemCount;
    
    /**
     * Total quantity sold in this category.
     */
    private Integer totalSold;
    
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
    private BigDecimal avgMargin;
    
    /**
     * Classification breakdown for this category.
     */
    private Map<String, Long> classification;
}
