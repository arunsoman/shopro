package mls.sho.dms.application.costing.repository;

import mls.sho.dms.application.costing.entity.MenuCostGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuCostGroupRepository extends JpaRepository<MenuCostGroup, Long> {
    List<MenuCostGroup> findAllByRestaurantId(Long restaurantId);
    java.util.Optional<MenuCostGroup> findByNameAndRestaurantId(String name, Long restaurantId);
}
