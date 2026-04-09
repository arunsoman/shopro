package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.ShelfLifeAnalyticsResponse;
import mls.sho.dms.application.dto.inventory.YieldAnalysisResponse;

public interface InventoryAnalyticsService {
    ShelfLifeAnalyticsResponse getShelfLifeAnalytics();
    YieldAnalysisResponse getYieldAnalysis();
}
