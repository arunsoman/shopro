package mls.sho.dms.application.inventory.repository;

import mls.sho.dms.application.inventory.entity.PhysicalInventoryPeriod;
import mls.sho.dms.common.enums.InventoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhysicalInventoryPeriodRepository extends JpaRepository<PhysicalInventoryPeriod, Long> {

    List<PhysicalInventoryPeriod> findAllByRestaurantIdOrderByCountDateDesc(Long restaurantId);

    Optional<PhysicalInventoryPeriod> findFirstByRestaurantIdAndInventoryTypeAndStatus(
            Long restaurantId,
            InventoryType inventoryType,
            PhysicalInventoryPeriod.PeriodStatus status);
}
