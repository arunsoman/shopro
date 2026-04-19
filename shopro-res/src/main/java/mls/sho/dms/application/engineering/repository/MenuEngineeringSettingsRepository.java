package mls.sho.dms.application.engineering.repository;

import mls.sho.dms.application.engineering.entity.MenuEngineeringSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MenuEngineeringSettingsRepository extends JpaRepository<MenuEngineeringSettings, Long> {
    Optional<MenuEngineeringSettings> findByRestaurantId(Long restaurantId);
}
