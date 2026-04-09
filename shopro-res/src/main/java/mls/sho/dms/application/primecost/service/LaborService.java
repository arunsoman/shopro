package mls.sho.dms.application.primecost.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.primecost.entity.*;
import mls.sho.dms.application.primecost.repository.*;
import mls.sho.dms.application.primecost.dto.LaborDtos.*;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LaborService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeLaborRecordRepository laborRecordRepository;
    private final ScheduledShiftRepository shiftRepository;
    private final RestaurantRepository restaurantRepository;
    private final EmployeeAttendanceRepository attendanceRepository;

    // -- Employee Management -----------------------------------

    @Transactional
    public Employee createEmployee(Long restaurantId, CreateEmployeeRequest req) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        
        Employee employee = new Employee();
        employee.setRestaurant(restaurant);
        employee.setName(req.getName());
        employee.setEmployeeType(req.getEmployeeType());
        employee.setHourlyRate(req.getHourlyRate());
        employee.setAnnualSalary(req.getAnnualSalary());
        return employeeRepository.save(employee);
    }

    @Transactional(readOnly = true)
    public List<EmployeeDto> listEmployees(Long restaurantId, Employee.EmployeeType type) {
        List<Employee> employees = (type == null) 
            ? employeeRepository.findAllByRestaurantId(restaurantId)
            : employeeRepository.findAllByRestaurantIdAndEmployeeTypeAndActive(restaurantId, type, true);
        
        return employees.stream().map(this::mapToEmployeeDto).collect(Collectors.toList());
    }

    @Transactional
    public Employee updateEmployee(Long restaurantId, Long employeeId, UpdateEmployeeRequest req) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        if (!employee.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException("Unhauthorized access to employee");
        }

        employee.setName(req.getName());
        employee.setHourlyRate(req.getHourlyRate());
        employee.setAnnualSalary(req.getAnnualSalary());
        employee.setActive(req.isActive());
        return employeeRepository.save(employee);
    }

    // -- Weekly Hours tracking ---------------------------------

    @Transactional
    public EmployeeAttendance clockIn(Long restaurantId, Long employeeId, java.time.LocalDateTime clockInTime) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        // Ensure no existing active punch
        attendanceRepository.findByEmployeeIdAndStatus(employeeId, EmployeeAttendance.AttendanceStatus.ACTIVE)
                .ifPresent(p -> { throw new IllegalStateException("Employee already clocked in"); });
        
        EmployeeAttendance attendance = new EmployeeAttendance();
        attendance.setEmployee(employee);
        attendance.setRestaurant(employee.getRestaurant());
        attendance.setClockInTime(clockInTime);
        attendance.setStatus(EmployeeAttendance.AttendanceStatus.ACTIVE);
        
        return attendanceRepository.save(attendance);
    }

    @Transactional
    public EmployeeAttendance clockOut(Long restaurantId, Long employeeId, java.time.LocalDateTime clockOutTime) {
        EmployeeAttendance attendance = attendanceRepository.findByEmployeeIdAndStatus(employeeId, EmployeeAttendance.AttendanceStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active clock-in found for employee"));
        
        attendance.setClockOutTime(clockOutTime);
        attendance.setStatus(EmployeeAttendance.AttendanceStatus.COMPLETED);
        
        // Update the weekly labor record aggregation
        Employee employee = attendance.getEmployee();
        LocalDate shiftDate = attendance.getClockInTime().toLocalDate();
        LocalDate weekStart = shiftDate.with(java.time.DayOfWeek.MONDAY);
        
        EmployeeLaborRecord record = laborRecordRepository.findByEmployeeIdAndWeekStartDate(employee.getId(), weekStart)
                .orElseGet(() -> {
                    EmployeeLaborRecord r = new EmployeeLaborRecord();
                    r.setEmployee(employee);
                    r.setRestaurant(employee.getRestaurant());
                    r.setWeekStartDate(weekStart);
                    r.setRateSnapshot(employee.getHourlyRate());
                    return r;
                });
        
        long mins = java.time.Duration.between(attendance.getClockInTime(), clockOutTime).toMinutes();
        BigDecimal hours = BigDecimal.valueOf(mins).divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP);
        
        switch (shiftDate.getDayOfWeek()) {
            case MONDAY -> record.setHoursMon(nvl(record.getHoursMon()).add(hours));
            case TUESDAY -> record.setHoursTue(nvl(record.getHoursTue()).add(hours));
            case WEDNESDAY -> record.setHoursWed(nvl(record.getHoursWed()).add(hours));
            case THURSDAY -> record.setHoursThu(nvl(record.getHoursThu()).add(hours));
            case FRIDAY -> record.setHoursFri(nvl(record.getHoursFri()).add(hours));
            case SATURDAY -> record.setHoursSat(nvl(record.getHoursSat()).add(hours));
            case SUNDAY -> record.setHoursSun(nvl(record.getHoursSun()).add(hours));
        }
        
        record.setUpdatedAt(java.time.LocalDateTime.now());
        laborRecordRepository.save(record);
        
        return attendanceRepository.save(attendance);
    }

    @Transactional(readOnly = true)
    public LaborWeekSummaryDto getWeeklySummary(Long restaurantId, LocalDate weekStart) {
        // 1. Fetch all relevant data
        List<Employee> hourlyEmployees = employeeRepository.findAllByRestaurantIdAndEmployeeTypeAndActive(restaurantId, Employee.EmployeeType.HOURLY, true);
        Map<Long, EmployeeLaborRecord> recordsMap = laborRecordRepository.findAllByRestaurantIdAndWeekStartDate(restaurantId, weekStart)
                .stream().collect(Collectors.toMap(r -> r.getEmployee().getId(), r -> r));
        
        LocalDate weekEnd = weekStart.plusDays(6);
        List<ScheduledShift> shifts = shiftRepository.findAllByRestaurantIdAndShiftDateBetween(restaurantId, weekStart, weekEnd);
        Map<Long, List<ScheduledShift>> shiftsMap = shifts.stream().collect(Collectors.groupingBy(s -> s.getEmployee().getId()));

        // 2. Build per-employee summaries
        List<EmployeeLaborSummaryDto> employees = hourlyEmployees.stream().map(emp -> {
            EmployeeLaborRecord record = recordsMap.get(emp.getId());
            List<ScheduledShift> empShifts = shiftsMap.getOrDefault(emp.getId(), new ArrayList<>());
            
            EmployeeLaborSummaryDto dto = (record != null) ? calcEmployeeLaborSummary(record) : new EmployeeLaborSummaryDto();
            dto.setEmployee(mapToEmployeeDto(emp));
            dto.setEmployeeId(emp.getId());

            // Add schedule data
            BigDecimal schedHrs = empShifts.stream()
                    .map(this::mapToShiftDto)
                    .map(ScheduledShiftDto::getScheduledHours)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal schedCost = empShifts.stream()
                    .map(this::mapToShiftDto)
                    .map(ScheduledShiftDto::getScheduledCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            dto.setScheduledHours(schedHrs);
            dto.setScheduledCost(schedCost);
            
            // Calculate deltas
            dto.setHoursDelta(nvl(dto.getTotalHours()).subtract(schedHrs));
            dto.setCostDelta(nvl(dto.getTotalCost()).subtract(schedCost));
            
            return dto;
        }).collect(Collectors.toList());

        // 3. Aggregate totals
        BigDecimal totalHourly = employees.stream()
                .map(e -> nvl(e.getTotalCost()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalScheduled = employees.stream()
                .map(e -> nvl(e.getScheduledCost()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalHours = employees.stream()
                .map(e -> nvl(e.getTotalHours()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Employee> mgmt = employeeRepository.findAllByRestaurantIdAndEmployeeTypeAndActive(restaurantId, Employee.EmployeeType.MANAGEMENT, true);
        BigDecimal totalMgmt = mgmt.stream()
                .map(e -> e.getAnnualSalary() != null ? e.getAnnualSalary().divide(BigDecimal.valueOf(52), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal benefitsRate = BigDecimal.valueOf(0.22);
        BigDecimal totalLabor = totalHourly.add(totalMgmt);
        BigDecimal benefits = totalLabor.multiply(benefitsRate).setScale(2, RoundingMode.HALF_UP);
        
        LaborWeekSummaryDto summary = new LaborWeekSummaryDto();
        summary.setWeekStartDate(weekStart);
        summary.setEmployees(employees);
        summary.setTotalHourlyLaborCost(totalHourly);
        summary.setTotalManagementLaborCost(totalMgmt);
        summary.setEstimatedBenefitsCost(benefits);
        summary.setTotalLaborCost(totalLabor.add(benefits));
        summary.setTotalLaborVariance(totalHourly.subtract(totalScheduled)); // Variance of hourly labor
        summary.setTotalHours(totalHours);
        
        return summary;
    }

    private EmployeeLaborSummaryDto calcEmployeeLaborSummary(EmployeeLaborRecord record) {
        BigDecimal mon = nvl(record.getHoursMon());
        BigDecimal tue = nvl(record.getHoursTue());
        BigDecimal wed = nvl(record.getHoursWed());
        BigDecimal thu = nvl(record.getHoursThu());
        BigDecimal fri = nvl(record.getHoursFri());
        BigDecimal sat = nvl(record.getHoursSat());
        BigDecimal sun = nvl(record.getHoursSun());
        
        BigDecimal totalHours = mon.add(tue).add(wed).add(thu).add(fri).add(sat).add(sun);
        BigDecimal rate = nvl(record.getRateSnapshot());
        
        // Basic daily costs
        List<BigDecimal> dailyHours = List.of(mon, tue, wed, thu, fri, sat, sun);
        List<BigDecimal> dailyCosts = dailyHours.stream()
                .map(h -> h.multiply(rate).setScale(2, RoundingMode.HALF_UP))
                .collect(Collectors.toList());
        
        BigDecimal totalCost = totalHours.multiply(rate);
        
        // Overtime premium (>40hrs per week)
        if (totalHours.compareTo(BigDecimal.valueOf(40)) > 0) {
            BigDecimal otHours = totalHours.subtract(BigDecimal.valueOf(40));
            BigDecimal otPremium = otHours.multiply(rate).multiply(BigDecimal.valueOf(0.5));
            totalCost = totalCost.add(otPremium);
        }
        
        EmployeeLaborSummaryDto dto = new EmployeeLaborSummaryDto();
        dto.setEmployeeId(record.getEmployee().getId());
        dto.setTotalHours(totalHours);
        dto.setTotalCost(totalCost.setScale(2, RoundingMode.HALF_UP));
        dto.setDailyHours(dailyHours);
        dto.setDailyCosts(dailyCosts);
        
        return dto;
    }

    // -- Scheduling --------------------------------------------

    @Transactional
    public ScheduledShift upsertShift(Long restaurantId, UpsertShiftRequest req) {
        ScheduledShift shift = (req.getId() != null) 
            ? shiftRepository.findById(req.getId()).orElse(new ScheduledShift())
            : new ScheduledShift();
        
        if (shift.getId() == null) {
            Employee employee = employeeRepository.findById(req.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
            shift.setEmployee(employee);
            shift.setRestaurant(employee.getRestaurant());
        }
        
        shift.setShiftDate(req.getShiftDate());
        shift.setStartTime(req.getStartTime());
        shift.setEndTime(req.getEndTime());
        shift.setStation(req.getStation());
        shift.setNotes(req.getNotes());
        
        return shiftRepository.save(shift);
    }

    @Transactional(readOnly = true)
    public ScheduleSummaryDto getScheduleSummary(Long restaurantId, LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        List<ScheduledShift> shifts = shiftRepository.findAllByRestaurantIdAndShiftDateBetween(restaurantId, weekStart, weekEnd);
        
        List<ScheduledShiftDto> dtos = shifts.stream().map(this::mapToShiftDto).collect(Collectors.toList());
        
        BigDecimal totalHours = dtos.stream().map(ScheduledShiftDto::getScheduledHours).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCost = dtos.stream().map(ScheduledShiftDto::getScheduledCost).reduce(BigDecimal.ZERO, BigDecimal::add);
        
        ScheduleSummaryDto dto = new ScheduleSummaryDto();
        dto.setWeekStartDate(weekStart);
        dto.setShifts(dtos);
        dto.setTotalScheduledHours(totalHours);
        dto.setTotalScheduledCost(totalCost);
        return dto;
    }

    @Transactional(readOnly = true)
    public ScheduleVsActualDto compareScheduleVsActual(Long restaurantId, LocalDate weekStart) {
        ScheduleSummaryDto schedule = getScheduleSummary(restaurantId, weekStart);
        LaborWeekSummaryDto actual = getWeeklySummary(restaurantId, weekStart);
        
        BigDecimal scheduledLabor = schedule.getTotalScheduledCost();
        BigDecimal actualLabor = actual.getTotalHourlyLaborCost();
        BigDecimal variance = actualLabor.subtract(scheduledLabor);
        
        ScheduleVsActualDto dto = new ScheduleVsActualDto();
        dto.setWeekStartDate(weekStart);
        dto.setScheduledLabor(scheduledLabor);
        dto.setActualLabor(actualLabor);
        dto.setVariance(variance);
        dto.setVarianceStatus(variance.compareTo(BigDecimal.ZERO) <= 0 ? "FAVORABLE" : "UNFAVORABLE");
        return dto;
    }

    // -- Simulation helpers ------------------------------------

    /**
     * Bulk-closes all ACTIVE attendance records for a restaurant.
     * Used by the simulator to clean up stale clock-ins at the start of each day
     * (handles both missed clock-outs from a prior run AND from the previous sim day).
     */
    @Transactional
    public int forceCloseAllActive(Long restaurantId, java.time.LocalDateTime closeTime) {
        return attendanceRepository.closeAllActive(restaurantId, closeTime);
    }

    // -- Additional Operations ---------------------------------

    @Transactional
    public Employee deactivateEmployee(Long restaurantId, Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        if (!employee.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException("Unauthorized access to employee");
        }
        employee.setActive(false);
        return employeeRepository.save(employee);
    }

    @Transactional
    public EmployeeLaborRecord logEmployeeHours(Long restaurantId, Long employeeId,
                                                LocalDate weekStart, Map<String, Object> body) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        EmployeeLaborRecord record = laborRecordRepository
                .findByEmployeeIdAndWeekStartDate(employee.getId(), weekStart)
                .orElseGet(() -> {
                    EmployeeLaborRecord r = new EmployeeLaborRecord();
                    r.setEmployee(employee);
                    r.setRestaurant(employee.getRestaurant());
                    r.setWeekStartDate(weekStart);
                    r.setRateSnapshot(employee.getHourlyRate());
                    return r;
                });

        if (body.containsKey("monday"))    record.setHoursMon(new BigDecimal(body.get("monday").toString()));
        if (body.containsKey("tuesday"))   record.setHoursTue(new BigDecimal(body.get("tuesday").toString()));
        if (body.containsKey("wednesday")) record.setHoursWed(new BigDecimal(body.get("wednesday").toString()));
        if (body.containsKey("thursday"))  record.setHoursThu(new BigDecimal(body.get("thursday").toString()));
        if (body.containsKey("friday"))    record.setHoursFri(new BigDecimal(body.get("friday").toString()));
        if (body.containsKey("saturday"))  record.setHoursSat(new BigDecimal(body.get("saturday").toString()));
        if (body.containsKey("sunday"))    record.setHoursSun(new BigDecimal(body.get("sunday").toString()));
        record.setUpdatedAt(java.time.LocalDateTime.now());

        return laborRecordRepository.save(record);
    }

    @Transactional
    public void deleteShift(Long restaurantId, Long shiftId) {
        ScheduledShift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
        if (!shift.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException("Unauthorized access to shift");
        }
        shiftRepository.deleteById(shiftId);
    }

    // -- Helpers -----------------------------------------------

    private EmployeeDto mapToEmployeeDto(Employee e) {
        EmployeeDto dto = new EmployeeDto();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setEmployeeType(e.getEmployeeType());
        dto.setHourlyRate(e.getHourlyRate());
        dto.setAnnualSalary(e.getAnnualSalary());
        dto.setActive(e.isActive());
        return dto;
    }

    private ScheduledShiftDto mapToShiftDto(ScheduledShift s) {
        ScheduledShiftDto dto = new ScheduledShiftDto();
        dto.setId(s.getId());
        dto.setEmployeeId(s.getEmployee().getId());
        dto.setEmployeeName(s.getEmployee().getName());
        dto.setShiftDate(s.getShiftDate());
        dto.setStartTime(s.getStartTime());
        dto.setEndTime(s.getEndTime());
        dto.setStation(s.getStation());
        dto.setNotes(s.getNotes());
        
        long mins = Duration.between(s.getStartTime(), s.getEndTime()).toMinutes();
        BigDecimal hours = BigDecimal.valueOf(mins).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        dto.setScheduledHours(hours);
        
        BigDecimal rate = s.getEmployee().getHourlyRate() != null ? s.getEmployee().getHourlyRate() : BigDecimal.ZERO;
        dto.setScheduledCost(hours.multiply(rate).setScale(2, RoundingMode.HALF_UP));
        return dto;
    }

    private BigDecimal nvl(BigDecimal val) {
        return val == null ? BigDecimal.ZERO : val;
    }
}
