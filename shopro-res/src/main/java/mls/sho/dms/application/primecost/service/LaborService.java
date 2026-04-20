package mls.sho.dms.application.primecost.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.primecost.entity.*;
import mls.sho.dms.application.primecost.repository.*;
import mls.sho.dms.application.primecost.dto.LaborDtos;
import mls.sho.dms.application.primecost.dto.LaborDtos.*;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.users.Staff;
import mls.sho.dms.entity.users.StaffShift;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.users.repo.StaffRepository;
import mls.sho.dms.application.users.repo.StaffShiftRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LaborService {

    private final StaffRepository staffRepository;
    private final StaffLaborRecordRepository laborRecordRepository;
    private final ScheduledShiftRepository shiftRepository;
    private final RestaurantRepository restaurantRepository;
    private final StaffShiftRepository staffShiftRepository;

    // -- Staff Management --------------------------------------

    @Transactional
    public Staff createStaff(Long restaurantId, CreateStaffRequest req) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        
        Staff staff = Staff.builder()
                .restaurantId(restaurantId)
                .displayName(req.getName())
                .employeeType(req.getEmployeeType())
                .hourlyRate(req.getHourlyRate())
                .annualSalary(req.getAnnualSalary())
                .role(mls.sho.dms.entity.users.StaffRole.LINE_COOK) // Default
                .pinHash("MIGRATED") // Placeholder
                .pinLength(4)
                .isActive(true)
                .build();
        return staffRepository.save(staff);
    }

    @Transactional(readOnly = true)
    public List<StaffDto> listStaff(Long restaurantId, Staff.EmployeeType type) {
        List<Staff> staffList = (type == null) 
            ? staffRepository.findByRestaurantIdAndIsActiveTrue(restaurantId)
            : staffListWithFilter(restaurantId, type);
        
        return staffList.stream().map(this::mapToStaffDto).collect(Collectors.toList());
    }

    private List<Staff> staffListWithFilter(Long restaurantId, Staff.EmployeeType type) {
        return staffRepository.findByRestaurantIdAndIsActiveTrue(restaurantId).stream()
                .filter(s -> s.getEmployeeType() == type)
                .collect(Collectors.toList());
    }

    @Transactional
    public Staff updateStaff(Long restaurantId, UUID staffId, UpdateStaffRequest req) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        
        if (!staff.getRestaurantId().equals(restaurantId)) {
            throw new RuntimeException("Unauthorized access to staff");
        }

        staff.setDisplayName(req.getName());
        if (req.getEmployeeType() != null) {
            staff.setEmployeeType(req.getEmployeeType());
        }
        staff.setHourlyRate(req.getHourlyRate());
        staff.setAnnualSalary(req.getAnnualSalary());
        staff.setIsActive(req.isActive());
        return staffRepository.save(staff);
    }

    // -- Weekly Hours tracking ---------------------------------

    @Transactional
    public StaffShift clockIn(Long restaurantId, UUID staffId, java.time.LocalDateTime clockInTime) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        
        // Ensure no existing active punch for this restaurant
        staffShiftRepository.findTopByStaffStaffIdAndRestaurantIdAndIsActiveTrueOrderByClockInDesc(staffId, restaurantId)
                .ifPresent(p -> { throw new IllegalStateException("Staff already clocked in at this restaurant"); });
        
        StaffShift shift = StaffShift.builder()
                .staff(staff)
                .restaurantId(restaurantId)
                .clockIn(clockInTime)
                .isActive(true)
                .build();
        
        return staffShiftRepository.save(shift);
    }

    @Transactional
    public StaffShift clockOut(Long restaurantId, UUID staffId, java.time.LocalDateTime clockOutTime) {
        StaffShift shift = staffShiftRepository
                .findTopByStaffStaffIdAndRestaurantIdAndIsActiveTrueOrderByClockInDesc(staffId, restaurantId)
                .orElseThrow(() -> new RuntimeException("No active shift found for staff at this restaurant"));

        shift.setClockOut(clockOutTime);
        shift.setIsActive(false);

        long mins = java.time.Duration.between(shift.getClockIn(), clockOutTime).toMinutes();
        shift.setDurationMinutes(mins);

        Staff staff = shift.getStaff();
        LocalDate clockInDate = shift.getClockIn().toLocalDate();
        LocalDate clockOutDate = clockOutTime.toLocalDate();
        LocalDate weekStart = clockInDate.with(java.time.DayOfWeek.MONDAY);

        StaffLaborRecord record = laborRecordRepository.findByStaffStaffIdAndWeekStartDate(staff.getStaffId(), weekStart)
                .orElseGet(() -> {
                    StaffLaborRecord r = new StaffLaborRecord();
                    r.setStaff(staff);
                    r.setRestaurant(restaurantRepository.findById(restaurantId).get());
                    r.setWeekStartDate(weekStart);
                    r.setRateSnapshot(staff.getHourlyRate());
                    return r;
                });

        if (clockInDate.equals(clockOutDate)) {
            // Same-day shift
            BigDecimal hours = BigDecimal.valueOf(mins).divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP);
            addHoursToDay(record, clockInDate.getDayOfWeek(), hours);
        } else {
            // Overnight shift: split hours at midnight so each calendar day gets its own hours
            java.time.LocalDateTime midnight = clockOutDate.atStartOfDay();
            long minsBeforeMidnight = java.time.Duration.between(shift.getClockIn(), midnight).toMinutes();
            long minsAfterMidnight = java.time.Duration.between(midnight, clockOutTime).toMinutes();
            BigDecimal hoursDay1 = BigDecimal.valueOf(minsBeforeMidnight).divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP);
            BigDecimal hoursDay2 = BigDecimal.valueOf(minsAfterMidnight).divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP);
            addHoursToDay(record, clockInDate.getDayOfWeek(), hoursDay1);
            addHoursToDay(record, clockOutDate.getDayOfWeek(), hoursDay2);
        }

        record.setUpdatedAt(java.time.LocalDateTime.now());
        laborRecordRepository.save(record);

        return staffShiftRepository.save(shift);
    }

    @Transactional(readOnly = true)
    public List<LaborDtos.ClockedInShiftDto> getClockedInStaff(Long restaurantId) {
        List<StaffShift> shifts = staffShiftRepository.findByRestaurantIdAndIsActiveTrue(restaurantId);
        return shifts.stream().map(shift -> {
            LaborDtos.ClockedInShiftDto dto = new LaborDtos.ClockedInShiftDto();
            dto.setId(shift.getShiftId());
            dto.setClockIn(shift.getClockIn() != null ? shift.getClockIn().toString() : null);
            dto.setIsActive(shift.getIsActive());
            dto.setDurationMinutes(shift.getDurationMinutes());
            
            LaborDtos.ClockedInShiftDto.StaffInfo staffInfo = new LaborDtos.ClockedInShiftDto.StaffInfo();
            if (shift.getStaff() != null) {
                staffInfo.setStaffId(shift.getStaff().getStaffId());
                staffInfo.setDisplayName(shift.getStaff().getDisplayName());
            }
            dto.setStaff(staffInfo);
            
            return dto;
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<LaborDtos.ClockedInShiftDto> getActualLabor(Long restaurantId, LocalDate weekStart) {
        LocalDateTime start = weekStart.atStartOfDay();
        LocalDateTime end = weekStart.plusDays(7).atStartOfDay();
        
        List<StaffShift> shifts = staffShiftRepository.findByRestaurantIdAndClockInBetween(restaurantId, start, end);
        
        return shifts.stream().map(shift -> {
            LaborDtos.ClockedInShiftDto dto = new LaborDtos.ClockedInShiftDto();
            dto.setId(shift.getShiftId());
            dto.setClockIn(shift.getClockIn() != null ? shift.getClockIn().toString() : null);
            dto.setClockOut(shift.getClockOut() != null ? shift.getClockOut().toString() : null);
            dto.setIsActive(shift.getIsActive());
            
            // Calculate duration if not set
            Long duration = shift.getDurationMinutes();
            if (duration == null && shift.getClockIn() != null && shift.getClockOut() != null) {
                duration = ChronoUnit.MINUTES.between(shift.getClockIn(), shift.getClockOut());
            }
            dto.setDurationMinutes(duration);
            
            // Calculate cost
            BigDecimal hourlyRate = shift.getStaff() != null ? shift.getStaff().getHourlyRate() : BigDecimal.ZERO;
            BigDecimal cost = BigDecimal.ZERO;
            if (duration != null && hourlyRate != null) {
                cost = hourlyRate.multiply(BigDecimal.valueOf(duration / 60.0));
            }
            dto.setTotalCost(cost);
            
            LaborDtos.ClockedInShiftDto.StaffInfo staffInfo = new LaborDtos.ClockedInShiftDto.StaffInfo();
            if (shift.getStaff() != null) {
                staffInfo.setStaffId(shift.getStaff().getStaffId());
                staffInfo.setDisplayName(shift.getStaff().getDisplayName());
                staffInfo.setRole(shift.getStaff().getRole() != null ? shift.getStaff().getRole().name() : null);
                staffInfo.setHourlyRate(shift.getStaff().getHourlyRate());
            }
            dto.setStaff(staffInfo);
            
            return dto;
        }).toList();
    }

    private void addHoursToDay(StaffLaborRecord record, java.time.DayOfWeek day, BigDecimal hours) {
        switch (day) {
            case MONDAY    -> record.setHoursMon(nvl(record.getHoursMon()).add(hours));
            case TUESDAY   -> record.setHoursTue(nvl(record.getHoursTue()).add(hours));
            case WEDNESDAY -> record.setHoursWed(nvl(record.getHoursWed()).add(hours));
            case THURSDAY  -> record.setHoursThu(nvl(record.getHoursThu()).add(hours));
            case FRIDAY    -> record.setHoursFri(nvl(record.getHoursFri()).add(hours));
            case SATURDAY  -> record.setHoursSat(nvl(record.getHoursSat()).add(hours));
            case SUNDAY    -> record.setHoursSun(nvl(record.getHoursSun()).add(hours));
        }
    }

    @Transactional(readOnly = true)
    public LaborWeekSummaryDto getWeeklySummary(Long restaurantId, LocalDate weekStart) {
        // 1. Fetch all relevant data
        List<Staff> allStaff = staffRepository.findByRestaurantIdAndIsActiveTrue(restaurantId);
        List<Staff> hourlyStaff = allStaff.stream()
                .filter(s -> s.getEmployeeType() == Staff.EmployeeType.HOURLY)
                .collect(Collectors.toList());
        
        Map<UUID, StaffLaborRecord> recordsMap = laborRecordRepository.findAllByRestaurantIdAndWeekStartDate(restaurantId, weekStart)
                .stream().collect(Collectors.toMap(r -> r.getStaff().getStaffId(), r -> r));
        
        LocalDate weekEnd = weekStart.plusDays(6);
        List<ScheduledShift> shifts = shiftRepository.findAllByRestaurantIdAndShiftDateBetween(restaurantId, weekStart, weekEnd);
        Map<UUID, List<ScheduledShift>> shiftsMap = shifts.stream().collect(Collectors.groupingBy(s -> s.getStaff().getStaffId()));

        // 2. Build per-staff summaries
        List<StaffLaborSummaryDto> staffSummaries = hourlyStaff.stream().map(st -> {
            StaffLaborRecord record = recordsMap.get(st.getStaffId());
            List<ScheduledShift> empShifts = shiftsMap.getOrDefault(st.getStaffId(), new ArrayList<>());
            
            StaffLaborSummaryDto dto = (record != null) ? calcStaffLaborSummary(record) : new StaffLaborSummaryDto();
            dto.setStaff(mapToStaffDto(st));
            dto.setStaffId(st.getStaffId());

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
        BigDecimal totalHourly = staffSummaries.stream()
                .map(e -> nvl(e.getTotalCost()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalScheduled = staffSummaries.stream()
                .map(e -> nvl(e.getScheduledCost()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalHours = staffSummaries.stream()
                .map(e -> nvl(e.getTotalHours()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Staff> mgmt = allStaff.stream()
                .filter(s -> s.getEmployeeType() == Staff.EmployeeType.MANAGEMENT)
                .collect(Collectors.toList());
        
        BigDecimal totalMgmt = mgmt.stream()
                .map(e -> e.getAnnualSalary() != null ? e.getAnnualSalary().divide(BigDecimal.valueOf(52), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal benefitsRate = BigDecimal.valueOf(0.22);
        BigDecimal totalLabor = totalHourly.add(totalMgmt);
        BigDecimal benefits = totalLabor.multiply(benefitsRate).setScale(2, RoundingMode.HALF_UP);
        
        LaborWeekSummaryDto summary = new LaborWeekSummaryDto();
        summary.setWeekStartDate(weekStart);
        summary.setStaffList(staffSummaries);
        summary.setTotalHourlyLaborCost(totalHourly);
        summary.setTotalManagementLaborCost(totalMgmt);
        summary.setEstimatedBenefitsCost(benefits);
        summary.setTotalLaborCost(totalLabor.add(benefits));
        summary.setTotalLaborVariance(totalHourly.subtract(totalScheduled)); // Variance of hourly labor
        summary.setTotalHours(totalHours);
        
        return summary;
    }

    private StaffLaborSummaryDto calcStaffLaborSummary(StaffLaborRecord record) {
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
        
        StaffLaborSummaryDto dto = new StaffLaborSummaryDto();
        dto.setStaffId(record.getStaff().getStaffId());
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
            Staff staff = staffRepository.findById(req.getStaffId())
                    .orElseThrow(() -> new RuntimeException("Staff not found"));
            shift.setStaff(staff);
            shift.setRestaurant(restaurantRepository.findById(restaurantId).get());
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
     * Simulation-only: bulk-closes all ACTIVE attendance records for a restaurant.
     * Used by the simulator to clean up stale clock-ins at the start of each day
     * (handles both missed clock-outs from a prior run AND from the previous sim day).
     */
    @Transactional
    public int forceCloseAllActive(Long restaurantId, java.time.LocalDateTime closeTime) {
        return staffShiftRepository.closeAllActive(restaurantId, closeTime);
    }

    // -- Additional Operations ---------------------------------

    @Transactional
    public Staff deactivateStaff(Long restaurantId, UUID staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        if (!staff.getRestaurantId().equals(restaurantId)) {
            throw new RuntimeException("Unauthorized access to staff");
        }
        staff.setIsActive(false);
        return staffRepository.save(staff);
    }

    @Transactional
    public StaffLaborRecord logStaffHours(Long restaurantId, UUID staffId,
                                                  LocalDate weekStart, Map<String, Object> body) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        StaffLaborRecord record = laborRecordRepository
                .findByStaffStaffIdAndWeekStartDate(staff.getStaffId(), weekStart)
                .orElseGet(() -> {
                    StaffLaborRecord r = new StaffLaborRecord();
                    r.setStaff(staff);
                    r.setRestaurant(restaurantRepository.findById(restaurantId).get());
                    r.setWeekStartDate(weekStart);
                    r.setRateSnapshot(staff.getHourlyRate());
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

    private StaffDto mapToStaffDto(Staff e) {
        StaffDto dto = new StaffDto();
        dto.setId(e.getStaffId());
        dto.setStaffName(e.getDisplayName());
        dto.setRole(e.getRole() != null ? e.getRole().name() : null);
        dto.setEmployeeType(e.getEmployeeType());
        dto.setHourlyRate(e.getHourlyRate());
        dto.setAnnualSalary(e.getAnnualSalary());
        dto.setActive(e.getIsActive());
        return dto;
    }

    private ScheduledShiftDto mapToShiftDto(ScheduledShift s) {
        ScheduledShiftDto dto = new ScheduledShiftDto();
        dto.setId(s.getId());
        dto.setStaffId(s.getStaff().getStaffId());
        dto.setStaffName(s.getStaff().getDisplayName());
        dto.setShiftDate(s.getShiftDate());
        dto.setStartTime(s.getStartTime());
        dto.setEndTime(s.getEndTime());
        dto.setStation(s.getStation());
        dto.setNotes(s.getNotes());
        
        long mins = Duration.between(s.getStartTime(), s.getEndTime()).toMinutes();
        BigDecimal hours = BigDecimal.valueOf(mins).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        dto.setScheduledHours(hours);
        
        BigDecimal rate = s.getStaff().getHourlyRate() != null ? s.getStaff().getHourlyRate() : BigDecimal.ZERO;
        dto.setScheduledCost(hours.multiply(rate).setScale(2, RoundingMode.HALF_UP));
        return dto;
    }

    private BigDecimal nvl(BigDecimal val) {
        return val == null ? BigDecimal.ZERO : val;
    }
}
