package mls.sho.dms.application.dto.crm;

import java.util.List;

public record FeedbackStatsResponse(
        Double averageRating,
        Long totalFeedbackCount,
        Long positiveCount,
        Long neutralCount,
        Long negativeCount,
        List<FeedbackResponse> recentFeedback
) {}
