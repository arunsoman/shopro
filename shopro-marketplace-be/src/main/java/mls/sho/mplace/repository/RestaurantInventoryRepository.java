package mls.sho.mplace.repository;

import mls.sho.mplace.entity.RestaurantInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RestaurantInventoryRepository extends JpaRepository<RestaurantInventory, UUID> {
    List<RestaurantInventory> findAllByRestaurantId(UUID restaurantId);
}
