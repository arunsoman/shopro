package mls.sho.dms.dto.tableside;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MenuItemFeedbackRequest(
    @NotNull UUID menuItemId,
    String orderId,
    @Min(1) @Max(5) int rating,
    String comment
) {}
