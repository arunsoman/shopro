package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for updating menu engineering settings.
 * 
 * INPUT: PUT /settings
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSettingsRequest {
    
    /**
     * Popularity threshold factor (0.0 - 1.0).
     * Items selling above this factor of average are "popular".
     * Default: 0.70 (70% of average)
     */
    private BigDecimal popularityThresholdFactor;
    
    /**
     * Minimum contribution margin threshold.
     * Default: 2.00
     */
    private BigDecimal minContributionMargin;
    
    /**
     * Food cost warning threshold percentage.
     * Items above this % will show warnings.
     * Default: 35.0
     */
    private BigDecimal foodCostWarningThreshold;
    
    /**
     * Default daypart for analysis.
     * Options: ALL, BREAKFAST, LUNCH, DINNER, LATE_NIGHT
     */
    private String defaultDaypart;
    
    /**
     * Whether to auto-generate recommendations after analysis.
     */
    private Boolean autoGenerateRecommendations;
    
    /**
     * Number of days before due date to send reminders.
     */
    private Integer reminderDaysBefore;
}
