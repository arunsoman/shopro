package mls.sho.dms.application.dto.inventory;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CreateBidRequest(
    @NotEmpty List<BidLineItemRequest> items,
    @NotEmpty List<UUID> supplierIds,
    @NotNull Instant bidDeadline
) {}
