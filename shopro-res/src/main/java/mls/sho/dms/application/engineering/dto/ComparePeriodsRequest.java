package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for comparing multiple periods.
 * 
 * INPUT: POST /periods/compare
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparePeriodsRequest {
    
    /**
     * List of period IDs to compare.
     * Minimum 2, maximum 4 periods recommended.
     */
    private List<Long> periodIds;
    
    /**
     * Optional: Metrics to compare.
     * Options: REVENUE, PROFIT, QUANTITY, CLASSIFICATION
     * Default: All
     */
    private List<String> metrics;
}
