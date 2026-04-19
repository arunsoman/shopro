package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO for creating a new menu engineering period.
 * 
 * INPUT: POST /periods
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePeriodRequest {
    
    /**
     * Name for this analysis period.
     * Example: "Q1 2026 Analysis", "Summer 2026", "Week 12"
     */
    private String periodName;
    
    /**
     * Start date for the analysis period (inclusive).
     * Format: YYYY-MM-DD
     */
    private LocalDate startDate;
    
    /**
     * End date for the analysis period (inclusive).
     * Format: YYYY-MM-DD
     */
    private LocalDate endDate;
    
    /**
     * Optional: Description for this period.
     */
    private String description;
    
    /**
     * Optional: Tags for categorization.
     */
    private java.util.List<String> tags;
}
