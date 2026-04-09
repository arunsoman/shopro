package mls.sho.dms.application.service.menu.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.analytics.MenuAnalyticsResponse;
import mls.sho.dms.application.dto.analytics.MenuItemPerformanceDTO;
import mls.sho.dms.application.dto.inventory.RecipeResponse;
import mls.sho.dms.application.service.inventory.RecipeService;
import mls.sho.dms.application.service.menu.MenuAnalyticsService;
import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.repository.menu.MenuItemRepository;
import mls.sho.dms.repository.order.OrderItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MenuAnalyticsServiceImpl implements MenuAnalyticsService {

    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final RecipeService recipeService;

    @Override
    @Transactional(readOnly = true)
    public MenuAnalyticsResponse getOverview(Instant from, Instant to) {
        // 1. Basic Stats
        long ticketCount = orderItemRepository.countCompletedTickets(from, to);
        List<Object[]> itemSalesData = orderItemRepository.sumSalesByMenuItem(from, to);
        List<Object[]> categorySalesData = orderItemRepository.sumSalesByCategory(from, to);

        // Map sales totals to item performance DTOs
        List<MenuItemPerformanceDTO> itemPerformances = calculateItemPerformances(itemSalesData);

        // Aggregate stats
        BigDecimal totalRevenue = itemPerformances.stream()
                .map(MenuItemPerformanceDTO::totalRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalSold = itemPerformances.stream()
                .mapToLong(MenuItemPerformanceDTO::totalQuantitySold)
                .sum();

        BigDecimal avgTransaction = ticketCount > 0 
                ? totalRevenue.divide(BigDecimal.valueOf(ticketCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Perform Menu Engineering classification
        classifyItems(itemPerformances);

        // Sorting for different UI lists
        List<MenuItemPerformanceDTO> topByQty = itemPerformances.stream()
                .sorted(Comparator.comparingLong(MenuItemPerformanceDTO::totalQuantitySold).reversed())
                .limit(5)
                .toList();

        List<MenuItemPerformanceDTO> topByRevenue = itemPerformances.stream()
                .sorted(Comparator.comparing(MenuItemPerformanceDTO::totalRevenue).reversed())
                .limit(5)
                .toList();

        List<MenuItemPerformanceDTO> topByMargin = itemPerformances.stream()
                .sorted(Comparator.comparing(MenuItemPerformanceDTO::unitMargin).reversed())
                .limit(5)
                .toList();

        Map<String, Long> classCounts = itemPerformances.stream()
                .collect(Collectors.groupingBy(MenuItemPerformanceDTO::engineeringClassification, Collectors.counting()));

        // Map category stats
        List<MenuAnalyticsResponse.CategoryPerformanceDTO> categoryStats = categorySalesData.stream()
                .map(row -> new MenuAnalyticsResponse.CategoryPerformanceDTO(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        (BigDecimal) row[2],
                        BigDecimal.ZERO // TODO: Average margin calc for category if needed
                )).toList();

        return new MenuAnalyticsResponse(
                ticketCount,
                totalSold,
                totalRevenue,
                avgTransaction,
                topByQty,
                topByRevenue,
                topByMargin,
                classCounts,
                categoryStats
        );
    }

    private List<MenuItemPerformanceDTO> calculateItemPerformances(List<Object[]> salesData) {
        return salesData.stream().map(row -> {
            UUID itemId = (UUID) row[0];
            long qty = ((Number) row[1]).longValue();
            BigDecimal revenue = (BigDecimal) row[2];

            MenuItem item = menuItemRepository.findById(itemId).orElseThrow();
            BigDecimal unitPrice = item.getBasePrice();

            // Fetch theoretical cost from recipe service
            BigDecimal theorCost = BigDecimal.ZERO;
            try {
                RecipeResponse recipe = recipeService.findLatestByMenuItem(itemId);
                if (recipe != null) {
                    theorCost = recipe.totalFoodCost();
                }
            } catch (Exception e) {
                log.warn("Failed to find recipe for item: {}", itemId, e);
            }

            BigDecimal unitMargin = unitPrice.subtract(theorCost);
            BigDecimal marginPct = unitPrice.compareTo(BigDecimal.ZERO) > 0
                    ? unitMargin.multiply(new BigDecimal(100)).divide(unitPrice, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            return new MenuItemPerformanceDTO(
                    itemId,
                    item.getName(),
                    item.getCategory().getName(),
                    qty,
                    revenue,
                    unitPrice,
                    theorCost,
                    unitMargin,
                    marginPct,
                    "TBD"
            );
        }).collect(Collectors.toList());
    }

    private void classifyItems(List<MenuItemPerformanceDTO> performances) {
        if (performances.isEmpty()) return;

        double avgSales = performances.stream().mapToLong(MenuItemPerformanceDTO::totalQuantitySold).average().orElse(0);
        BigDecimal avgMargin = performances.stream()
                .map(MenuItemPerformanceDTO::unitMargin)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(performances.size()), 4, RoundingMode.HALF_UP);

        for (int i = 0; i < performances.size(); i++) {
            MenuItemPerformanceDTO p = performances.get(i);
            String classification;

            boolean highSales = p.totalQuantitySold() >= avgSales;
            boolean highMargin = p.unitMargin().compareTo(avgMargin) >= 0;

            if (highSales && highMargin) classification = "STAR";
            else if (highSales) classification = "PLOWHORSE";
            else if (highMargin) classification = "PUZZLE";
            else classification = "DOG";

            // Record replacement since record is immutable
            performances.set(i, new MenuItemPerformanceDTO(
                p.menuItemId(), p.name(), p.categoryName(), p.totalQuantitySold(),
                p.totalRevenue(), p.unitPrice(), p.theoreticalUnitCost(),
                p.unitMargin(), p.marginPercentage(), classification
            ));
        }
    }
}
