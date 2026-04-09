package mls.sho.dms.application.primecost.repository;

import mls.sho.dms.application.primecost.entity.WeeklyBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface WeeklyBudgetRepository extends JpaRepository<WeeklyBudget, Long> {
    Optional<WeeklyBudget> findByRestaurantIdAndWeekStartDate(Long restaurantId, LocalDate weekStartDate);
}
