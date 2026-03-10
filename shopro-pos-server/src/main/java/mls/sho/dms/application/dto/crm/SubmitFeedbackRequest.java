package mls.sho.dms.application.dto.crm;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import mls.sho.dms.entity.crm.FeedbackSource;

import java.util.UUID;

public record SubmitFeedbackRequest(
        @NotNull(message = "Customer ID is required")
        UUID customerId,
        String orderId,
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must not exceed 5")
        int rating,
        String comments,
        @NotNull(message = "Feedback source is required")
        FeedbackSource source
) {}
