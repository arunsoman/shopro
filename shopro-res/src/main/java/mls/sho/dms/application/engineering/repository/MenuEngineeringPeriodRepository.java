package mls.sho.dms.application.engineering.repository;

import mls.sho.dms.application.engineering.entity.MenuEngineeringPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuEngineeringPeriodRepository extends JpaRepository<MenuEngineeringPeriod, Long> {
    List<MenuEngineeringPeriod> findAllByRestaurantIdOrderByStartDateDesc(Long restaurantId);
}
