package mls.sho.dms.application.primecost.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.primecost.service.PrimeCostService;
import mls.sho.dms.application.primecost.dto.PrimeCostDtos.*;
import mls.sho.dms.application.primecost.entity.PrimeCostReport;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/prime-cost")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PrimeCostController {

    private final PrimeCostService primeCostService;

    @GetMapping("/live")
    public ResponseEntity<LivePrimeCostDto> getLivePrimeCost(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(primeCostService.getLivePrimeCost(restaurantId));
    }

    @GetMapping("/theoretical-cos")
    public ResponseEntity<BigDecimal> computeTheoreticalCos(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(primeCostService.computeTheoreticalCos(restaurantId, from, to));
    }

    @GetMapping("/actual-cos")
    public ResponseEntity<BigDecimal> computeActualCos(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(primeCostService.computeActualCos(restaurantId, from, to));
    }

    @GetMapping("/shrinkage")
    public ResponseEntity<ShrinkageDto> computeShrinkage(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(primeCostService.computeShrinkage(restaurantId, from, to));
    }

    @GetMapping("/weekly")
    public ResponseEntity<PrimeCostReportDto> getWeeklyReport(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(primeCostService.getWeeklyReport(restaurantId, weekStart));
    }

    @PostMapping("/weekly/{weekStart}/finalise")
    public ResponseEntity<PrimeCostReport> finaliseWeeklyReport(
            @PathVariable Long restaurantId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(primeCostService.finaliseWeeklyReport(restaurantId, weekStart));
    }

    @GetMapping("/forecast")
    public ResponseEntity<PrimeCostForecastDto> getForecast(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(primeCostService.getForecast(restaurantId, weekStart));
    }

    @GetMapping("/budget-vs-actual")
    public ResponseEntity<BudgetVsActualDto> getBudgetVsActual(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(primeCostService.getBudgetVsActual(restaurantId, weekStart));
    }

    @GetMapping("/variance-attribution")
    public ResponseEntity<VarianceAttributionDto> getVarianceAttribution(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(primeCostService.getVarianceAttribution(restaurantId, weekStart));
    }

    @GetMapping("/trend")
    public ResponseEntity<List<PrimeCostTrendPointDto>> getPrimeCostTrend(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "12") int weeks) {
        return ResponseEntity.ok(primeCostService.getPrimeCostTrend(restaurantId, weeks));
    }

    @GetMapping("/trend/daily")
    public ResponseEntity<List<PrimeCostTrendPointDto>> getDailyPrimeCostTrend(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(primeCostService.getDailyPrimeCostTrend(restaurantId, days));
    }
}
