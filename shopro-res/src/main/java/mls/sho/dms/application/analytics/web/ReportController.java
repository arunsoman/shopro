package mls.sho.dms.application.analytics.web;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.analytics.dto.*;
import mls.sho.dms.application.analytics.service.ReportService;
import mls.sho.dms.common.enums.InventoryType;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/guest-heatmap")
    public List<GuestArrivalReportDto> getGuestArrivalHeatmap(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "month") String view,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        return reportService.getGuestArrivalHeatmap(restaurantId, view, startDate);
    }

    @GetMapping("/revenue-heatmap")
    public List<RevenueReportDto> getRevenueHeatmap(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "month") String view,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        return reportService.getRevenueHeatmap(restaurantId, view, startDate);
    }

    @GetMapping("/labor-heatmap")
    public List<LaborAnalyticsDto> getLaborAnalyticsHeatmap(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "month") String view,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        return reportService.getLaborAnalyticsHeatmap(restaurantId, view, startDate);
    }

    @GetMapping("/inventory-valuation")
    public InventoryValuationDto getInventoryValuation(@PathVariable Long restaurantId) {
        return reportService.getInventoryValuation(restaurantId);
    }

    @GetMapping("/category-distribution")
    public List<CategoryDistributionDto> getCategoryDistribution(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "FOOD") InventoryType type) {
        return reportService.getCategoryDistribution(restaurantId, type);
    }

    @GetMapping("/overtime-leakage")
    public List<OvertimeLeakageDto> getOvertimeLeakage(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return reportService.getOvertimeLeakage(restaurantId, weekStart);
    }

    @GetMapping("/prime-cost")
    public List<PrimeCostReportDto> getPrimeCostAnalytics(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "month") String view,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        return reportService.getPrimeCostAnalytics(restaurantId, view, startDate);
    }

    @GetMapping("/menu-engineering")
    public List<MenuEngineeringDto> getMenuEngineering(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reportService.getMenuEngineering(restaurantId, startDate, endDate);
    }

    @GetMapping("/table-turnaround")
    public List<TableTurnaroundDto> getTableTurnaroundAnalytics(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reportService.getTableTurnaroundAnalytics(restaurantId, startDate, endDate);
    }

    @GetMapping("/inventory-variance")
    public List<IngredientVarianceDto> getInventoryVarianceReport(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            return reportService.getInventoryVarianceReport(restaurantId, startDate, endDate);
        } catch (Exception e) {
            log.error("Error generating inventory variance report for restaurant {}: {}", restaurantId, e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @GetMapping("/waste-summary")
    public WasteSummaryDto getWasteSummary(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reportService.getWasteSummary(restaurantId, startDate, endDate);
    }

}
