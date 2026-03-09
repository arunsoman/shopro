package mls.sho.dms.application.dto.crm;

import jakarta.validation.constraints.Min;
import java.util.UUID;

public record RedeemPointsRequest(
    @Min(value = 1, message = "Points to redeem must be at least 1")
    int pointsToRedeem,
    
    UUID orderTicketId
) {}
