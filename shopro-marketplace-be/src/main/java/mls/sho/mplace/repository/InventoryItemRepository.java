package mls.sho.mplace.repository;

import mls.sho.mplace.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {
    
    List<InventoryItem> findByRestaurantId(UUID restaurantId);
    
    Optional<InventoryItem> findByRestaurantIdAndFood_Id(UUID restaurantId, Integer foodId);
}
