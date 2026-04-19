package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Request DTO for updating a recommendation.
 * 
 * INPUT: PATCH /recommendations/{id}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRecommendationRequest {
    
    /**
     * New status for the recommendation.
     */
    private String status;
    
    /**
     * Priority level.
     */
    private String priority;
    
    /**
     * Team member assigned to this recommendation.
     */
    private String assignedTo;
    
    /**
     * Due date for implementation.
     */
    private LocalDateTime dueDate;
    
    /**
     * Comment on the recommendation.
     */
    private String comment;
    
    /**
     * Updated title.
     */
    private String title;
    
    /**
     * Updated description.
     */
    private String description;
    
    /**
     * Updated action plan.
     */
    private String actionPlan;
}
