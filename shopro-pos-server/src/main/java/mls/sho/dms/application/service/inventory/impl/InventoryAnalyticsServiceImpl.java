package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.ShelfLifeAnalyticsResponse;
import mls.sho.dms.application.dto.inventory.YieldAnalysisResponse;
import mls.sho.dms.application.service.inventory.InventoryAnalyticsService;
import mls.sho.dms.entity.inventory.BatchStatus;
import mls.sho.dms.entity.inventory.InventoryBatch;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.repository.inventory.InventoryBatchRepository;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class InventoryAnalyticsServiceImpl implements InventoryAnalyticsService {

    private final InventoryBatchRepository batchRepository;
    private final RawIngredientRepository ingredientRepository;

    @Override
    public ShelfLifeAnalyticsResponse getShelfLifeAnalytics() {
        List<InventoryBatch> activeBatches = batchRepository.findAllByStatusOrderByExpiryDateAsc(BatchStatus.ACTIVE);
        Instant now = Instant.now();

        List<ShelfLifeAnalyticsResponse.ExpiringBatchInfo> critical = new ArrayList<>();
        List<ShelfLifeAnalyticsResponse.ExpiringBatchInfo> warning = new ArrayList<>();

        for (InventoryBatch batch : activeBatches) {
            if (batch.getExpiryDate() == null) continue;

            long daysRemaining = Duration.between(now, batch.getExpiryDate()).toDays();
            
            ShelfLifeAnalyticsResponse.ExpiringBatchInfo info = new ShelfLifeAnalyticsResponse.ExpiringBatchInfo(
                batch.getIngredient().getId(),
                batch.getIngredient().getName(),
                batch.getBatchNumber(),
                batch.getCurrentQuantity(),
                batch.getIngredient().getUnitOfMeasure(),
                batch.getExpiryDate(),
                daysRemaining,
                batch.getIngredient().getStorageType().name()
            );

            if (daysRemaining <= 2) {
                critical.add(info);
            } else if (daysRemaining <= 7) {
                warning.add(info);
            }
        }

        // Mock efficiency data for now, in production this would query transactions and historical usage
        ShelfLifeAnalyticsResponse.RotationEfficiency efficiency = new ShelfLifeAnalyticsResponse.RotationEfficiency(
            new BigDecimal("2.4"), // 2.4% waste rate
            new BigDecimal("78.5"), // 78.5% avg utilization
            activeBatches.size(),
            critical.size()
        );

        return new ShelfLifeAnalyticsResponse(
            critical,
            warning,
            efficiency,
            List.of(
                new ShelfLifeAnalyticsResponse.FreshnessMetric("Perishables", 12, 92.0),
                new ShelfLifeAnalyticsResponse.FreshnessMetric("Dry Goods", 45, 98.5),
                new ShelfLifeAnalyticsResponse.FreshnessMetric("Dairy", 8, 85.0)
            )
        );
    }

    @Override
    public YieldAnalysisResponse getYieldAnalysis() {
        List<RawIngredient> ingredients = ingredientRepository.findAll();
        List<YieldAnalysisResponse.IngredientYieldMetric> metrics = new ArrayList<>();

        BigDecimal totalTheoretical = BigDecimal.ZERO;
        BigDecimal totalActual = BigDecimal.ZERO;

        for (RawIngredient ingredient : ingredients) {
            // In a real system, you would calculate theoretical usage from sales data and recipes
            // and actual usage from inventory transactions (Stock Takes - Initial Stock - Receipts)
            
            // For now, we simulate variance data
            BigDecimal theoretical = ingredient.getCurrentStock().multiply(new BigDecimal("0.8")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal actual = ingredient.getCurrentStock().multiply(new BigDecimal("0.85")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal variance = actual.subtract(theoretical);
            BigDecimal variancePct = theoretical.compareTo(BigDecimal.ZERO) == 0 ? 
                BigDecimal.ZERO : variance.divide(theoretical, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));

            BigDecimal costPerUnit = ingredient.getCostPerUnit();
            BigDecimal theoreticalCost = theoretical.multiply(costPerUnit);
            BigDecimal actualCost = actual.multiply(costPerUnit);
            BigDecimal varianceCost = variance.multiply(costPerUnit);

            totalTheoretical = totalTheoretical.add(theoreticalCost);
            totalActual = totalActual.add(actualCost);

            metrics.add(new YieldAnalysisResponse.IngredientYieldMetric(
                ingredient.getId(),
                ingredient.getName(),
                theoretical,
                actual,
                variance,
                variancePct,
                theoreticalCost,
                actualCost,
                varianceCost,
                ingredient.getYieldPct(),
                new BigDecimal("95.0") // Target yield
            ));
        }

        BigDecimal totalVariance = totalActual.subtract(totalTheoretical);
        BigDecimal netVariancePct = totalTheoretical.compareTo(BigDecimal.ZERO) == 0 ?
            BigDecimal.ZERO : totalVariance.divide(totalTheoretical, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));

        return new YieldAnalysisResponse(
            metrics,
            new YieldAnalysisResponse.SummaryVariance(
                totalTheoretical,
                totalActual,
                totalVariance,
                netVariancePct
            )
        );
    }
}
