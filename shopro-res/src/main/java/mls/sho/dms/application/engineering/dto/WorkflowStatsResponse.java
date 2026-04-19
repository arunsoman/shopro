package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Response DTO for workflow statistics.
 * 
 * OUTPUT: GET /recommendations/workflow/stats
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStatsResponse {
    
    /**
     * Total number of recommendations.
     */
    private Integer total;
    
    /**
     * Count by status.
     */
    private Map<String, Long> byStatus;
    
    /**
     * Count by priority.
     */
    private Map<String, Long> byPriority;
    
    /**
     * Number of overdue recommendations.
     */
    private Long overdueCount;
    
    /**
     * Number of recommendations pending approval.
     */
    private Long pendingApprovalCount;
    
    /**
     * Completion rate percentage.
     */
    private Double completionRate;
    
    /**
     * Average days to complete.
     */
    private Double avgDaysToComplete;
}
