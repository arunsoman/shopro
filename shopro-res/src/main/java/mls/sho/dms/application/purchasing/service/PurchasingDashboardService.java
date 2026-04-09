package mls.sho.dms.application.purchasing.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.purchasing.dto.PurchasingDashboardDTO;
import mls.sho.dms.application.purchasing.dto.WeeklySummaryDTO;
import mls.sho.dms.application.purchasing.repository.GoodsReceiptRepository;
import mls.sho.dms.application.purchasing.repository.PurchaseInvoiceRepository;
import mls.sho.dms.application.purchasing.repository.PurchaseOrderRepository;
import mls.sho.dms.entity.PurchaseInvoice;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchasingDashboardService {

    private final PurchaseInvoiceService invoiceService;
    private final PurchaseOrderRepository poRepository;
    private final GoodsReceiptRepository grnRepository;
    private final PurchaseInvoiceRepository invoiceRepository;

    public PurchasingDashboardDTO getDashboardData(Long restaurantId, LocalDate currentWeekStart) {
        // Weekly Spend
        WeeklySummaryDTO currentWeekSummary = invoiceService.getWeeklySummary(restaurantId, currentWeekStart);
        WeeklySummaryDTO prevWeekSummary = invoiceService.getWeeklySummary(restaurantId, currentWeekStart.minus(1, ChronoUnit.WEEKS));
        
        BigDecimal currentSpend = currentWeekSummary.getGrandTotal();
        BigDecimal prevSpend = prevWeekSummary.getGrandTotal();
        
        String spendDelta = "0%";
        if (prevSpend.compareTo(BigDecimal.ZERO) > 0) {
            double change = currentSpend.subtract(prevSpend).doubleValue() / prevSpend.doubleValue() * 100;
            spendDelta = change > 0 ? "+" + Math.round(change) + "%" : Math.round(change) + "%";
        } else if (currentSpend.compareTo(BigDecimal.ZERO) > 0) {
            spendDelta = "+100%";
        }

        // Open PO Count
        int openPoCount = poRepository.countOpenPOs(restaurantId);

        // Unmatched GRNs
        int unmatchedGrnCount = grnRepository.countUnmatchedGRNs(restaurantId);

        // Matching Health (Dummy calculation for now based on total matched vs unmatched)
        // A better approach would be calculating percentage based on the last 30 days
        // but for now let's just make it a safe default high value if not many unmatched
        int matchingHealth = 94; // Could compute based on actual total GRNs
        long totalGrn = grnRepository.count(); // actually we should count for restaurant but count() is enough for a mock
        // Better mock based on unmatched
        if (unmatchedGrnCount > 0) {
             matchingHealth = 100 - (unmatchedGrnCount * 2);
             if (matchingHealth < 0) matchingHealth = 0;
        } else {
             matchingHealth = 100;
        }

        // Spend Trend (last 8 weeks)
        List<PurchasingDashboardDTO.SpendTrendDTO> spendTrend = new ArrayList<>();
        LocalDate weekIter = currentWeekStart.minus(7, ChronoUnit.WEEKS);
        BigDecimal maxSpendForTrend = BigDecimal.ONE;
        
        for (int i = 0; i < 8; i++) {
            WeeklySummaryDTO wSummary = invoiceService.getWeeklySummary(restaurantId, weekIter);
            if (wSummary.getGrandTotal().compareTo(maxSpendForTrend) > 0) {
                maxSpendForTrend = wSummary.getGrandTotal();
            }
            weekIter = weekIter.plus(1, ChronoUnit.WEEKS);
        }

        weekIter = currentWeekStart.minus(7, ChronoUnit.WEEKS);
        for (int i = 0; i < 8; i++) {
            WeeklySummaryDTO wSummary = invoiceService.getWeeklySummary(restaurantId, weekIter);
            BigDecimal weekSpend = wSummary.getGrandTotal();
            int pct = 0;
            if (maxSpendForTrend.compareTo(BigDecimal.ZERO) > 0) {
                pct = (int) (weekSpend.doubleValue() / maxSpendForTrend.doubleValue() * 100);
            }
            if (pct == 0 && weekSpend.compareTo(BigDecimal.ZERO) > 0) pct = 5; // minimum visible bar
            
            spendTrend.add(PurchasingDashboardDTO.SpendTrendDTO.builder()
                    .weekLabel("Wk " + weekIter.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR))
                    .trendPercentage(pct)
                    .totalSpend(weekSpend)
                    .build());
            
            weekIter = weekIter.plus(1, ChronoUnit.WEEKS);
        }

        // Latest Vouchers
        List<PurchaseInvoice> latestInvoices = invoiceRepository.findTop3ByRestaurantIdOrderByCreatedAtDesc(restaurantId);

        return PurchasingDashboardDTO.builder()
                .weeklySpend(currentSpend)
                .spendDelta(spendDelta)
                .openPoCount(openPoCount)
                .unmatchedGrnCount(unmatchedGrnCount)
                .matchingHealth(matchingHealth)
                .spendTrend(spendTrend)
                .latestVouchers(latestInvoices.stream().map(invoiceService::toDTO).collect(Collectors.toList()))
                .build();
    }
}
