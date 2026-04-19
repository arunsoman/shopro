package mls.sho.dms.application.primecost.repository;

import mls.sho.dms.application.primecost.entity.StaffLaborRecord;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StaffLaborRecordRepository extends JpaRepository<StaffLaborRecord, Long> {
    @EntityGraph(attributePaths = {"staff"})
    List<StaffLaborRecord> findAllByRestaurantIdAndWeekStartDate(Long restaurantId, LocalDate weekStartDate);
    Optional<StaffLaborRecord> findByStaffStaffIdAndWeekStartDate(UUID staffId, LocalDate weekStartDate);
}
