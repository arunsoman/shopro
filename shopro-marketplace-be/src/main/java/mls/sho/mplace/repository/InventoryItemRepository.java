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

    @org.springframework.data.jpa.repository.Query("SELECT i FROM InventoryItem i WHERE i.restaurantId = :resId")
    List<InventoryItem> findByRestaurantIdWithActivePricing(@org.springframework.data.repository.query.Param("resId") java.util.UUID resId);
}
