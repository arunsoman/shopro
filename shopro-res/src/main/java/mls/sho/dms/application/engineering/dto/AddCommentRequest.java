package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for adding a comment to a recommendation.
 * 
 * INPUT: PATCH /recommendations/{id}/comment
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddCommentRequest {
    
    /**
     * Comment text.
     */
    private String comment;
}
