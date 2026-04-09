package mls.sho.dms.application.primecost.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.primecost.service.LaborService;
import mls.sho.dms.application.primecost.dto.LaborDtos.*;
import mls.sho.dms.application.primecost.entity.Employee;
import mls.sho.dms.application.primecost.entity.EmployeeAttendance;
import mls.sho.dms.application.primecost.entity.EmployeeLaborRecord;
import mls.sho.dms.application.primecost.entity.ScheduledShift;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/labor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LaborController {

    private final LaborService laborService;

    // -- Employee Management -----------------------------------

    @PostMapping("/employees")
    public ResponseEntity<Employee> createEmployee(@PathVariable Long restaurantId, @RequestBody CreateEmployeeRequest req) {
        return ResponseEntity.ok(laborService.createEmployee(restaurantId, req));
    }

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeDto>> listEmployees(
            @PathVariable Long restaurantId, 
            @RequestParam(required = false) Employee.EmployeeType type) {
        return ResponseEntity.ok(laborService.listEmployees(restaurantId, type));
    }

    @PutMapping("/employees/{employeeId}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long restaurantId, 
            @PathVariable Long employeeId, 
            @RequestBody UpdateEmployeeRequest req) {
        return ResponseEntity.ok(laborService.updateEmployee(restaurantId, employeeId, req));
    }

    // -- Labor Tracking -----------------------------------------

    @PostMapping("/employees/{employeeId}/clock-in")
    public ResponseEntity<EmployeeAttendance> clockIn(
            @PathVariable Long restaurantId,
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime clockInTime) {
        return ResponseEntity.ok(laborService.clockIn(restaurantId, employeeId, clockInTime));
    }

    @PostMapping("/employees/{employeeId}/clock-out")
    public ResponseEntity<EmployeeAttendance> clockOut(
            @PathVariable Long restaurantId,
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime clockOutTime) {
        return ResponseEntity.ok(laborService.clockOut(restaurantId, employeeId, clockOutTime));
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

    @PostMapping("/employees/{employeeId}/deactivate")
    public ResponseEntity<Employee> deactivateEmployee(
            @PathVariable Long restaurantId,
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(laborService.deactivateEmployee(restaurantId, employeeId));
    }

    @PostMapping("/employees/{employeeId}/hours")
    public ResponseEntity<EmployeeLaborRecord> logEmployeeHours(
            @PathVariable Long restaurantId,
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            @RequestBody(required = false) Map<String, Object> body) {
        LocalDate effective = weekStart != null ? weekStart : LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        return ResponseEntity.ok(laborService.logEmployeeHours(restaurantId, employeeId, effective,
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
