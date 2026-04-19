package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for menu engineering period.
 * 
 * OUTPUT: POST /periods, GET /periods, GET /periods/{id}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodResponse {
    
    /**
     * Unique identifier for this period.
     */
    private Long id;
    
    /**
     * Name of this analysis period.
     */
    private String periodName;
    
    /**
     * Start date of the analysis period.
     */
    private LocalDate startDate;
    
    /**
     * End date of the analysis period.
     */
    private LocalDate endDate;
    
    /**
     * Status of the period: DRAFT, RUNNING, COMPLETE, FAILED
     */
    private String status;
    
    /**
     * When the analysis was run (null if not yet run).
     */
    private LocalDateTime runAt;
    
    /**
     * Total items analyzed in this period.
     */
    private Integer itemCount;
    
    /**
     * Total quantity sold in this period.
     */
    private Integer totalSold;
    
    /**
     * Total revenue in this period.
     */
    private java.math.BigDecimal totalRevenue;
    
    /**
     * Number of WINNER items.
     */
    private Integer winnerCount;
    
    /**
     * Number of WORKHORSE items.
     */
    private Integer workhorseCount;
    
    /**
     * Number of OPPORTUNITY items.
     */
    private Integer opportunityCount;
    
    /**
     * Number of LOSER items.
     */
    private Integer loserCount;
    
    /**
     * Description of the period.
     */
    private String description;
    
    /**
     * Tags associated with the period.
     */
    private java.util.List<String> tags;
}
