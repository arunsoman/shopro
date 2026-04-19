package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Response DTO for executive summary with KPIs.
 * 
 * OUTPUT: GET /periods/{id}/summary/executive
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutiveSummaryResponse {
    
    /**
     * Period ID.
     */
    private Long periodId;
    
    /**
     * Period name.
     */
    private String periodName;
    
    /**
     * Report generation date.
     */
    private String reportDate;
    
    /**
     * Key Performance Indicators.
     */
    private KPIs kpis;
    
    /**
     * Classification breakdown with counts and percentages.
     */
    private Map<String, ClassificationBreakdown> classificationBreakdown;
    
    /**
     * Overall menu health score (0-100).
     */
    private Integer menuHealthScore;
    
    /**
     * Health status: EXCELLENT, GOOD, FAIR, NEEDS_ATTENTION.
     */
    private String healthStatus;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KPIs {
        private Integer totalItems;
        private Integer totalSold;
        private BigDecimal totalRevenue;
        private BigDecimal totalCost;
        private BigDecimal totalProfit;
        private BigDecimal avgFoodCostPct;
        private BigDecimal avgContributionMargin;
        private BigDecimal avgSellPrice;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassificationBreakdown {
        private Long count;
        private Double percentage;
    }
}
