package mls.sho.dms.application.engineering.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.engineering.entity.MenuEngineeringPeriod;
import mls.sho.dms.application.engineering.entity.MenuEngineeringPeriod.PeriodStatus;
import mls.sho.dms.application.engineering.repository.MenuEngineeringPeriodRepository;
import mls.sho.dms.application.pos.repository.MenuItemRepository;
import mls.sho.dms.application.pos.repository.OrderRepository;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.common.enums.MenuEngClassification;
import mls.sho.dms.entity.MenuItem;
import mls.sho.dms.entity.Order;
import mls.sho.dms.entity.Restaurant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuEngineeringPeriodService {

    private final MenuEngineeringPeriodRepository periodRepository;
    private final MenuEngineeringService engineeringService;
    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPeriods(Long restaurantId) {
        return periodRepository.findAllByRestaurantIdOrderByStartDateDesc(restaurantId)
                .stream()
                .map(this::toSummaryMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuEngineeringService.MenuEngResult> getPeriodResults(Long restaurantId, Long periodId) {
        MenuEngineeringPeriod period = findPeriod(restaurantId, periodId);
        if (period.getResultsJson() == null) return List.of();
        try {
            return objectMapper.readValue(period.getResultsJson(),
                    new TypeReference<List<MenuEngineeringService.MenuEngResult>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPeriodSummary(Long restaurantId, Long periodId) {
        List<MenuEngineeringService.MenuEngResult> results = getPeriodResults(restaurantId, periodId);
        if (results.isEmpty()) {
            return Map.of("periodId", periodId, "totalSold", 0, "totalRevenue", BigDecimal.ZERO,
                    "totalCost", BigDecimal.ZERO, "totalProfit", BigDecimal.ZERO,
                    "avgFoodCostPct", BigDecimal.ZERO, "winnerCount", 0,
                    "workhorseCount", 0, "opportunityCount", 0, "loserCount", 0);
        }

        int totalSold = results.stream().mapToInt(MenuEngineeringService.MenuEngResult::getQuantitySold).sum();
        BigDecimal totalRevenue = results.stream()
                .map(r -> r.getSellPrice().multiply(BigDecimal.valueOf(r.getQuantitySold())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCost = results.stream()
                .map(r -> r.getItemCost().multiply(BigDecimal.valueOf(r.getQuantitySold())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalProfit = totalRevenue.subtract(totalCost);
        BigDecimal avgFoodCostPct = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                ? totalCost.divide(totalRevenue, 4, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("periodId",       periodId);
        summary.put("totalSold",      totalSold);
        summary.put("totalRevenue",   totalRevenue);
        summary.put("totalCost",      totalCost);
        summary.put("totalProfit",    totalProfit);
        summary.put("avgFoodCostPct", avgFoodCostPct);
        summary.put("winnerCount",      countByClass(results, MenuEngClassification.WINNER));
        summary.put("workhorseCount",   countByClass(results, MenuEngClassification.WORKHORSE));
        summary.put("opportunityCount", countByClass(results, MenuEngClassification.OPPORTUNITY));
        summary.put("loserCount",       countByClass(results, MenuEngClassification.LOSER));
        return summary;
    }

    @Transactional
    public MenuEngineeringPeriod createPeriod(Long restaurantId, Map<String, Object> body) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        MenuEngineeringPeriod period = new MenuEngineeringPeriod();
        period.setRestaurant(restaurant);
        period.setPeriodName(body.getOrDefault("periodName", "Period " + LocalDate.now()).toString());
        period.setStartDate(LocalDate.parse(body.getOrDefault("startDate", LocalDate.now().minusDays(7)).toString()));
        period.setEndDate(LocalDate.parse(body.getOrDefault("endDate", LocalDate.now()).toString()));
        period.setStatus(PeriodStatus.DRAFT);
        return periodRepository.save(period);
    }

    @Transactional
    public MenuEngineeringPeriod runPeriod(Long restaurantId, Long periodId) {
        MenuEngineeringPeriod period = findPeriod(restaurantId, periodId);

        LocalDateTime start = period.getStartDate().atStartOfDay();
        LocalDateTime end   = period.getEndDate().atTime(23, 59, 59);

        // Aggregate quantities sold per menu item in the date range
        List<Order> orders = orderRepository.findAllByRestaurantIdAndCreatedAtBetween(restaurantId, start, end);

        Map<Long, Integer> qtySoldMap = new LinkedHashMap<>();
        for (Order o : orders) {
            for (var line : o.getLines()) {
                if (line.getMenuItem() != null) {
                    qtySoldMap.merge(line.getMenuItem().getId(), line.getQuantity(), Integer::sum);
                }
            }
        }

        // Only analyse items that were actually sold
        List<MenuItem> items = menuItemRepository.findAllByRestaurantId(restaurantId).stream()
                .filter(i -> qtySoldMap.containsKey(i.getId()))
                .collect(Collectors.toList());

        if (items.isEmpty()) {
            period.setResultsJson("[]");
            period.setStatus(PeriodStatus.COMPLETE);
            period.setRunAt(LocalDateTime.now());
            return periodRepository.save(period);
        }

        List<Integer> quantities = items.stream()
                .map(i -> qtySoldMap.get(i.getId()))
                .collect(Collectors.toList());

        List<MenuEngineeringService.MenuEngResult> results = engineeringService.runAnalysis(items, quantities);

        try {
            period.setResultsJson(objectMapper.writeValueAsString(results));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialise results", e);
        }
        period.setStatus(PeriodStatus.COMPLETE);
        period.setRunAt(LocalDateTime.now());
        return periodRepository.save(period);
    }

    @Transactional(readOnly = true)
    public List<MenuEngineeringService.MenuEngResult> simulatePeriod(Long restaurantId, Long periodId,
                                                                      Map<String, Object> overrides) {
        MenuEngineeringPeriod period = findPeriod(restaurantId, periodId);

        LocalDateTime start = period.getStartDate().atStartOfDay();
        LocalDateTime end   = period.getEndDate().atTime(23, 59, 59);

        List<Order> orders = orderRepository.findAllByRestaurantIdAndCreatedAtBetween(restaurantId, start, end);
        Map<Long, Integer> qtySoldMap = new LinkedHashMap<>();
        for (Order o : orders) {
            for (var line : o.getLines()) {
                if (line.getMenuItem() != null) {
                    qtySoldMap.merge(line.getMenuItem().getId(), line.getQuantity(), Integer::sum);
                }
            }
        }

        // Apply optional quantity overrides: {"itemId": newQty, ...}
        if (overrides != null) {
            overrides.forEach((k, v) -> {
                try { qtySoldMap.put(Long.parseLong(k), Integer.parseInt(v.toString())); }
                catch (NumberFormatException ignored) {}
            });
        }

        List<MenuItem> items = menuItemRepository.findAllByRestaurantId(restaurantId).stream()
                .filter(i -> qtySoldMap.containsKey(i.getId()))
                .collect(Collectors.toList());

        if (items.isEmpty()) return List.of();

        List<Integer> quantities = items.stream()
                .map(i -> qtySoldMap.get(i.getId()))
                .collect(Collectors.toList());

        return engineeringService.runAnalysis(items, quantities);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> comparePeriods(Long restaurantId, List<Long> periodIds) {
        List<Map<String, Object>> summaries = periodIds.stream()
                .map(id -> getPeriodSummary(restaurantId, id))
                .collect(Collectors.toList());
        return Map.of("comparison", summaries);
    }

    // -- Helpers -----------------------------------------------

    private MenuEngineeringPeriod findPeriod(Long restaurantId, Long periodId) {
        MenuEngineeringPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new RuntimeException("Period not found"));
        if (!period.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException("Period does not belong to this restaurant");
        }
        return period;
    }

    private Map<String, Object> toSummaryMap(MenuEngineeringPeriod p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",         p.getId());
        m.put("periodName", p.getPeriodName());
        m.put("startDate",  p.getStartDate().toString());
        m.put("endDate",    p.getEndDate().toString());
        m.put("status",     p.getStatus().name());
        m.put("runAt",      p.getRunAt() != null ? p.getRunAt().toString() : null);
        return m;
    }

    private long countByClass(List<MenuEngineeringService.MenuEngResult> results,
                               MenuEngClassification cls) {
        return results.stream().filter(r -> r.getClassification() == cls).count();
    }
}
