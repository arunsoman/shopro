package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for menu engineering settings.
 * 
 * OUTPUT: GET /settings
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingsResponse {
    
    /**
     * Restaurant ID these settings belong to.
     */
    private Long restaurantId;
    
    /**
     * Popularity threshold factor (0.0 - 1.0).
     */
    private BigDecimal popularityThresholdFactor;
    
    /**
     * Minimum contribution margin threshold.
     */
    private BigDecimal minContributionMargin;
    
    /**
     * Food cost warning threshold percentage.
     */
    private BigDecimal foodCostWarningThreshold;
    
    /**
     * Default daypart for analysis.
     */
    private String defaultDaypart;
    
    /**
     * Whether to auto-generate recommendations.
     */
    private Boolean autoGenerateRecommendations;
    
    /**
     * Number of days before due date to send reminders.
     */
    private Integer reminderDaysBefore;
    
    /**
     * When settings were last updated.
     */
    private LocalDateTime updatedAt;
}
