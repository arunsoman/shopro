package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for review reminders.
 * 
 * OUTPUT: GET /reviews/reminders
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderResponse {
    
    /**
     * Type of reminder.
     */
    private String type;
    
    /**
     * Reminder title.
     */
    private String title;
    
    /**
     * Detailed description.
     */
    private String description;
    
    /**
     * Due date.
     */
    private String dueDate;
    
    /**
     * Priority: LOW, MEDIUM, HIGH, CRITICAL.
     */
    private String priority;
    
    /**
     * URL to take action.
     */
    private String actionUrl;
    
    /**
     * Count (for batch reminders).
     */
    private Integer count;
}
