package mls.sho.dms.application.analytics.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.analytics.dto.*;
import mls.sho.dms.entity.*;
import mls.sho.dms.application.inventory.repository.InventoryLedgerRepository;
import mls.sho.dms.application.inventory.repository.InventoryLedgerRepository.*;
import mls.sho.dms.application.pos.repository.DiningTableRepository;
import mls.sho.dms.application.pos.repository.MenuItemRepository;
import mls.sho.dms.application.pos.repository.OrderLineRepository;
import mls.sho.dms.application.pos.repository.TableSessionRepository;
import mls.sho.dms.application.users.repo.StaffShiftRepository;
import mls.sho.dms.common.enums.InventoryType;
import mls.sho.dms.common.enums.StockMovementType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TableSessionRepository tableSessionRepository;
    private final InventoryLedgerRepository inventoryLedgerRepository;
    private final StaffShiftRepository staffShiftRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderLineRepository orderLineRepository;
    private final DiningTableRepository diningTableRepository;

    @Transactional(readOnly = true)
    public InventoryValuationDto getInventoryValuation(Long restaurantId) {
        BigDecimal total = inventoryLedgerRepository.sumValueByRestaurant(restaurantId);
        return InventoryValuationDto.builder()
                .totalValue(total != null ? total : BigDecimal.ZERO)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional(readOnly = true)
    public List<CategoryDistributionDto> getCategoryDistribution(Long restaurantId, InventoryType type) {
        List<CategorySubtotal> data = inventoryLedgerRepository.findCategorySubtotals(restaurantId, type);

        BigDecimal grandTotal = data.stream()
                .map(CategorySubtotal::totalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return data.stream()
                .map(subtotal -> {
                    Double pct = grandTotal.compareTo(BigDecimal.ZERO) > 0
                            ? subtotal.totalValue().multiply(new BigDecimal(100)).divide(grandTotal, 2, RoundingMode.HALF_UP).doubleValue()
                            : 0.0;

                    return CategoryDistributionDto.builder()
                            .category(subtotal.category().toString())
                            .value(subtotal.totalValue())
                            .percentage(pct)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IngredientVarianceDto> getInventoryVarianceReport(Long restaurantId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        // 1. Fetch Sales Volume
        List<Object[]> salesRes = orderLineRepository.findSalesVolumeByMenuItem(restaurantId, start, end);
        Map<Long, BigDecimal> salesByMenuId = salesRes.stream()
                .collect(Collectors.toMap(row -> (Long) row[0], row -> BigDecimal.valueOf((Long) row[1])));

        // 2. Explode Recipes (Calculate Theoretical Usage)
        Map<Long, BigDecimal> theoreticalMap = new HashMap<>();
        Map<Long, String> ingredientNames = new HashMap<>();

        List<MenuItem> menuItems = menuItemRepository.findAllByRestaurantId(restaurantId);
        for (MenuItem item : menuItems) {
            BigDecimal quantitySold = salesByMenuId.getOrDefault(item.getId(), BigDecimal.ZERO);
            if (quantitySold.compareTo(BigDecimal.ZERO) == 0) continue;

            Recipe activeRecipe = item.getRecipes().stream()
                    .filter(Recipe::isActive)
                    .findFirst()
                    .orElse(null);

            if (activeRecipe == null) continue;

            for (var line : activeRecipe.getIngredientLines()) {
                if (line.getIngredient() != null) {
                    Long ingId = line.getIngredient().getId();
                    BigDecimal perPortion = line.getQuantityRu();
                    BigDecimal totalTheo = perPortion.multiply(quantitySold);
                    
                    theoreticalMap.merge(ingId, totalTheo, BigDecimal::add);
                    ingredientNames.putIfAbsent(ingId, line.getIngredient().getDescription());
                }
            }
        }

        // 3. Fetch Actual Usage from Ledger
        List<IngredientUsage> actualStats = inventoryLedgerRepository.findActualUsageByIngredient(
                restaurantId, start, end, List.of(
                        StockMovementType.DEPLETION,
                        StockMovementType.MISFIRE,
                        StockMovementType.DISCARD,
                        StockMovementType.RECONCILIATION
                ));

        // 4. Reconcile datasets
        Map<Long, IngredientVarianceDto> varianceMap = new HashMap<>();

        // Add actuals first
        for (IngredientUsage actual : actualStats) {
            BigDecimal theo = theoreticalMap.getOrDefault(actual.ingredientId(), BigDecimal.ZERO);
            BigDecimal variance = actual.totalQuantity().subtract(theo);
            Double varPct = theo.compareTo(BigDecimal.ZERO) > 0 
                    ? variance.divide(theo, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue()
                    : 100.0;

            varianceMap.put(actual.ingredientId(), IngredientVarianceDto.builder()
                    .ingredientId(actual.ingredientId())
                    .ingredientName(actual.ingredientDescription() != null ? actual.ingredientDescription() : "Unknown Ingredient")
                    .theoreticalUsage(theo)
                    .actualUsage(actual.totalQuantity())
                    .varianceQuantity(variance)
                    .variancePercentage(varPct)
                    .costImpact(variance.multiply(actual.averageUnitCost()).setScale(2, RoundingMode.HALF_UP))
                    .build());
            
            theoreticalMap.remove(actual.ingredientId());
        }

        // Add theoreticals that had ZERO actual usage
        for (Map.Entry<Long, BigDecimal> entry : theoreticalMap.entrySet()) {
            BigDecimal theo = entry.getValue();
            BigDecimal variance = BigDecimal.ZERO.subtract(theo);
            
            varianceMap.put(entry.getKey(), IngredientVarianceDto.builder()
                    .ingredientId(entry.getKey())
                    .ingredientName(ingredientNames.get(entry.getKey()))
                    .theoreticalUsage(theo)
                    .actualUsage(BigDecimal.ZERO)
                    .varianceQuantity(variance)
                    .variancePercentage(-100.0)
                    .costImpact(BigDecimal.ZERO)
                    .build());
        }

        return new ArrayList<>(varianceMap.values()).stream()
                .sorted(Comparator.comparing(IngredientVarianceDto::getCostImpact).reversed())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WasteSummaryDto getWasteSummary(Long restaurantId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        List<StockMovementType> wasteTypes = List.of(StockMovementType.MISFIRE, StockMovementType.DISCARD);

        var ledgerList = inventoryLedgerRepository.findAllByRestaurantIdAndDateAndTypes(restaurantId, start, end, wasteTypes);

        BigDecimal totalWaste = ledgerList.stream()
                .map(e -> e.getTotalValue().abs())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Group by ingredient
        var items = ledgerList.stream()
                .collect(Collectors.groupingBy(e -> e.getIngredient().getDescription(),
                        Collectors.mapping(e -> e, Collectors.toList())))
                .entrySet().stream()
                .map(entry -> WasteSummaryDto.WasteItemDto.builder()
                        .ingredientName(entry.getKey())
                        .totalValue(entry.getValue().stream().map(e -> e.getTotalValue().abs()).reduce(BigDecimal.ZERO, BigDecimal::add))
                        .quantity(entry.getValue().stream().map(e -> e.getQuantity().abs()).reduce(BigDecimal.ZERO, BigDecimal::add))
                        .unit(entry.getValue().get(0).getIngredient().getInventoryUnit().toString())
                        .build())
                .sorted((a, b) -> b.getTotalValue().compareTo(a.getTotalValue()))
                .limit(10)
                .collect(Collectors.toList());

        // Group by reason
        Map<String, BigDecimal> reasonMap = ledgerList.stream()
                .collect(Collectors.groupingBy(e -> e.getReasonCode() != null ? e.getReasonCode() : "UNSPECIFIED",
                        Collectors.mapping(e -> e.getTotalValue().abs(),
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

        return WasteSummaryDto.builder()
                .totalWasteValue(totalWaste)
                .topWasteItems(items)
                .wasteByReason(reasonMap)
                .build();
    }

    @Transactional(readOnly = true)
    public List<GuestArrivalReportDto> getGuestArrivalHeatmap(Long restaurantId, String view, LocalDate startDate) {
        LocalDateTime start;
        LocalDateTime end;

        if ("week".equalsIgnoreCase(view)) {
            start = startDate.atStartOfDay();
            end = startDate.plusDays(6).atTime(LocalTime.MAX);
        } else {
            start = startDate.withDayOfMonth(1).atStartOfDay();
            end = startDate.withDayOfMonth(startDate.lengthOfMonth()).atTime(LocalTime.MAX);
        }

        List<DailyGuestCount> rawData = (restaurantId != null)
                ? inventoryLedgerRepository.findDailyGuestCountsFromLedger(restaurantId, start, end)
                : inventoryLedgerRepository.findDailyGuestCountsFromLedgerGlobal(start, end);

        Map<LocalDate, Long> countsByDate = rawData.stream()
                .collect(Collectors.toMap(
                        row -> new java.sql.Date(row.date().getTime()).toLocalDate(),
                        DailyGuestCount::guestCount,
                        Long::sum,
                        TreeMap::new
                ));

        List<GuestArrivalReportDto> report = new ArrayList<>();
        LocalDate current = start.toLocalDate();
        LocalDate lastDay = end.toLocalDate();
        long maxCount = countsByDate.values().stream().max(Long::compare).orElse(0L);

        while (!current.isAfter(lastDay)) {
            Long count = countsByDate.getOrDefault(current, 0L);
            Double intensity = maxCount > 0 ? (double) count / maxCount : 0.0;
            report.add(GuestArrivalReportDto.builder()
                    .date(current)
                    .guestCount(count)
                    .intensity(intensity)
                    .build());
            current = current.plusDays(1);
        }
        return report;
    }

    @Transactional(readOnly = true)
    public List<RevenueReportDto> getRevenueHeatmap(Long restaurantId, String view, LocalDate startDate) {
        LocalDateTime start;
        LocalDateTime end;

        if ("week".equalsIgnoreCase(view)) {
            start = startDate.atStartOfDay();
            end = startDate.plusDays(6).atTime(LocalTime.MAX);
        } else {
            start = startDate.withDayOfMonth(1).atStartOfDay();
            end = startDate.withDayOfMonth(startDate.lengthOfMonth()).atTime(LocalTime.MAX);
        }

        List<DailyRevenue> rawData = (restaurantId != null)
                ? inventoryLedgerRepository.findDailyRevenueFromLedger(restaurantId, start, end)
                : inventoryLedgerRepository.findDailyRevenueFromLedgerGlobal(start, end);

        Map<LocalDate, BigDecimal> revenueByDate = rawData.stream()
                .collect(Collectors.toMap(
                        row -> new java.sql.Date(row.date().getTime()).toLocalDate(),
                        DailyRevenue::totalAmount,
                        BigDecimal::add,
                        TreeMap::new
                ));

        List<RevenueReportDto> report = new ArrayList<>();
        LocalDate current = start.toLocalDate();
        LocalDate lastDay = end.toLocalDate();
        BigDecimal maxRevenue = revenueByDate.values().stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);

        while (!current.isAfter(lastDay)) {
            BigDecimal revenue = revenueByDate.getOrDefault(current, BigDecimal.ZERO);
            Double intensity = maxRevenue.compareTo(BigDecimal.ZERO) > 0
                    ? revenue.divide(maxRevenue, 4, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            report.add(RevenueReportDto.builder()
                    .date(current)
                    .revenue(revenue)
                    .intensity(intensity)
                    .build());
            current = current.plusDays(1);
        }
        return report;
    }

    @Transactional(readOnly = true)
    public List<LaborAnalyticsDto> getLaborAnalyticsHeatmap(Long restaurantId, String view, LocalDate startDate) {
        LocalDateTime start;
        LocalDateTime end;

        if ("week".equalsIgnoreCase(view)) {
            start = startDate.atStartOfDay();
            end = startDate.plusDays(6).atTime(LocalTime.MAX);
        } else {
            start = startDate.withDayOfMonth(1).atStartOfDay();
            end = startDate.withDayOfMonth(startDate.lengthOfMonth()).atTime(LocalTime.MAX);
        }

        Map<LocalDate, BigDecimal> revenueByDate = inventoryLedgerRepository.findDailyRevenueFromLedger(restaurantId, start, end)
                .stream().collect(Collectors.toMap(
                        row -> new java.sql.Date(row.date().getTime()).toLocalDate(), 
                        DailyRevenue::totalAmount, 
                        BigDecimal::add, 
                        TreeMap::new
                ));

        // Get Labor Stats - Still uses Object[], needs StaffShiftRepository update
        List<Object[]> laborData = (restaurantId != null)
                ? staffShiftRepository.findDailyLaborStats(restaurantId, start, end)
                : staffShiftRepository.findDailyLaborStatsGlobal(start, end);

        Map<LocalDate, Object[]> laborStatsByDate = laborData.stream()
                .collect(Collectors.toMap(
                        row -> (LocalDate) row[0],
                        row -> row,
                        (v1, v2) -> v1,
                        TreeMap::new
                ));

        List<LaborAnalyticsDto> report = new ArrayList<>();
        LocalDate current = start.toLocalDate();
        LocalDate lastDay = end.toLocalDate();

        BigDecimal maxLaborCost = laborStatsByDate.values().stream()
                .map(row -> (BigDecimal) row[2])
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        while (!current.isAfter(lastDay)) {
            Object[] stats = laborStatsByDate.get(current);
            BigDecimal revenue = revenueByDate.getOrDefault(current, BigDecimal.ZERO);

            BigDecimal laborCost = stats != null ? (BigDecimal) stats[2] : BigDecimal.ZERO;
            Long laborMinutes = stats != null ? (Long) stats[1] : 0L;

            Double laborPct = (revenue.compareTo(BigDecimal.ZERO) > 0)
                    ? laborCost.divide(revenue, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue()
                    : 0.0;

            Double intensity = maxLaborCost.compareTo(BigDecimal.ZERO) > 0
                    ? laborCost.divide(maxLaborCost, 4, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            report.add(LaborAnalyticsDto.builder()
                    .date(current)
                    .laborCost(laborCost)
                    .laborMinutes(laborMinutes)
                    .laborPercentage(laborPct)
                    .intensity(intensity)
                    .build());

            current = current.plusDays(1);
        }
        return report;
    }

    @Transactional(readOnly = true)
    public List<OvertimeLeakageDto> getOvertimeLeakage(Long restaurantId, LocalDate weekStart) {
        LocalDateTime start = weekStart.atStartOfDay();
        LocalDateTime end = weekStart.plusDays(6).atTime(LocalTime.MAX);

        List<Object[]> stats = staffShiftRepository.findWeeklyStaffLaborStats(restaurantId, start, end);

        return stats.stream()
                .map(row -> {
                    UUID staffId = (UUID) row[0];
                    String staffName = (String) row[1];
                    Double weeklyHours = (double) ((Long) row[2]) / 60.0;
                    Integer standardHours = (Integer) row[3];
                    BigDecimal overtimeRate = (BigDecimal) row[4];
                    BigDecimal baseRate = (BigDecimal) row[5];

                    double otHours = Math.max(0, weeklyHours - standardHours);
                    BigDecimal otCost = BigDecimal.valueOf(otHours).multiply(overtimeRate != null ? overtimeRate : baseRate.multiply(new BigDecimal("1.5")));

                    return OvertimeLeakageDto.builder()
                            .staffId(staffId)
                            .staffName(staffName)
                            .weeklyHours(weeklyHours)
                            .standardHours(standardHours)
                            .overtimeHours(otHours)
                            .overtimeCost(otCost.setScale(2, RoundingMode.HALF_UP))
                            .build();
                })
                .collect(Collectors.<OvertimeLeakageDto>toList());
    }

    @Transactional(readOnly = true)
    public List<PrimeCostReportDto> getPrimeCostAnalytics(Long restaurantId, String view, LocalDate startDate) {
        LocalDateTime start;
        LocalDateTime end;

        if ("week".equalsIgnoreCase(view)) {
            start = startDate.atStartOfDay();
            end = startDate.plusDays(6).atTime(LocalTime.MAX);
        } else {
            start = startDate.withDayOfMonth(1).atStartOfDay();
            end = startDate.withDayOfMonth(startDate.lengthOfMonth()).atTime(LocalTime.MAX);
        }

        // Get Revenue
        Map<LocalDate, BigDecimal> revenueByDate = inventoryLedgerRepository.findDailyRevenueFromLedger(restaurantId, start, end)
                .stream().collect(Collectors.toMap(
                        row -> new java.sql.Date(row.date().getTime()).toLocalDate(), 
                        DailyRevenue::totalAmount, 
                        BigDecimal::add, 
                        TreeMap::new
                ));

        // Get COGS
        Map<LocalDate, BigDecimal> cogsByDate = inventoryLedgerRepository.findDailyCogs(restaurantId, start, end)
                .stream().collect(Collectors.toMap(
                        row -> new java.sql.Date(row.date().getTime()).toLocalDate(), 
                        DailyCogs::cogsAmount, 
                        BigDecimal::add, 
                        TreeMap::new
                ));

        // Get Labor - Still uses Object[]
        Map<LocalDate, BigDecimal> laborByDate = staffShiftRepository.findDailyLaborStats(restaurantId, start, end)
                .stream().collect(Collectors.toMap(row -> (LocalDate) row[0], row -> (BigDecimal) row[2], BigDecimal::add, TreeMap::new));

        List<PrimeCostReportDto> report = new ArrayList<>();
        LocalDate current = start.toLocalDate();
        LocalDate lastDay = end.toLocalDate();

        while (!current.isAfter(lastDay)) {
            BigDecimal revenue = revenueByDate.getOrDefault(current, BigDecimal.ZERO);
            BigDecimal cogs = cogsByDate.getOrDefault(current, BigDecimal.ZERO);
            BigDecimal labor = laborByDate.getOrDefault(current, BigDecimal.ZERO);
            BigDecimal primeCost = cogs.add(labor);

            Double primePct = (revenue.compareTo(BigDecimal.ZERO) > 0)
                    ? primeCost.divide(revenue, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue()
                    : 0.0;

            report.add(PrimeCostReportDto.builder()
                    .date(current)
                    .revenue(revenue)
                    .cogs(cogs)
                    .laborCost(labor)
                    .primeCost(primeCost)
                    .primeCostPercentage(primePct)
                    .build());

            current = current.plusDays(1);
        }
        return report;
    }

    @Transactional(readOnly = true)
    public List<MenuEngineeringDto> getMenuEngineering(Long restaurantId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        // 1. Fetch data
        var menuItems = menuItemRepository.findByRestaurantIdAndActiveTrue(restaurantId);
        var salesData = orderLineRepository.findSalesVolumeByMenuItem(restaurantId, start, end);

        Map<Long, Object[]> salesMap = salesData.stream()
                .collect(Collectors.toMap(row -> (Long) row[0], row -> row));

        // 2. Aggregate totals for thresholds
        long totalUnits = salesData.stream().mapToLong(row -> (Long) row[1]).sum();
        BigDecimal totalMargin = BigDecimal.ZERO;

        List<MenuEngineeringDto> initialDtos = new ArrayList<>();
        for (var item : menuItems) {
            Object[] sales = salesMap.get(item.getId());
            long units = sales != null ? (Long) sales[1] : 0L;
            BigDecimal avgPrice = sales != null ? new BigDecimal(""+sales[2]) : item.getSellPriceBuffer();
            BigDecimal cost = item.getPlateCost() != null ? item.getPlateCost() : BigDecimal.ZERO;
            BigDecimal margin = avgPrice.subtract(cost);
            BigDecimal itemTotalMargin = margin.multiply(BigDecimal.valueOf(units));

            totalMargin = totalMargin.add(itemTotalMargin);

            initialDtos.add(MenuEngineeringDto.builder()
                    .menuItemId(item.getId())
                    .name(item.getName())
                    .unitsSold(units)
                    .costPerUnit(cost)
                    .pricePerUnit(avgPrice)
                    .marginPerUnit(margin)
                    .totalMargin(itemTotalMargin)
                    .salesMixPercentage(totalUnits > 0 ? (double) units / totalUnits * 100.0 : 0.0)
                    .build());
        }

        // 3. Define thresholds
        double popularityThreshold = menuItems.isEmpty() ? 0.0 : (1.0 / menuItems.size()) * 0.7 * 100.0;
        BigDecimal avgMargin = totalUnits > 0 ? totalMargin.divide(BigDecimal.valueOf(totalUnits), 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        // 4. Assign Quadrants
        for (var dto : initialDtos) {
            boolean highPopularity = dto.getSalesMixPercentage() >= popularityThreshold;
            boolean highMargin = dto.getMarginPerUnit().compareTo(avgMargin) >= 0;

            if (highPopularity && highMargin) dto.setQuadrant(MenuEngineeringDto.Quadrant.STAR);
            else if (highPopularity) dto.setQuadrant(MenuEngineeringDto.Quadrant.PLOWHORSE);
            else if (highMargin) dto.setQuadrant(MenuEngineeringDto.Quadrant.PUZZLE);
            else dto.setQuadrant(MenuEngineeringDto.Quadrant.DOG);
        }

        return initialDtos;
    }

    @Transactional(readOnly = true)
    public List<TableTurnaroundDto> getTableTurnaroundAnalytics(Long restaurantId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<Object[]> stats = tableSessionRepository.findTableTurnaroundStats(restaurantId, start, end);
        long tableCount = diningTableRepository.findAllByRestaurantId(restaurantId).size();

        double maxTurnaround = stats.stream()
                .mapToDouble(row -> ((Number) row[3]).doubleValue())
                .max().orElse(1.0);

        return stats.stream()
                .map(row -> {
                    Long tableId = ((Number) row[0]).longValue();
                    String tableName = (String) row[1];
                    Long sessions = ((Number) row[2]).longValue();
                    Double avgTurnaround = ((Number) row[3]).doubleValue();
                    BigDecimal totalRev = row[4] != null ? (BigDecimal) row[4] : BigDecimal.ZERO;

                    return TableTurnaroundDto.builder()
                            .tableId(tableId)
                            .tableName(tableName)
                            .totalSessions(sessions)
                            .avgTurnaroundMinutes(avgTurnaround)
                            .avgRevenuePerSession(sessions > 0 ? totalRev.divide(BigDecimal.valueOf(sessions), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                            .turnoverRate(tableCount > 0 ? (double) sessions : 0.0)
                            .intensity(1.0 - (avgTurnaround / maxTurnaround))
                            .build();
                })
                .collect(Collectors.toList());
    }
}