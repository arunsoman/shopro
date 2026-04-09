package mls.sho.dms.application.primecost.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class PrimeCostDtos {

    @Data public static class LivePrimeCostDto {
        private Long restaurantId;
        private BigDecimal grossSalesToDate;
        private BigDecimal theoreticalCosToDate;
        private BigDecimal postedPurchasesThisWeek;
        private BigDecimal laborAccrualToDate;
        private BigDecimal primeCostPct;
    }

    @Data public static class ShrinkageDto {
        private LocalDate from;
        private LocalDate to;
        private BigDecimal actualCos;
        private BigDecimal theoreticalCos;
        private BigDecimal shrinkageVariance;
        private BigDecimal shrinkageVariancePct;
    }

    @Data public static class PrimeCostReportDto {
        private Long id;
        private Long restaurantId;
        private LocalDate weekStartDate;
        private BigDecimal netSales;
        private BigDecimal actualFoodCos;
        private BigDecimal actualBevCos;
        private BigDecimal theoreticalCos;
        private BigDecimal hourlyLabor;
        private BigDecimal mgmtLabor;
        private BigDecimal primeCostGross;
        private BigDecimal primeCostGrossPct;
        private String status;
        
        // Extended KPIs for Dashboard
        private BigDecimal shrinkageVariance;
        private BigDecimal shrinkageVariancePct;
        private BigDecimal laborCostPerCover;
        private BigDecimal salesPerLaborHour;
        private BigDecimal totalLaborHours;
    }

    @Data public static class PrimeCostTrendPointDto {
        private LocalDate weekStartDate;
        private BigDecimal primeCostPct;
        private BigDecimal sales;
    }

    @Data public static class BudgetVsActualDto {
        private LocalDate weekStartDate;
        private List<VarianceLineDto> variances;
        private BigDecimal overallVariance;
    }

    @Data public static class VarianceLineDto {
        private String category;
        private BigDecimal budgetAmount;
        private BigDecimal actualAmount;
        private BigDecimal varianceAmount;
        private BigDecimal variancePct;
        private boolean favorable;
    }

    @Data public static class VarianceAttributionDto {
        private LocalDate weekStartDate;
        private BigDecimal priceVariance;
        private BigDecimal volumeMixVariance;
        private BigDecimal portionVariance;
        private BigDecimal laborVariance;
        private String summary;
    }

    @Data public static class PrimeCostForecastDto {
        private LocalDate weekStartDate;
        private BigDecimal currentPrimeCostPct;
        private BigDecimal forecastedPrimeCostPct;
        private String message;
    }

    @Data public static class MultiLocationPrimeCostDto {
        private LocalDate weekStartDate;
        private List<LocationPrimeCostDto> locations;
        private BigDecimal aggregatePrimeCostPct;
    }

    @Data public static class LocationPrimeCostDto {
        private Long restaurantId;
        private String restaurantName;
        private BigDecimal primeCostPct;
    }
}
