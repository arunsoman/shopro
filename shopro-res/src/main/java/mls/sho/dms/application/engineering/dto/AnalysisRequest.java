package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for running menu engineering analysis.
 * 
 * INPUT: POST /analyze
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisRequest {
    
    /**
     * List of quantities sold for each menu item.
     * Must match the order of menu items returned by the system.
     */
    private java.util.List<Integer> quantitiesSold;
    
    /**
     * Optional: Popularity threshold factor (default 0.70).
     * Items selling above this percentage of average are considered "popular".
     */
    private BigDecimal popularityFactor;
    
    /**
     * Optional: Contribution margin threshold (default 2.00).
     * Minimum contribution margin for classification.
     */
    private BigDecimal minContributionMargin;
    
    /**
     * Optional: Food cost warning threshold percentage (default 35.0).
     */
    private BigDecimal foodCostWarningThreshold;
}
