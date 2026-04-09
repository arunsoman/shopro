package mls.sho.dms.application.purchasing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class PurchasingDashboardDTO {
    private BigDecimal weeklySpend;
    private String spendDelta;
    private int openPoCount;
    private int unmatchedGrnCount;
    private int matchingHealth;
    private List<SpendTrendDTO> spendTrend;
    private List<PurchaseInvoiceDTO> latestVouchers;

    @Data
    @Builder
    public static class SpendTrendDTO {
        private String weekLabel;
        private int trendPercentage;
        private BigDecimal totalSpend;
    }
}
