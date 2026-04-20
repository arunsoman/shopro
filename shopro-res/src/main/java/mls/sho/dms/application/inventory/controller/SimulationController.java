package mls.sho.dms.application.inventory.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.inventory.service.BusinessSimulatorService;
import mls.sho.dms.application.inventory.service.BusinessSimulatorService.SimJobStatus;
import mls.sho.dms.application.inventory.service.SimulatorInternalService;
import mls.sho.dms.entity.Restaurant;
import org.springframework.context.annotation.Profile;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/simulation")
@RequiredArgsConstructor
@Tag(name = "Data Simulation", description = "Endpoints for generating historical mock data")
public class SimulationController {

    private final BusinessSimulatorService simulatorService;
    private final SimulatorInternalService internalService;

    /**
     * Starts a simulation in the background and returns immediately (202 Accepted).
     * Poll GET /status to track progress.
     */
    @PostMapping("/run")
    @Operation(summary = "Starts a high-fidelity business simulation (async)",
               description = "Returns 202 immediately. Poll /status?restaurantId= for progress.")
    public ResponseEntity<Map<String, Object>> runSimulation(
            @RequestParam Long restaurantId,
            @RequestParam(defaultValue = "30") int days) {

        simulatorService.runSimulation(restaurantId, days);

        return ResponseEntity.accepted().body(Map.of(
            "status",       "STARTED",
            "restaurantId", restaurantId,
            "days",         days,
            "message",      "Simulation running in background. Poll /api/v1/simulation/status?restaurantId=" + restaurantId
        ));
    }

    /**
     * Returns current simulation job status for the given restaurant.
     */
    @GetMapping("/status")
    @Operation(summary = "Get simulation progress")
    public ResponseEntity<SimJobStatus> getStatus(@RequestParam Long restaurantId) {
        return ResponseEntity.ok(simulatorService.getStatus(restaurantId));
    }

    @PostMapping("/pre-launch/{restaurantId}")
    @Operation(summary = "Executes Phase 0 pre-launch readiness")
    public ResponseEntity<String> preLaunch(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {
        try {
            Restaurant res = new Restaurant();
            res.setId(restaurantId);
            LocalDateTime preLaunchDate = (date != null) ? date : LocalDateTime.now();
            simulatorService.preLaunchSequence(res, preLaunchDate, new BusinessSimulatorService.SimulationAudit());
            return ResponseEntity.ok("Pre-launch sequence completed for restaurant " + restaurantId);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Pre-launch failed: " + e.getMessage());
        }
    }

    @PostMapping("/reset-data/{restaurantId}")
    @Operation(summary = "Purges all historical simulation data for a restaurant")
    @PreAuthorize("hasRole('ADMIN')")
    @Profile("!prod")
    public ResponseEntity<Void> resetData(@PathVariable Long restaurantId) {
        internalService.cleanup(restaurantId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/audit-report/{restaurantId}")
    @Operation(summary = "Generates a simulation consistency report")
    public ResponseEntity<BusinessSimulatorService.SimulationAuditReport> getAuditReport(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(internalService.generateAuditReport(restaurantId));
    }

    @PostMapping("/bootstrap-kds/{restaurantId}")
    @Operation(summary = "Initializes KDS infrastructure for simulation")
    public ResponseEntity<Void> bootstrapKds(@PathVariable Long restaurantId) {
        internalService.bootstrapKds(restaurantId);
        return ResponseEntity.ok().build();
    }
}
