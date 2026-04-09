package mls.sho.dms.application.analytics.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.analytics.dto.*;
import mls.sho.dms.application.analytics.service.CfoDashboardService;
import mls.sho.dms.application.analytics.service.KpiService;
import mls.sho.dms.application.analytics.service.ManagerAnalyticsService;
import mls.sho.dms.application.inventory.service.BusinessSimulatorService;
import mls.sho.dms.application.analytics.service.ExperimentService;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final KpiService kpiService;
    private final CfoDashboardService cfoService;
    private final ManagerAnalyticsService managerService;
    private final ExperimentService experimentService;

    @GetMapping("/dashboard")
    public KpiService.KpiDashboard getDashboard(@PathVariable Long restaurantId) {
        return kpiService.getDashboardMetrics(restaurantId);
    }

    @GetMapping("/cfo/snapshot")
    public CfoDashboardDtos.CfoDashboardSnapshotDto getCfoSnapshot(@PathVariable Long restaurantId) {
        return cfoService.getDashboardSnapshot(restaurantId);
    }

    @GetMapping("/manager/gm")
    public GmDashboardDto getGmSnapshot(@PathVariable Long restaurantId) {
        return managerService.getGmSnapshot(restaurantId);
    }

    @GetMapping("/manager/chef")
    public ChefDashboardDto getChefSnapshot(@PathVariable Long restaurantId) {
        return managerService.getChefSnapshot(restaurantId);
    }

    @GetMapping("/manager/foh")
    public FohDashboardDto getFohSnapshot(@PathVariable Long restaurantId) {
        return managerService.getFohSnapshot(restaurantId);
    }

    @GetMapping("/manager/bar")
    public BarDashboardDto getBarSnapshot(@PathVariable Long restaurantId) {
        return managerService.getBarSnapshot(restaurantId);
    }

    @GetMapping("/manager/shift")
    public ShiftDashboardDto getShiftSnapshot(@PathVariable Long restaurantId) {
        return managerService.getShiftSnapshot(restaurantId);
    }

    @GetMapping("/manager/catering")
    public CateringDashboardDto getCateringSnapshot(@PathVariable Long restaurantId) {
        return managerService.getCateringSnapshot(restaurantId);
    }
    
    // --- Experiments ---
    
    @PostMapping("/experiments")
    public ResponseEntity<ExperimentDTO> createExperiment(
            @PathVariable Long restaurantId,
            @RequestHeader("X-User-Id") UUID userId,
            @jakarta.validation.Valid @RequestBody CreateExperimentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(experimentService.createExperiment(restaurantId, userId, request));
    }
    
    @GetMapping("/experiments")
    public ResponseEntity<List<ExperimentDTO>> listExperiments(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(experimentService.listByRestaurant(restaurantId));
    }
    
    @GetMapping("/experiments/{id}")
    public ResponseEntity<ExperimentDTO> getExperimentById(@PathVariable UUID id) {
        return ResponseEntity.ok(experimentService.getById(id));
    }
    
    @PostMapping("/experiments/{id}/start")
    public ResponseEntity<Void> startExperiment(@PathVariable UUID id) {
        experimentService.startExperiment(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/experiments/{id}/rollback")
    public ResponseEntity<Void> rollbackExperiment(
            @PathVariable UUID id,
            @RequestBody String reason) {
        experimentService.rollbackExperiment(id, reason);
        return ResponseEntity.ok().build();
    }
}
