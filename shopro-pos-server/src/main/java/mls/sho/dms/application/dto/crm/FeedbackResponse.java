package mls.sho.dms.application.dto.crm;

import mls.sho.dms.entity.crm.FeedbackSource;
import mls.sho.dms.entity.crm.Sentiment;

import java.time.OffsetDateTime;
import java.util.UUID;

public record FeedbackResponse(
        UUID id,
        UUID customerId,
        String customerName,
        String orderId,
        int rating,
        String comments,
        Sentiment sentiment,
        FeedbackSource source,
        OffsetDateTime createdAt
) {}
