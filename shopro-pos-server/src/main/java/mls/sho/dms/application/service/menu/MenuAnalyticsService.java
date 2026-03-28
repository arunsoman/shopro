package mls.sho.dms.application.service.menu;

import mls.sho.dms.application.dto.analytics.MenuAnalyticsResponse;

import java.time.Instant;

public interface MenuAnalyticsService {
    /**
     * Get menu overview analytics for the specified period.
     */
    MenuAnalyticsResponse getOverview(Instant from, Instant to);
}
