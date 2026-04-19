package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for approving or rejecting a recommendation.
 * 
 * INPUT: POST /recommendations/{id}/approve, POST /recommendations/{id}/reject
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequest {
    
    /**
     * ID/name of the person approving or rejecting.
     */
    private String approvedBy;
    
    /**
     * Comment from approver/rejecter.
     */
    private String comment;
    
    /**
     * Reason for rejection (only used when rejecting).
     */
    private String reason;
}
