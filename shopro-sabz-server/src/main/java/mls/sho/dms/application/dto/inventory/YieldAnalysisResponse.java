package mls.sho.dms.application.dto.inventory;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record YieldAnalysisResponse(
    List<IngredientYieldMetric> metrics,
    SummaryVariance summary
) {
    public record IngredientYieldMetric(
        UUID ingredientId,
        String ingredientName,
        BigDecimal theoreticalUsage,
        BigDecimal actualUsage,
        BigDecimal varianceUsage,
        BigDecimal variancePct,
        BigDecimal theoreticalCost,
        BigDecimal actualCost,
        BigDecimal varianceCost,
        BigDecimal currentYieldPct,
        BigDecimal targetYieldPct
    ) {}

    public record SummaryVariance(
        BigDecimal totalTheoreticalCost,
        BigDecimal totalActualCost,
        BigDecimal totalVarianceCost,
        BigDecimal netVariancePct
    ) {}
}
