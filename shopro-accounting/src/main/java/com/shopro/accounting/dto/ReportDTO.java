package com.shopro.accounting.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class ReportDTO {

    @Data
    @Builder
    public static class ProfitAndLoss {
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal totalRevenue;
        private BigDecimal totalCogs;
        private BigDecimal grossProfit;
        private BigDecimal totalOperatingExpenses;
        private BigDecimal netOperatingIncome;
        private List<PLLineItem> lineItems;
    }

    @Data
    @Builder
    public static class PLLineItem {
        private String accountName;
        private String accountCode;
        private BigDecimal amount;
        private boolean isHeader;
        private String category; // REVENUE, COGS, EXPENSE
    }

    @Data
    @Builder
    public static class BalanceSheet {
        private LocalDate asOfDate;
        private BigDecimal totalAssets;
        private BigDecimal totalLiabilities;
        private BigDecimal totalEquity;
        private List<BalanceItem> assets;
        private List<BalanceItem> liabilities;
        private List<BalanceItem> equity;
    }

    @Data
    @Builder
    public static class BalanceItem {
        private String accountName;
        private BigDecimal balance;
        private String group; // Current Asset, Fixed Asset, etc.
    }

    @Data
    @Builder
    public static class PrimeCostReport {
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal totalSales;
        private BigDecimal foodCost;
        private BigDecimal laborCost;
        private BigDecimal totalPrimeCost;
        private BigDecimal primeCostPercentage; // (COGS + Labor) / Sales
        private String status; // EXCELLENT, GOOD, WARNING, CRITICAL
    }

    @Data
    @Builder
    public static class SalesBreakdown {
        private Map<String, BigDecimal> revenueByCategory; // Food, Alcohol, etc.
        private Map<String, BigDecimal> revenueByChannel; // Dine-in, Takeout, etc.
        private BigDecimal averageCheck;
        private BigDecimal totalTransactions;
    }

    @Data
    @Builder
    public static class APAgingReport {
        private BigDecimal totalOwed;
        private List<AgingBucket> buckets;
    }

    @Data
    @Builder
    public static class AgingBucket {
        private String range; // 0-30, 31-60, 61-90, 90+
        private BigDecimal amount;
    }
}
