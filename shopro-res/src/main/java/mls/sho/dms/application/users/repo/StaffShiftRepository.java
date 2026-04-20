package mls.sho.dms.application.users.repo;

import mls.sho.dms.entity.users.StaffShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

@Repository
public interface StaffShiftRepository extends JpaRepository<StaffShift, UUID> {

    Optional<StaffShift> findTopByStaffStaffIdAndIsActiveTrueOrderByClockInDesc(UUID staffId);

    Optional<StaffShift> findTopByStaffStaffIdAndRestaurantIdAndIsActiveTrueOrderByClockInDesc(UUID staffId, Long restaurantId);

    List<StaffShift> findByStaffStaffIdOrderByClockInDesc(UUID staffId);

    List<StaffShift> findByRestaurantIdAndIsActiveTrue(Long restaurantId);

    List<StaffShift> findByRestaurantIdAndClockInBetween(Long restaurantId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT CAST(s.clockIn AS date), SUM(s.durationMinutes), " +
           "SUM(CAST(s.durationMinutes AS double) / 60.0 * c.baseHourlyRate) " +
           "FROM StaffShift s JOIN StaffCompensation c ON s.staff.staffId = c.staff.staffId " +
           "WHERE s.restaurantId = :restaurantId AND s.isActive = false " +
           "AND s.clockIn BETWEEN :start AND :end " +
           "GROUP BY CAST(s.clockIn AS date)")
    List<Object[]> findDailyLaborStats(Long restaurantId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT CAST(s.clockIn AS date), SUM(s.durationMinutes), " +
           "SUM(CAST(s.durationMinutes AS double) / 60.0 * c.baseHourlyRate) " +
           "FROM StaffShift s JOIN StaffCompensation c ON s.staff.staffId = c.staff.staffId " +
           "WHERE s.isActive = false " +
           "AND s.clockIn BETWEEN :start AND :end " +
           "GROUP BY CAST(s.clockIn AS date)")
    List<Object[]> findDailyLaborStatsGlobal(LocalDateTime start, LocalDateTime end);

    @Query("SELECT s.staff.staffId, s.staff.displayName, SUM(s.durationMinutes), " +
           "c.standardWeeklyHours, c.overtimeRate, c.baseHourlyRate " +
           "FROM StaffShift s JOIN StaffCompensation c ON s.staff.staffId = c.staff.staffId " +
           "WHERE s.restaurantId = :restaurantId AND s.isActive = false " +
           "AND s.clockIn BETWEEN :start AND :end " +
           "GROUP BY s.staff.staffId, s.staff.displayName, c.standardWeeklyHours, c.overtimeRate, c.baseHourlyRate")
    List<Object[]> findWeeklyStaffLaborStats(Long restaurantId, LocalDateTime start, LocalDateTime end);

    @Modifying
    @Query("UPDATE StaffShift s SET s.isActive = false, s.clockOut = :closeTime, " +
           "s.durationMinutes = CAST(FUNCTION('floor', (CAST(:closeTime AS double) - CAST(s.clockIn AS double)) / 60.0) AS Long) " +
           "WHERE s.restaurantId = :restaurantId AND s.isActive = true")
    int closeAllActive(@Param("restaurantId") Long restaurantId, @Param("closeTime") LocalDateTime closeTime);
}
