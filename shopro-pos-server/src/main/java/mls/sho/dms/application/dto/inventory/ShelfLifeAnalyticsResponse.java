package mls.sho.dms.application.dto.inventory;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ShelfLifeAnalyticsResponse(
    List<ExpiringBatchInfo> criticalBatches,
    List<ExpiringBatchInfo> warningBatches,
    RotationEfficiency efficiency,
    List<FreshnessMetric> freshnessByTag
) {
    public record ExpiringBatchInfo(
        UUID ingredientId,
        String ingredientName,
        String batchNumber,
        BigDecimal quantity,
        String unit,
        Instant expiryDate,
        long daysRemaining,
        String storageType
    ) {}

    public record RotationEfficiency(
        BigDecimal wasteRate,
        BigDecimal averageShelfLifeUtilization,
        int activeBatchesCount,
        int itemsAtRiskCount
    ) {}

    public record FreshnessMetric(
        String category,
        int count,
        double averageFreshnessPct
    ) {}
}
