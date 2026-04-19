package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Response DTO for matrix visualization data.
 * Returns items organized by WINNER/WORKHORSE/OPPORTUNITY/LOSER quadrants.
 * 
 * OUTPUT: GET /periods/{id}/visualization/matrix
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatrixVisualizationResponse {
    
    /**
     * Items organized by classification quadrant.
     */
    private Map<String, List<MatrixItem>> quadrants;
    
    /**
     * Totals per quadrant.
     */
    private Map<String, QuadrantTotals> totals;
    
    /**
     * Axis labels for visualization.
     */
    private AxisLabels axisLabels;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatrixItem {
        private Long itemId;
        private String itemName;
        private Integer quantitySold;
        private BigDecimal revenue;
        private BigDecimal contributionMargin;
        private BigDecimal foodCostPct;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuadrantTotals {
        private Integer count;
        private BigDecimal totalRevenue;
        private Integer totalSold;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AxisLabels {
        private String x;
        private String y;
    }
}
