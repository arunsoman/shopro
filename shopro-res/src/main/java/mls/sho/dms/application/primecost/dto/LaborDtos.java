package mls.sho.dms.application.primecost.dto;

import lombok.Data;
import mls.sho.dms.entity.users.Staff;
import mls.sho.dms.common.enums.KitchenStationType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
public class LaborDtos {

    @Data public static class CreateStaffRequest {
        private String name;
        private Staff.EmployeeType employeeType;
        private BigDecimal hourlyRate;
        private BigDecimal annualSalary;
    }

    @Data public static class UpdateStaffRequest {
        private String name;
        private Staff.EmployeeType employeeType;
        private BigDecimal hourlyRate;
        private BigDecimal annualSalary;
        private boolean active;
    }

    @Data public static class StaffDto {
        private UUID id;
        private String staffName;
        private String role;
        private Staff.EmployeeType employeeType;
        private BigDecimal hourlyRate;
        private BigDecimal annualSalary;
        private boolean active;
    }

    @Data public static class WeeklyHoursRequest {
        private BigDecimal hoursMon;
        private BigDecimal hoursTue;
        private BigDecimal hoursWed;
        private BigDecimal hoursThu;
        private BigDecimal hoursFri;
        private BigDecimal hoursSat;
        private BigDecimal hoursSun;
    }

    @Data public static class LaborWeekSummaryDto {
        private LocalDate weekStartDate;
        private List<StaffLaborSummaryDto> staffList;
        private BigDecimal totalHourlyLaborCost;
        private BigDecimal totalManagementLaborCost;
        private BigDecimal estimatedBenefitsCost;
        private BigDecimal totalLaborCost;
        private BigDecimal totalLaborVariance; // actual - scheduled
        private BigDecimal totalHours;
    }

    @Data public static class StaffLaborSummaryDto {
        private UUID staffId;
        private StaffDto staff; 
        private BigDecimal totalHours;
        private BigDecimal totalCost;
        private BigDecimal scheduledHours;
        private BigDecimal scheduledCost;
        private BigDecimal hoursDelta;
        private BigDecimal costDelta;
        private List<BigDecimal> dailyHours;
        private List<BigDecimal> dailyCosts;
    }

    @Data public static class UpsertShiftRequest {
        private Long id; // null for new
        private UUID staffId;
        private LocalDate shiftDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private KitchenStationType station;
        private String notes;
    }

    @Data public static class ScheduledShiftDto {
        private Long id;
        private UUID staffId;
        private String staffName;
        private LocalDate shiftDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private KitchenStationType station;
        private String notes;
        private BigDecimal scheduledHours;
        private BigDecimal scheduledCost;
    }

    @Data public static class ScheduleSummaryDto {
        private LocalDate weekStartDate;
        private List<ScheduledShiftDto> shifts;
        private BigDecimal totalScheduledHours;
        private BigDecimal totalScheduledCost;
    }

    @Data public static class ScheduleVsActualDto {
        private LocalDate weekStartDate;
        private BigDecimal scheduledLabor;
        private BigDecimal actualLabor;
        private BigDecimal variance;
        private String varianceStatus; // FAVORABLE / UNFAVORABLE
    }

    @Data public static class SalesPerLaborHourDto {
        private LocalDate weekStartDate;
        private List<DailyMetricDto> dailyMetrics;
        private BigDecimal weeklyAverage;
    }

    @Data public static class LaborCostPerCoverDto {
        private LocalDate weekStartDate;
        private List<DailyMetricDto> dailyMetrics;
        private BigDecimal weeklyAverage;
    }

    @Data public static class DailyMetricDto {
        private LocalDate date;
        private BigDecimal value;
    }

    @Data public static class ClockedInShiftDto {
        private UUID id;
        private StaffInfo staff;
        private String clockIn;
        private String clockOut;
        private Boolean isActive;
        private Long durationMinutes;
        private BigDecimal totalCost;

        @Data public static class StaffInfo {
            private UUID staffId;
            private String displayName;
            private String role;
            private BigDecimal hourlyRate;
        }
    }
}
