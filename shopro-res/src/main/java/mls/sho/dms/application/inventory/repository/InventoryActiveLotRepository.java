package mls.sho.dms.application.inventory.repository;

import jakarta.persistence.LockModeType;
import mls.sho.dms.entity.InventoryActiveLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface InventoryActiveLotRepository extends JpaRepository<InventoryActiveLot, Long> {

    /**
     * Finds active lots for an ingredient, ordered for FIFO (First-In-First-Out)
     * consumption (oldest arrival first, with expiry priority).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM InventoryActiveLot b " +
           "WHERE b.restaurant.id = :restaurantId " +
           "AND b.ingredient.id = :ingredientId " +
           "AND b.active = true " +
           "AND b.availableQty > 0 " +
           "ORDER BY b.expiryDate ASC, b.receivedAt ASC")
    List<InventoryActiveLot> findAvailableLotsOrderByFifo(Long restaurantId, Long ingredientId);

    List<InventoryActiveLot> findAllByRestaurantIdAndActiveTrueOrderByExpiryDateAsc(Long restaurantId);

    void deleteByRestaurantId(Long restaurantId);
}
