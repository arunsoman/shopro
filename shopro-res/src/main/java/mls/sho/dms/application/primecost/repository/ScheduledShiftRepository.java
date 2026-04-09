package mls.sho.dms.application.primecost.repository;

import mls.sho.dms.application.primecost.entity.ScheduledShift;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduledShiftRepository extends JpaRepository<ScheduledShift, Long> {
    @EntityGraph(attributePaths = {"employee"})
    List<ScheduledShift> findAllByRestaurantIdAndShiftDateBetween(Long restaurantId, LocalDate from, LocalDate to);
    List<ScheduledShift> findAllByRestaurantIdAndShiftDate(Long restaurantId, LocalDate shiftDate);
}
