package mls.sho.dms.application.primecost.repository;

import mls.sho.dms.application.primecost.entity.DailySalesEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailySalesEntryRepository extends JpaRepository<DailySalesEntry, Long> {
    Optional<DailySalesEntry> findByRestaurantIdAndSalesDate(Long restaurantId, LocalDate salesDate);
    List<DailySalesEntry> findAllByRestaurantIdAndSalesDateBetween(Long restaurantId, LocalDate from, LocalDate to);
}
