package mls.sho.dms.application.dto.analytics;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Performance metrics for a single menu item.
 */
public record MenuItemPerformanceDTO(
    UUID menuItemId,
    String name,
    String categoryName,
    long totalQuantitySold,
    BigDecimal totalRevenue,
    BigDecimal unitPrice,
    BigDecimal theoreticalUnitCost,
    BigDecimal unitMargin,
    BigDecimal marginPercentage,
    String engineeringClassification // STAR, PLOWHORSE, PUZZLE, DOG
) {}
