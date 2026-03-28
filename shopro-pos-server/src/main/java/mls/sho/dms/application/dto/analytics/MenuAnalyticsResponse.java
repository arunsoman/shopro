package mls.sho.dms.application.dto.analytics;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Overview statistics for the entire menu.
 */
public record MenuAnalyticsResponse(
    long totalCompletedOrders,
    long totalMenuItemsSold,
    BigDecimal totalMenuRevenue,
    BigDecimal averageTransactionValue,
    List<MenuItemPerformanceDTO> topPerformersByQuantity,
    List<MenuItemPerformanceDTO> topPerformersByRevenue,
    List<MenuItemPerformanceDTO> topPerformersByMargin,
    Map<String, Long> classificationCounts, // STAR: 5, etc.
    List<CategoryPerformanceDTO> categoryPerformance
) {
    public record CategoryPerformanceDTO(
        String categoryName,
        long quantitySold,
        BigDecimal revenue,
        BigDecimal averageMarginPct
    ) {}
}
