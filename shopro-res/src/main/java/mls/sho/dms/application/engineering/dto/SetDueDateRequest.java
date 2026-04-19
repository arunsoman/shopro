package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Request DTO for setting due date on a recommendation.
 * 
 * INPUT: PATCH /recommendations/{id}/due-date
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetDueDateRequest {
    
    /**
     * Due date and time for the recommendation.
     * Format: YYYY-MM-DDTHH:MM:SS
     */
    private LocalDateTime dueDate;
}
