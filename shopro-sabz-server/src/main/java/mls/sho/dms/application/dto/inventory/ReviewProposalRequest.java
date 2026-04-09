package mls.sho.dms.application.dto.inventory;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewProposalRequest {
    @NotNull(message = "Status cannot be null")
    private String status; // ACCEPTED or REJECTED
    
    private String reason;
    
    @NotNull(message = "Staff ID cannot be null")
    private java.util.UUID staffId;
}
