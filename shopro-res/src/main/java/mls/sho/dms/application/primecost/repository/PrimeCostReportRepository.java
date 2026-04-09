package mls.sho.dms.application.primecost.repository;

import mls.sho.dms.application.primecost.entity.PrimeCostReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrimeCostReportRepository extends JpaRepository<PrimeCostReport, Long> {
    Optional<PrimeCostReport> findByRestaurantIdAndWeekStartDate(Long restaurantId, LocalDate weekStartDate);
    List<PrimeCostReport> findAllByRestaurantIdOrderByWeekStartDateDesc(Long restaurantId);
}
