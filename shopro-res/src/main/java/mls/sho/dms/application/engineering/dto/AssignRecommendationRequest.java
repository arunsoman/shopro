package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for assigning a recommendation.
 * 
 * INPUT: PATCH /recommendations/{id}/assign
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignRecommendationRequest {
    
    /**
     * Email or ID of the team member to assign.
     */
    private String assignedTo;
}
