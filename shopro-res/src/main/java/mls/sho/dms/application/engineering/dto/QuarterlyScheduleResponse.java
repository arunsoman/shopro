package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for quarterly review schedule.
 * 
 * OUTPUT: GET /reviews/quarterly
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuarterlyScheduleResponse {
    
    /**
     * Current quarter (e.g., "Q2 2026").
     */
    private String currentQuarter;
    
    /**
     * List of quarters with their date ranges.
     */
    private List<QuarterInfo> quarters;
    
    /**
     * Date of last analysis (if any).
     */
    private String lastAnalysisDate;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuarterInfo {
        /**
         * Quarter label (e.g., "Q1 2026").
         */
        private String quarter;
        
        /**
         * Quarter start date.
         */
        private String startDate;
        
        /**
         * Quarter end date.
         */
        private String endDate;
        
        /**
         * Whether this is the current quarter.
         */
        private Boolean isCurrent;
        
        /**
         * Whether this quarter is in the past.
         */
        private Boolean isPast;
    }
}
