package mls.sho.dms.application.inventory.repository;

import jakarta.persistence.LockModeType;
import mls.sho.dms.application.inventory.entity.InventoryActiveLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryActiveLotRepository extends JpaRepository<InventoryActiveLot, Long> {

    /**
     * Finds active lots for an ingredient, ordered for FIFO consumption,
     * WITH a pessimistic write lock for depletion operations.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM InventoryActiveLot b " +
           "WHERE b.restaurant.id = :restaurantId " +
           "AND b.ingredient.id = :ingredientId " +
           "AND b.active = true " +
           "AND b.availableQty > 0 " +
           "ORDER BY b.expiryDate ASC, b.receivedAt ASC")
    List<InventoryActiveLot> findAvailableLotsForUpdate(Long restaurantId, Long ingredientId);

    /**
     * Finds active lots for an ingredient, ordered for FIFO consumption,
     * WITHOUT locking, suitable for read-only analytical queries.
     */
    @Query("SELECT b FROM InventoryActiveLot b " +
           "WHERE b.restaurant.id = :restaurantId " +
           "AND b.ingredient.id = :ingredientId " +
           "AND b.active = true " +
           "AND b.availableQty > 0 " +
           "ORDER BY b.expiryDate ASC, b.receivedAt ASC")
    List<InventoryActiveLot> findAvailableLotsReadOnly(Long restaurantId, Long ingredientId);

    List<InventoryActiveLot> findAllByRestaurantIdAndActiveTrueOrderByExpiryDateAsc(Long restaurantId);

    java.util.Optional<InventoryActiveLot> findFirstByRestaurantIdAndIngredientIdAndActiveTrueAndAvailableQtyGreaterThanOrderByExpiryDateAsc(Long restaurantId, Long ingredientId, java.math.BigDecimal zeroQty);

    void deleteByRestaurantId(Long restaurantId);

    /**
     * Bulk fetch and PESSIMISTIC_WRITE lock ALL active lots for a set of ingredients.
     *
     * This is the core concurrency primitive for the DepletionExecutor.
     * Acquires locks in deterministic order (ingredient_id, expiry, received_at)
     * to prevent deadlocks when concurrent orders deplete overlapping ingredients.
     *
     * SINGLE round-trip — replaces N individual findAvailableLotsForUpdate() calls.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM InventoryActiveLot b " +
           "WHERE b.restaurant.id = :restaurantId " +
           "AND b.ingredient.id IN :ingredientIds " +
           "AND b.active = true " +
           "AND b.availableQty > 0 " +
           "ORDER BY b.ingredient.id ASC, b.expiryDate ASC, b.receivedAt ASC")
    List<InventoryActiveLot> findAvailableLotsForUpdateByIngredientIds(
            @Param("restaurantId") Long restaurantId,
            @Param("ingredientIds") List<Long> ingredientIds);
}
