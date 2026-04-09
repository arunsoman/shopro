package mls.sho.dms.application.inventory.repository;

import mls.sho.dms.entity.InventoryWasteRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryWasteRepository extends JpaRepository<InventoryWasteRegistry, Long> {

    List<InventoryWasteRegistry> findAllByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<InventoryWasteRegistry> findAllByOrderId(Long orderId);

    List<InventoryWasteRegistry> findAllByMenuId(Long menuId);

    @Modifying
    @Transactional
    @Query("DELETE FROM InventoryWasteRegistry w WHERE w.ledger.restaurant.id = :restaurantId")
    void deleteByLedgerRestaurantId(@Param("restaurantId") Long restaurantId);
}
