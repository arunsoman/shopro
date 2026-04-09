package mls.sho.dms.application.primecost.repository;

import mls.sho.dms.application.primecost.entity.Employee;
import mls.sho.dms.application.primecost.entity.EmployeeLaborRecord;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeLaborRecordRepository extends JpaRepository<EmployeeLaborRecord, Long> {
    @EntityGraph(attributePaths = {"employee"})
    List<EmployeeLaborRecord> findAllByRestaurantIdAndWeekStartDate(Long restaurantId, LocalDate weekStartDate);
    Optional<EmployeeLaborRecord> findByEmployeeIdAndWeekStartDate(Long employeeId, LocalDate weekStartDate);
}
