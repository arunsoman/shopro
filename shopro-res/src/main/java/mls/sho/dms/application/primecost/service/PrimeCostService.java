package mls.sho.dms.application.primecost.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.primecost.entity.*;
import mls.sho.dms.application.primecost.repository.*;
import mls.sho.dms.application.primecost.dto.PrimeCostDtos.*;
import mls.sho.dms.application.primecost.dto.LaborDtos.LaborWeekSummaryDto;
import mls.sho.dms.application.pos.repository.OrderRepository;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.purchasing.repository.PurchaseInvoiceRepository;
import mls.sho.dms.application.inventory.service.InventoryIntelligenceService;
import mls.sho.dms.application.inventory.repository.InventoryLedgerRepository;
import mls.sho.dms.entity.Order;
import mls.sho.dms.entity.OrderLine;
import mls.sho.dms.entity.PurchaseInvoice;
import mls.sho.dms.entity.PurchaseOrderLine;
import mls.sho.dms.common.enums.StockMovementType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PrimeCostService {

    private final OrderRepository orderRepository;
    private final PurchaseInvoiceRepository invoiceRepository;
    private final InventoryLedgerRepository ledgerRepository;
    private final InventoryIntelligenceService inventoryService;
    private final WeeklyBudgetRepository budgetRepository;
    private final PrimeCostReportRepository reportRepository;
    private final DailySalesEntryRepository salesEntryRepository;
    private final RestaurantRepository restaurantRepository;
    private final LaborService laborService;

    @Transactional(readOnly = true)
    public LivePrimeCostDto getLivePrimeCost(Long restaurantId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() % 7); // assuming Sun/Mon start
        
        BigDecimal grossSales = computeGrossSales(restaurantId, weekStart, today);
        BigDecimal theoreticalCos = computeTheoreticalCos(restaurantId, weekStart, today);
        BigDecimal purchases = computePurchases(restaurantId, weekStart, today);
        
        LaborWeekSummaryDto laborSummary = laborService.getWeeklySummary(restaurantId, weekStart);
        BigDecimal laborCost = laborSummary.getTotalLaborCost();
        
        BigDecimal totalCost = theoreticalCos.add(purchases).add(laborCost);
        BigDecimal pct = (grossSales.compareTo(BigDecimal.ZERO) > 0) 
            ? totalCost.divide(grossSales, 4, RoundingMode.HALF_UP) 
            : BigDecimal.ZERO;

        LivePrimeCostDto dto = new LivePrimeCostDto();
        dto.setRestaurantId(restaurantId);
        dto.setGrossSalesToDate(grossSales);
        dto.setTheoreticalCosToDate(theoreticalCos);
        dto.setPostedPurchasesThisWeek(purchases);
        dto.setLaborAccrualToDate(laborCost);
        dto.setPrimeCostPct(pct);
        return dto;
    }

    @Transactional(readOnly = true)
    public BigDecimal computeTheoreticalCos(Long restaurantId, LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(23, 59, 59);
        
        List<Order> orders = orderRepository.findAllByRestaurantIdAndCreatedAtBetween(restaurantId, start, end);
        
        return orders.stream()
            .flatMap(o -> o.getLines().stream())
            .map(line -> {
                BigDecimal unitCost = line.getMenuItem().getPlateCost() != null ? line.getMenuItem().getPlateCost() : BigDecimal.ZERO;
                return unitCost.multiply(BigDecimal.valueOf(line.getQuantity()));
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public BigDecimal computeActualCos(Long restaurantId, LocalDate from, LocalDate to) {
        // In a Perpetual system, Actual COS = sum of all consumption movements (Sales, Misfire, Waste)
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(23, 59, 59);

        List<StockMovementType> consumptionTypes = List.of(
            StockMovementType.DEPLETION, 
            StockMovementType.MISFIRE, 
            StockMovementType.DISCARD
        );

        BigDecimal cos = ledgerRepository.sumValueByDateAndTypes(restaurantId, start, end, consumptionTypes);
        return cos != null ? cos : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public ShrinkageDto computeShrinkage(Long restaurantId, LocalDate from, LocalDate to) {
        BigDecimal actual = computeActualCos(restaurantId, from, to);
        BigDecimal theoretical = computeTheoreticalCos(restaurantId, from, to);
        BigDecimal variance = actual.subtract(theoretical);
        
        ShrinkageDto dto = new ShrinkageDto();
        dto.setFrom(from);
        dto.setTo(to);
        dto.setActualCos(actual);
        dto.setTheoreticalCos(theoretical);
        dto.setShrinkageVariance(variance);
        dto.setShrinkageVariancePct(theoretical.compareTo(BigDecimal.ZERO) != 0 
            ? variance.divide(theoretical, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        return dto;
    }

    @Transactional(readOnly = true)
    public PrimeCostReportDto getWeeklyReport(Long restaurantId, LocalDate weekStart) {
        Optional<PrimeCostReport> existing = reportRepository.findByRestaurantIdAndWeekStartDate(restaurantId, weekStart);
        if (existing.isPresent()) {
            return mapToReportDto(existing.get());
        }
        
        // Build DRAFT report from live data
        LocalDate weekEnd = weekStart.plusDays(6);
        BigDecimal sales = computeGrossSales(restaurantId, weekStart, weekEnd);
        BigDecimal theoretical = computeTheoreticalCos(restaurantId, weekStart, weekEnd);
        BigDecimal actualCos = computeActualCos(restaurantId, weekStart, weekEnd);
        
        LaborWeekSummaryDto labor = laborService.getWeeklySummary(restaurantId, weekStart);
        BigDecimal hourlyLabor = labor.getTotalHourlyLaborCost() != null ? labor.getTotalHourlyLaborCost() : BigDecimal.ZERO;
        BigDecimal mgmtLabor = labor.getTotalManagementLaborCost() != null ? labor.getTotalManagementLaborCost() : BigDecimal.ZERO;
        BigDecimal totalLabor = labor.getTotalLaborCost() != null ? labor.getTotalLaborCost() : BigDecimal.ZERO;
        
        PrimeCostReportDto dto = new PrimeCostReportDto();
        dto.setRestaurantId(restaurantId);
        dto.setWeekStartDate(weekStart);
        dto.setNetSales(sales != null ? sales : BigDecimal.ZERO);
        dto.setActualFoodCos(actualCos != null ? actualCos : BigDecimal.ZERO);
        dto.setTheoreticalCos(theoretical != null ? theoretical : BigDecimal.ZERO);
        dto.setHourlyLabor(hourlyLabor);
        dto.setMgmtLabor(mgmtLabor);
        
        BigDecimal totalPrimeCost = (actualCos != null ? actualCos : BigDecimal.ZERO).add(totalLabor);
        dto.setPrimeCostGross(totalPrimeCost);
        dto.setPrimeCostGrossPct((sales != null && sales.compareTo(BigDecimal.ZERO) > 0) 
            ? totalPrimeCost.divide(sales, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        dto.setStatus("DRAFT");
        
        // Populate KPIs
        LocalDateTime start = weekStart.atStartOfDay();
        LocalDateTime end = weekEnd.atTime(23, 59, 59);
        Integer covers = orderRepository.sumCoversBetween(restaurantId, start, end);
        BigDecimal decimalCovers = BigDecimal.valueOf(covers != null && covers > 0 ? covers : 1); // Avoid div by zero

        dto.setShrinkageVariance(actualCos.subtract(theoretical));
        dto.setShrinkageVariancePct(theoretical.compareTo(BigDecimal.ZERO) > 0 
            ? dto.getShrinkageVariance().divide(theoretical, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        
        dto.setLaborCostPerCover(labor.getTotalLaborCost().divide(decimalCovers, 2, RoundingMode.HALF_UP));
        
        BigDecimal totalHoursVal = labor.getTotalHours() != null && labor.getTotalHours().compareTo(BigDecimal.ZERO) > 0 
            ? labor.getTotalHours() : BigDecimal.ONE;
        dto.setSalesPerLaborHour(sales.divide(totalHoursVal, 2, RoundingMode.HALF_UP));
        dto.setTotalLaborHours(labor.getTotalHours());

        return dto;
    }

    @Transactional
    public PrimeCostReport finaliseWeeklyReport(Long restaurantId, LocalDate weekStart) {
        PrimeCostReportDto dto = getWeeklyReport(restaurantId, weekStart);
        
        PrimeCostReport report = reportRepository.findByRestaurantIdAndWeekStartDate(restaurantId, weekStart)
                .orElse(new PrimeCostReport());
        
        report.setRestaurant(restaurantRepository.findById(restaurantId).orElseThrow(() -> new RuntimeException("Restaurant not found")));
        
        report.setWeekStartDate(weekStart);
        report.setNetSales(dto.getNetSales());
        report.setActualFoodCos(dto.getActualFoodCos());
        report.setTheoreticalCos(dto.getTheoreticalCos());
        report.setHourlyLabor(dto.getHourlyLabor());
        report.setMgmtLabor(dto.getMgmtLabor());
        report.setPrimeCostGross(dto.getPrimeCostGross());
        report.setPrimeCostGrossPct(dto.getPrimeCostGrossPct());
        report.setStatus(PrimeCostReport.ReportStatus.FINALISED);
        
        return reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public PrimeCostForecastDto getForecast(Long restaurantId, LocalDate weekStart) {
        List<PrimeCostReport> history = reportRepository.findAllByRestaurantIdOrderByWeekStartDateDesc(restaurantId);
        
        BigDecimal avgPct = history.stream()
                .limit(4)
                .map(PrimeCostReport::getPrimeCostGrossPct)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (!history.isEmpty()) {
            avgPct = avgPct.divide(BigDecimal.valueOf(Math.min(history.size(), 4)), 4, RoundingMode.HALF_UP);
        } else {
            avgPct = new BigDecimal("0.65"); // Default industry benchmark
        }

        Optional<WeeklyBudget> budgetOpt = budgetRepository.findByRestaurantIdAndWeekStartDate(restaurantId, weekStart);
        BigDecimal targetPct = budgetOpt.map(b -> 
            b.getFoodCosPctTarget().add(b.getBevCosPctTarget())
            .add(b.getHourlyLaborPctTarget()).add(b.getMgmtLaborPctTarget())
        ).orElse(new BigDecimal("0.60"));

        PrimeCostForecastDto dto = new PrimeCostForecastDto();
        dto.setWeekStartDate(weekStart);
        dto.setCurrentPrimeCostPct(avgPct);
        dto.setForecastedPrimeCostPct(targetPct);
        dto.setMessage(avgPct.compareTo(targetPct) > 0 
            ? "Forecasted to exceed budget. Consider labor optimization." 
            : "On track to meet prime cost targets.");
        
        return dto;
    }

    @Transactional(readOnly = true)
    public BudgetVsActualDto getBudgetVsActual(Long restaurantId, LocalDate weekStart) {
        PrimeCostReportDto actual = getWeeklyReport(restaurantId, weekStart);
        Optional<WeeklyBudget> budgetOpt = budgetRepository.findByRestaurantIdAndWeekStartDate(restaurantId, weekStart);
        
        BudgetVsActualDto dto = new BudgetVsActualDto();
        dto.setWeekStartDate(weekStart);
        List<VarianceLineDto> variances = new ArrayList<>();
        
        if (budgetOpt.isPresent()) {
            WeeklyBudget budget = budgetOpt.get();
            BigDecimal sales = budget.getTotalSalesForecast() != null ? budget.getTotalSalesForecast() : BigDecimal.ZERO;
            
            BigDecimal foodBudget = sales.multiply(budget.getFoodCosPctTarget() != null ? budget.getFoodCosPctTarget() : BigDecimal.ZERO);
            BigDecimal laborBudget = sales.multiply(
                (budget.getHourlyLaborPctTarget() != null ? budget.getHourlyLaborPctTarget() : BigDecimal.ZERO)
                .add(budget.getMgmtLaborPctTarget() != null ? budget.getMgmtLaborPctTarget() : BigDecimal.ZERO)
            );

            variances.add(createVarianceLine("Food COS", foodBudget, actual.getActualFoodCos()));
            variances.add(createVarianceLine("Labor", laborBudget, actual.getPrimeCostGross().subtract(actual.getActualFoodCos())));
            
            BigDecimal totalBudget = foodBudget.add(laborBudget);
            dto.setOverallVariance(actual.getPrimeCostGross().subtract(totalBudget));
        } else {
            dto.setOverallVariance(BigDecimal.ZERO);
        }
        
        dto.setVariances(variances);
        return dto;
    }

    @Transactional(readOnly = true)
    public VarianceAttributionDto getVarianceAttribution(Long restaurantId, LocalDate weekStart) {
        // Simplified attribution logic for demo/initial implementation
        PrimeCostReportDto report = getWeeklyReport(restaurantId, weekStart);
        BigDecimal theoretical = report.getTheoreticalCos();
        BigDecimal actual = report.getActualFoodCos();
        BigDecimal variance = actual.subtract(theoretical);

        VarianceAttributionDto dto = new VarianceAttributionDto();
        dto.setWeekStartDate(weekStart);
        dto.setPriceVariance(variance.multiply(new BigDecimal("0.4"))); // Assume 40% due to price
        dto.setVolumeMixVariance(variance.multiply(new BigDecimal("0.3"))); // 30% volume
        dto.setPortionVariance(variance.multiply(new BigDecimal("0.3"))); // 30% waste/portions
        dto.setLaborVariance(BigDecimal.ZERO);
        dto.setSummary("Variance primarily driven by ingredient price fluctuations.");
        
        return dto;
    }

    @Transactional(readOnly = true)
    public List<PrimeCostTrendPointDto> getDailyPrimeCostTrend(Long restaurantId, int days) {
        List<PrimeCostTrendPointDto> points = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            BigDecimal sales = computeGrossSales(restaurantId, date, date);
            BigDecimal theoretical = computeTheoreticalCos(restaurantId, date, date);
            
            // Daily labor cost
            LaborWeekSummaryDto labor = laborService.getWeeklySummary(restaurantId, date.minusDays(date.getDayOfWeek().getValue() % 7));
            // Find employee record for that day
            int dayIndex = date.getDayOfWeek().getValue() % 7;
            BigDecimal dayLabor = labor.getStaffList().stream()
                .filter(e -> e.getDailyCosts() != null && e.getDailyCosts().size() > dayIndex)
                .map(e -> e.getDailyCosts().get(dayIndex))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal primeCost = theoretical.add(dayLabor);
            BigDecimal pct = (sales.compareTo(BigDecimal.ZERO) > 0) 
                ? primeCost.divide(sales, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            
            PrimeCostTrendPointDto p = new PrimeCostTrendPointDto();
            p.setWeekStartDate(date);
            p.setPrimeCostPct(pct);
            p.setSales(sales);
            points.add(p);
        }
        return points;
    }

    @Transactional(readOnly = true)
    public List<PrimeCostTrendPointDto> getPrimeCostTrend(Long restaurantId, int weeks) {
        List<PrimeCostReport> reports = reportRepository.findAllByRestaurantIdOrderByWeekStartDateDesc(restaurantId);
        
        return reports.stream()
                .limit(weeks)
                .map(r -> {
                    PrimeCostTrendPointDto p = new PrimeCostTrendPointDto();
                    p.setWeekStartDate(r.getWeekStartDate());
                    p.setPrimeCostPct(r.getPrimeCostGrossPct());
                    p.setSales(r.getNetSales());
                    return p;
                })
                .toList();
    }

    private VarianceLineDto createVarianceLine(String category, BigDecimal budget, BigDecimal actual) {
        VarianceLineDto v = new VarianceLineDto();
        v.setCategory(category);
        v.setBudgetAmount(budget);
        v.setActualAmount(actual);
        v.setVarianceAmount(actual.subtract(budget));
        v.setVariancePct(budget.compareTo(BigDecimal.ZERO) > 0 
            ? v.getVarianceAmount().divide(budget, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        v.setFavorable(v.getVarianceAmount().compareTo(BigDecimal.ZERO) <= 0);
        return v;
    }

    // -- Private Helpers ---------------------------------------

    private BigDecimal computeGrossSales(Long restaurantId, LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(23, 59, 59);
        List<Order> orders = orderRepository.findAllByRestaurantIdAndCreatedAtBetween(restaurantId, start, end);
        return orders.stream()
                .map(Order::getTotalAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal computePurchases(Long restaurantId, LocalDate from, LocalDate to) {
        List<PurchaseInvoice> invoices = invoiceRepository.findAllByRestaurantIdAndInvoiceDateBetween(restaurantId, from, to);
        return invoices.stream()
                .filter(i -> i.getStatus() == PurchaseInvoice.InvoiceStatus.POSTED)
                .flatMap(i -> i.getLines().stream())
                .map(line -> {
                    BigDecimal qty = line.getReceivedQty() != null ? line.getReceivedQty() : BigDecimal.ZERO;
                    BigDecimal price = line.getUnitPrice() != null ? line.getUnitPrice() : BigDecimal.ZERO;
                    return qty.multiply(price);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal computeInventoryValue(Long restaurantId) {
        // Current value of all stock in the kitchen
        BigDecimal val = ledgerRepository.sumValueByRestaurant(restaurantId);
        return val != null ? val : BigDecimal.ZERO;
    }

    private PrimeCostReportDto mapToReportDto(PrimeCostReport r) {
        PrimeCostReportDto dto = new PrimeCostReportDto();
        dto.setId(r.getId());
        dto.setRestaurantId(r.getRestaurant().getId());
        dto.setWeekStartDate(r.getWeekStartDate());
        dto.setNetSales(r.getNetSales());
        dto.setActualFoodCos(r.getActualFoodCos());
        dto.setTheoreticalCos(r.getTheoreticalCos());
        dto.setHourlyLabor(r.getHourlyLabor());
        dto.setMgmtLabor(r.getMgmtLabor());
        dto.setPrimeCostGross(r.getPrimeCostGross());
        dto.setPrimeCostGrossPct(r.getPrimeCostGrossPct());
        dto.setStatus(r.getStatus().name());
        
        // Re-calculate KPIs for historical reports
        BigDecimal shrinkage = nvl(r.getActualFoodCos()).subtract(nvl(r.getTheoreticalCos()));
        dto.setShrinkageVariance(shrinkage);
        dto.setShrinkageVariancePct(nvl(r.getTheoreticalCos()).compareTo(BigDecimal.ZERO) > 0
                ? shrinkage.divide(r.getTheoreticalCos(), 4, RoundingMode.HALF_UP) : BigDecimal.ZERO);

        // Fetch labor stats for historical mapping
        LaborWeekSummaryDto labor = laborService.getWeeklySummary(r.getRestaurant().getId(), r.getWeekStartDate());
        BigDecimal totalLabor = labor.getTotalLaborCost();
        BigDecimal totalHours = labor.getTotalHours();
        
        LocalDateTime start = r.getWeekStartDate().atStartOfDay();
        LocalDateTime end = r.getWeekStartDate().plusDays(6).atTime(23, 59, 59);
        Integer covers = orderRepository.sumCoversBetween(r.getRestaurant().getId(), start, end);
        BigDecimal cov = BigDecimal.valueOf(covers != null && covers > 0 ? covers : 1);

        dto.setLaborCostPerCover(totalLabor.divide(cov, 2, RoundingMode.HALF_UP));
        dto.setSalesPerLaborHour(nvl(r.getNetSales()).divide(totalHours.compareTo(BigDecimal.ZERO) > 0 ? totalHours : BigDecimal.ONE, 2, RoundingMode.HALF_UP));
        dto.setTotalLaborHours(totalHours);

        return dto;
    }

    private BigDecimal nvl(BigDecimal val) {
        return val == null ? BigDecimal.ZERO : val;
    }
}
