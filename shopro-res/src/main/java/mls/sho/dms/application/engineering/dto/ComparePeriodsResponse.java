package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Response DTO for period comparison.
 * 
 * OUTPUT: POST /periods/compare
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparePeriodsResponse {
    
    /**
     * List of compared periods with their summaries.
     */
    private List<PeriodComparisonItem> periods;
    
    /**
     * Classification comparison between periods.
     */
    private Map<String, ClassificationComparison> classificationComparison;
    
    /**
     * Trends analysis between periods.
     */
    private TrendsAnalysis trends;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeriodComparisonItem {
        private Long periodId;
        private String periodName;
        private String startDate;
        private String endDate;
        private Integer totalItems;
        private Integer totalSold;
        private BigDecimal totalRevenue;
        private BigDecimal totalProfit;
        private BigDecimal avgFoodCostPct;
        private BigDecimal avgContributionMargin;
        private Integer winnerCount;
        private Integer workhorseCount;
        private Integer opportunityCount;
        private Integer loserCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassificationComparison {
        private Map<Long, Long> winnerCounts;
        private Map<Long, Long> workhorseCounts;
        private Map<Long, Long> opportunityCounts;
        private Map<Long, Long> loserCounts;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendsAnalysis {
        private String revenueTrend; // UP, DOWN, STABLE
        private String profitTrend;
        private String popularityTrend;
        private BigDecimal revenueChangePct;
        private BigDecimal profitChangePct;
    }
}
