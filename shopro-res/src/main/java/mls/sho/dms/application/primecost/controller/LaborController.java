package mls.sho.dms.application.primecost.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.primecost.service.LaborService;
import mls.sho.dms.application.primecost.dto.LaborDtos.*;
import mls.sho.dms.entity.users.Staff;
import mls.sho.dms.entity.users.StaffShift;
import mls.sho.dms.application.primecost.entity.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/prime-cost/labor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LaborController {

    private final LaborService laborService;

    // -- Employee Management -----------------------------------

    @PostMapping("/employees")
    public ResponseEntity<Staff> createStaff(@PathVariable Long restaurantId, @RequestBody CreateStaffRequest req) {
        return ResponseEntity.ok(laborService.createStaff(restaurantId, req));
    }

    @GetMapping("/employees")
    public ResponseEntity<List<StaffDto>> listStaff(
            @PathVariable Long restaurantId, 
            @RequestParam(required = false) Staff.EmployeeType type) {
        return ResponseEntity.ok(laborService.listStaff(restaurantId, type));
    }

    @PutMapping("/employees/{staffId}")
    public ResponseEntity<Staff> updateStaff(
            @PathVariable Long restaurantId, 
            @PathVariable UUID staffId, 
            @RequestBody UpdateStaffRequest req) {
        return ResponseEntity.ok(laborService.updateStaff(restaurantId, staffId, req));
    }

    // -- Labor Tracking -----------------------------------------

    @PostMapping("/employees/{staffId}/clock-in")
    public ResponseEntity<StaffShift> clockIn(
            @PathVariable Long restaurantId,
            @PathVariable UUID staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime clockInTime) {
        return ResponseEntity.ok(laborService.clockIn(restaurantId, staffId, clockInTime));
    }

    @PostMapping("/employees/{staffId}/clock-out")
    public ResponseEntity<StaffShift> clockOut(
            @PathVariable Long restaurantId,
            @PathVariable UUID staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime clockOutTime) {
        return ResponseEntity.ok(laborService.clockOut(restaurantId, staffId, clockOutTime));
    }

    @GetMapping("/weekly-summary")
    public ResponseEntity<LaborWeekSummaryDto> getWeeklySummary(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(laborService.getWeeklySummary(restaurantId, weekStart));
    }

    // -- Scheduling --------------------------------------------

    @PostMapping("/shifts")
    public ResponseEntity<ScheduledShift> upsertShift(@PathVariable Long restaurantId, @RequestBody UpsertShiftRequest req) {
        return ResponseEntity.ok(laborService.upsertShift(restaurantId, req));
    }

    @GetMapping("/schedule")
    public ResponseEntity<ScheduleSummaryDto> getScheduleSummary(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(laborService.getScheduleSummary(restaurantId, weekStart));
    }

    @GetMapping("/variance")
    public ResponseEntity<ScheduleVsActualDto> getScheduleVsActual(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(laborService.compareScheduleVsActual(restaurantId, weekStart));
    }

    // -- Additional stub endpoints ----------

    /**
     * Simulation-only: bulk-closes all ACTIVE attendance records for this restaurant.
     * Prevents "already clocked in" failures across multi-day simulation runs.
     */
    @PostMapping("/attendance/force-close-all")
    public ResponseEntity<Map<String, Object>> forceCloseAllActive(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime closeTime) {
        int closed = laborService.forceCloseAllActive(restaurantId, closeTime);
        return ResponseEntity.ok(Map.of("closed", closed));
    }

    @PostMapping("/employees/{staffId}/deactivate")
    public ResponseEntity<Staff> deactivateStaff(
            @PathVariable Long restaurantId,
            @PathVariable UUID staffId) {
        return ResponseEntity.ok(laborService.deactivateStaff(restaurantId, staffId));
    }

    @PostMapping("/employees/{staffId}/hours")
    public ResponseEntity<StaffLaborRecord> logStaffHours(
            @PathVariable Long restaurantId,
            @PathVariable UUID staffId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            @RequestBody(required = false) Map<String, Object> body) {
        LocalDate effective = weekStart != null ? weekStart : LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        return ResponseEntity.ok(laborService.logStaffHours(restaurantId, staffId, effective,
                body != null ? body : Map.of()));
    }

    @DeleteMapping("/shifts/{shiftId}")
    public ResponseEntity<Void> deleteShift(
            @PathVariable Long restaurantId,
            @PathVariable Long shiftId) {
        laborService.deleteShift(restaurantId, shiftId);
        return ResponseEntity.noContent().build();
    }
}
