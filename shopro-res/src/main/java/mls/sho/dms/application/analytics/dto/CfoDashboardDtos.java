package mls.sho.dms.application.analytics.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CfoDashboardDtos {

    @Data
    public static class CfoDashboardSnapshotDto {
        private ExecutivePulseDto pulse;
        private List<StationVarianceDto> varianceByStation;
        private List<MenuMatrixItemDto> menuMatrix;
        private LaborProductivityDto labor;
        private InventoryEfficiencyDto inventory;
        private List<AnomalyReportDto> anomalies;
        private StrategicDto strategic;
    }

    @Data
    public static class ExecutivePulseDto {
        private BigDecimal primeCostPctActual;
        private BigDecimal primeCostPctTarget;
        private BigDecimal cashPosition;
        private BigDecimal breakEvenCoversNeeded;
        private BigDecimal netProfitYesterday;
        private BigDecimal netProfitSameDayLastWeek;
        private List<BigDecimal> primeCostTrend;
        private List<BigDecimal> cashFlowTrend;
    }

    @Data
    public static class StationVarianceDto {
        private String stationName;
        private BigDecimal theoreticalCost;
        private BigDecimal actualCost;
        private BigDecimal variancePct;
    }

    @Data
    public static class MenuMatrixItemDto {
        private String itemName;
        private String category; // STAR, PLOWHORSE, PUZZLE, DOG
        private BigDecimal popularity; // percentage of volume
        private BigDecimal margin;
        private int salesCount;
    }

    @Data
    public static class LaborProductivityDto {
        private BigDecimal laborCostPct;
        private BigDecimal salesPerLaborHour;
        private int overtimeRiskCount;
        private BigDecimal scheduleAdherencePct;
    }

    @Data
    public static class InventoryEfficiencyDto {
        private BigDecimal turnoverDays;
        private BigDecimal deadStockValue;
        private BigDecimal openPoCommitments;
        private int priceShockCount; // Ingredients with >5% spike
    }

    @Data
    public static class AnomalyReportDto {
        private String type; // VOID, COMP, DISCOUNT
        private String description;
        private BigDecimal amount;
        private String staffName;
    }

    @Data
    public static class StrategicDto {
        private List<CapexOpportunityDto> capexPipeline;
        private List<ScenarioImpactDto> scenarioModeling;
        private List<YieldDriftDto> yieldIntelligence;
    }

    @Data
    public static class CapexOpportunityDto {
        private String item;
        private BigDecimal cost;
        private String roi;
        private String status;
    }

    @Data
    public static class ScenarioImpactDto {
        private String scenario;
        private String impactLabel;
        private BigDecimal impactValue;
    }

    @Data
    public static class YieldDriftDto {
        private String itemName;
        private String status;
        private String detail;
        private BigDecimal costImpact;
    }
}
