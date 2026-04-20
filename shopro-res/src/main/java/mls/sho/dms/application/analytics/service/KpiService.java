package mls.sho.dms.application.analytics.service;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.pos.repository.OrderRepository;
import mls.sho.dms.application.pos.repository.TableSessionRepository;
import mls.sho.dms.application.purchasing.repository.PurchaseInvoiceRepository;
import mls.sho.dms.application.primecost.entity.PrimeCostReport;
import mls.sho.dms.application.primecost.repository.PrimeCostReportRepository;
import mls.sho.dms.application.primecost.repository.WeeklyBudgetRepository;
import mls.sho.dms.application.primecost.service.PrimeCostService;
import mls.sho.dms.application.primecost.dto.PrimeCostDtos.PrimeCostReportDto;
import mls.sho.dms.application.pos.entity.Order;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KpiService {

    private final OrderRepository orderRepository;
    private final TableSessionRepository tableSessionRepository;
    private final mls.sho.dms.application.inventory.service.IngredientService ingredientService;
    private final PurchaseInvoiceRepository invoiceRepository;
    private final PrimeCostReportRepository reportRepository;
    private final WeeklyBudgetRepository budgetRepository;
    private final PrimeCostService primeCostService;

    @Data
    @Builder
    public static class KpiDashboard {
        private BigDecimal grossSalesToday;
        private Double grossSalesDelta;
        private Integer coversToday;
        private Double coversDelta;
        private BigDecimal checkAvgToday;
        private Double checkAvgDelta;
        private BigDecimal foodCostPctToday;
        private Double foodCostPctDelta;
        private Long openSessionsNow;
        private String topSellerToday;
        private Long lowStockCount;
        private Long draftInvoiceCount;
        private List<BigDecimal> primeCostTrend;
        private BigDecimal primeCostTarget;
    }

    public KpiDashboard getDashboardMetrics(Long restaurantId) {
        LocalDateTime startOfToday = LocalDateTime.now().with(LocalTime.MIN);
        
        KpiDashboard todayKpis = getTodayKpis(restaurantId);
        KpiDashboard yesterdayKpis = getYesterdayKpis(restaurantId);
        BigDecimal checkAvg = calculateCheckAverage(todayKpis);
        BigDecimal checkAvgYesterday = calculateCheckAverage(yesterdayKpis);

        return KpiDashboard.builder()
                .grossSalesToday(todayKpis.getGrossSalesToday())
                .grossSalesDelta(calculateDelta(todayKpis.getGrossSalesToday(), yesterdayKpis.getGrossSalesToday()))
                .coversToday(todayKpis.getCoversToday())
                .coversDelta(calculateDelta(BigDecimal.valueOf(todayKpis.getCoversToday()), BigDecimal.valueOf(yesterdayKpis.getCoversToday())))
                .checkAvgToday(checkAvg)
                .checkAvgDelta(calculateDelta(checkAvg, checkAvgYesterday))
                .foodCostPctToday(getLiveFoodCostPct(restaurantId))
                .foodCostPctDelta(0.5) // Standard delta for demo, can be expanded to historical COS comparison
                .openSessionsNow(tableSessionRepository.countActiveSessions(restaurantId))
                .topSellerToday(getTopSellerToday(restaurantId, startOfToday))
                .lowStockCount(ingredientService.getLowStockCount(restaurantId))
                .draftInvoiceCount(invoiceRepository.countDraftInvoices(restaurantId))
                .primeCostTrend(getPrimeCostTrend(restaurantId, 8))
                .primeCostTarget(getPrimeCostTarget(restaurantId))
                .build();
    }

    public KpiDashboard getYesterdayKpis(Long restaurantId) {
        LocalDateTime startOfYesterday = LocalDateTime.now().minusDays(1).with(LocalTime.MIN);
        LocalDateTime endOfYesterday = LocalDateTime.now().minusDays(1).with(LocalTime.MAX);
        BigDecimal sales = orderRepository.sumTotalSalesBetween(restaurantId, startOfYesterday, endOfYesterday);
        Integer covers = orderRepository.sumCoversBetween(restaurantId, startOfYesterday, endOfYesterday);
        
        return KpiDashboard.builder()
                .grossSalesToday(sales != null ? sales : BigDecimal.ZERO)
                .coversToday(covers != null ? covers : 0)
                .build();
    }

    public BigDecimal getPrimeCostTarget(Long restaurantId) {
        // Fetch budget for the current week (Monday-based)
        java.time.LocalDate monday = java.time.LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        return budgetRepository.findByRestaurantIdAndWeekStartDate(restaurantId, monday)
                .map(b -> b.getFoodCosPctTarget()
                    .add(b.getBevCosPctTarget() != null ? b.getBevCosPctTarget() : BigDecimal.ZERO)
                    .add(b.getMgmtLaborPctTarget() != null ? b.getMgmtLaborPctTarget() : BigDecimal.ZERO)
                    .add(b.getHourlyLaborPctTarget() != null ? b.getHourlyLaborPctTarget() : BigDecimal.ZERO))
                .orElse(new BigDecimal("0.60")); // Fallback target
    }

    private Double calculateDelta(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) return 0.0;
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    public KpiDashboard getTodayKpis(Long restaurantId) {
        LocalDateTime start = LocalDateTime.now().with(LocalTime.MIN);
        BigDecimal sales = orderRepository.sumTotalSalesAfter(restaurantId, start);
        Integer covers = orderRepository.sumCoversAfter(restaurantId, start);
        
        // Lookback Fallback: If no activity today, use the most recent day with sales
        if (sales == null || sales.compareTo(BigDecimal.ZERO) == 0) {
            LocalDateTime mostRecentOrderDate = orderRepository.findMaxCreatedAt(restaurantId);
            if (mostRecentOrderDate != null) {
                LocalDateTime recentStart = mostRecentOrderDate.with(LocalTime.MIN);
                LocalDateTime recentEnd = mostRecentOrderDate.with(LocalTime.MAX);
                sales = orderRepository.sumTotalSalesBetween(restaurantId, recentStart, recentEnd);
                covers = orderRepository.sumCoversBetween(restaurantId, recentStart, recentEnd);
            }
        }

        return KpiDashboard.builder()
                .grossSalesToday(sales != null ? sales : BigDecimal.ZERO)
                .coversToday(covers != null ? covers : 0)
                .build();
    }

    public BigDecimal getLiveFoodCostPct(Long restaurantId) {
        // Proxy: Use the theoretical cost % from the most recent finalised weekly report
        return reportRepository.findAllByRestaurantIdOrderByWeekStartDateDesc(restaurantId)
                .stream()
                .filter(r -> r.getStatus() == PrimeCostReport.ReportStatus.FINALISED)
                .findFirst()
                .map(PrimeCostReport::getTheoreticalCosPct)
                .orElse(new BigDecimal("0.28")); // Default fallback
    }

    public List<BigDecimal> getPrimeCostTrend(Long restaurantId, int weeks) {
        // 1. Try to fetch finalised reports
        List<BigDecimal> trend = reportRepository.findAllByRestaurantIdOrderByWeekStartDateDesc(restaurantId)
                .stream()
                .filter(r -> r.getStatus() == PrimeCostReport.ReportStatus.FINALISED)
                .limit(weeks)
                .map(PrimeCostReport::getPrimeCostGrossPct)
                .collect(Collectors.toList());
        
        if (trend.size() < 4) {
            // 2. If fewer than 4 finalised reports, backfill with "Live Draft" snapshots
            java.time.LocalDate monday = java.time.LocalDate.now().with(java.time.DayOfWeek.MONDAY);
            trend = new java.util.ArrayList<>();
            
            for (int i = 0; i < weeks; i++) {
                java.time.LocalDate weekStart = monday.minusWeeks(i);
                PrimeCostReportDto draft = primeCostService.getWeeklyReport(restaurantId, weekStart);
                trend.add(draft.getPrimeCostGrossPct());
            }
        }

        java.util.Collections.reverse(trend);
        return trend;
    }

    private BigDecimal calculateCheckAverage(KpiDashboard kpis) {
        if (kpis.getCoversToday() == 0) return BigDecimal.ZERO;
        return kpis.getGrossSalesToday().divide(BigDecimal.valueOf(kpis.getCoversToday()), 2, RoundingMode.HALF_UP);
    }

    private String getTopSellerToday(Long restaurantId, LocalDateTime start) {
        List<Order> orders = orderRepository.findAllPaidAfter(restaurantId, start);
        return orders.stream()
                .flatMap(o -> o.getLines().stream())
                .collect(Collectors.groupingBy(line -> line.getMenuItem().getName(), Collectors.summingInt(line -> 1)))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
    }
}
