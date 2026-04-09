package mls.sho.dms.application.primecost.repository;

import mls.sho.dms.application.primecost.entity.EmployeeAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeAttendanceRepository extends JpaRepository<EmployeeAttendance, Long> {
    Optional<EmployeeAttendance> findByEmployeeIdAndStatus(Long employeeId, EmployeeAttendance.AttendanceStatus status);

    List<EmployeeAttendance> findAllByRestaurantIdAndStatus(Long restaurantId, EmployeeAttendance.AttendanceStatus status);

    @Modifying
    @Query("UPDATE EmployeeAttendance a SET a.status = 'COMPLETED', a.clockOutTime = :closeTime " +
           "WHERE a.restaurant.id = :restaurantId AND a.status = 'ACTIVE'")
    int closeAllActive(@Param("restaurantId") Long restaurantId, @Param("closeTime") LocalDateTime closeTime);
}
