package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mls.sho.dms.common.enums.MenuEngClassification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for menu engineering recommendations.
 * 
 * OUTPUT: All recommendation endpoints
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    
    /**
     * Unique identifier of the recommendation.
     */
    private UUID id;
    
    /**
     * Restaurant ID.
     */
    private Long restaurantId;
    
    /**
     * Associated menu item ID.
     */
    private Long menuItemId;
    
    /**
     * Menu item name.
     */
    private String menuItemName;
    
    /**
     * Period ID this recommendation belongs to.
     */
    private Long periodId;
    
    /**
     * Classification of the menu item.
     */
    private MenuEngClassification classification;
    
    /**
     * Type of recommendation.
     */
    private String recommendationType;
    
    /**
     * Current status of the recommendation.
     */
    private String status;
    
    /**
     * Priority level.
     */
    private String priority;
    
    /**
     * Title/summary of the recommendation.
     */
    private String title;
    
    /**
     * Detailed description of the recommendation.
     */
    private String description;
    
    /**
     * Action plan to implement the recommendation.
     */
    private String actionPlan;
    
    /**
     * Projected revenue impact.
     */
    private BigDecimal projectedImpactRevenue;
    
    /**
     * Projected profit impact.
     */
    private BigDecimal projectedImpactProfit;
    
    /**
     * Projected margin improvement %.
     */
    private BigDecimal projectedImpactMargin;
    
    /**
     * Estimated cost to implement.
     */
    private BigDecimal estimatedImplementationCost;
    
    /**
     * Team member assigned to this recommendation.
     */
    private String assignedTo;
    
    /**
     * Due date for implementation.
     */
    private LocalDateTime dueDate;
    
    /**
     * Comments on this recommendation.
     */
    private String comment;
    
    /**
     * When the recommendation was created.
     */
    private LocalDateTime createdAt;
    
    /**
     * When the recommendation was last updated.
     */
    private LocalDateTime updatedAt;
    
    /**
     * When the recommendation was completed.
     */
    private LocalDateTime completedAt;
    
    /**
     * Reason if dismissed.
     */
    private String dismissedReason;
    
    /**
     * Who approved/rejected this recommendation.
     */
    private String approvedBy;
    
    /**
     * When this recommendation was approved/rejected.
     */
    private LocalDateTime approvedAt;
    
    /**
     * Comment from approver.
     */
    private String approvalComment;
}
