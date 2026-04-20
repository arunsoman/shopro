package mls.sho.dms.application.labor.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.primecost.service.LaborService;
import mls.sho.dms.application.primecost.dto.LaborDtos;
import mls.sho.dms.application.primecost.dto.LaborDtos.*;
import mls.sho.dms.application.primecost.entity.ScheduledShift;
import mls.sho.dms.application.primecost.entity.StaffLaborRecord;
import mls.sho.dms.entity.users.StaffShift;
import mls.sho.dms.entity.users.Staff;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Staff & Labor controller — exposes labor endpoints under /restaurants/{id}/labor/
 * which is the path the frontend expects.
 *
 * This is a facade that delegates to the same LaborService used by
 * /restaurants/{id}/prime-cost/labor/.
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/labor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffLaborController {

    private final LaborService laborService;

    @GetMapping("/employees")
    public ResponseEntity<List<StaffDto>> listStaff(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) Staff.EmployeeType type) {
        return ResponseEntity.ok(laborService.listStaff(restaurantId, type));
    }

    @PostMapping("/employees")
    public ResponseEntity<Staff> createStaff(
            @PathVariable Long restaurantId,
            @RequestBody CreateStaffRequest req) {
        return ResponseEntity.ok(laborService.createStaff(restaurantId, req));
    }

    @PutMapping("/employees/{staffId}")
    public ResponseEntity<Staff> updateStaff(
            @PathVariable Long restaurantId,
            @PathVariable UUID staffId,
            @RequestBody UpdateStaffRequest req) {
        return ResponseEntity.ok(laborService.updateStaff(restaurantId, staffId, req));
    }

    @PostMapping("/employees/{staffId}/deactivate")
    public ResponseEntity<Staff> deactivateStaff(
            @PathVariable Long restaurantId,
            @PathVariable UUID staffId) {
        return ResponseEntity.ok(laborService.deactivateStaff(restaurantId, staffId));
    }

    @GetMapping("/weekly-summary")
    public ResponseEntity<LaborWeekSummaryDto> getWeeklySummary(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(laborService.getWeeklySummary(restaurantId, weekStart));
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

    @PostMapping("/shifts")
    public ResponseEntity<ScheduledShift> upsertShift(
            @PathVariable Long restaurantId,
            @RequestBody UpsertShiftRequest req) {
        return ResponseEntity.ok(laborService.upsertShift(restaurantId, req));
    }

    @DeleteMapping("/shifts/{shiftId}")
    public ResponseEntity<Void> deleteShift(
            @PathVariable Long restaurantId,
            @PathVariable Long shiftId) {
        laborService.deleteShift(restaurantId, shiftId);
        return ResponseEntity.noContent().build();
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

    @PostMapping("/employees/{staffId}/clock-in")
    public ResponseEntity<StaffShift> clockIn(
            @PathVariable Long restaurantId,
            @PathVariable UUID staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime clockInTime) {
        return ResponseEntity.ok(laborService.clockIn(restaurantId, staffId, clockInTime));
    }

    @PostMapping("/employees/{staffId}/clock-out")
    public ResponseEntity<Map<String, Object>> clockOut(
            @PathVariable Long restaurantId,
            @PathVariable UUID staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime clockOutTime) {
        laborService.clockOut(restaurantId, staffId, clockOutTime);
        return ResponseEntity.ok(Map.of("clockedOut", true, "staffId", staffId, "time", clockOutTime.toString()));
    }

    @GetMapping("/clocked-in")
    public ResponseEntity<List<LaborDtos.ClockedInShiftDto>> getClockedInStaff(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(laborService.getClockedInStaff(restaurantId));
    }

    @GetMapping("/actual-labor")
    public ResponseEntity<List<LaborDtos.ClockedInShiftDto>> getActualLabor(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(laborService.getActualLabor(restaurantId, weekStart));
    }
}