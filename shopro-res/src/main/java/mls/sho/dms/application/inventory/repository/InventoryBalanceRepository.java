package mls.sho.dms.application.inventory.repository;

import mls.sho.dms.entity.InventoryIngredientBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository for inventory_ingredient_balance summary table.
 * Provides O(1) balance lookups instead of O(n) aggregation queries.
 */
@Repository
public interface InventoryBalanceRepository extends JpaRepository<InventoryIngredientBalance, Long> {

    /**
     * Get current balance for a specific ingredient (O(1) lookup).
     * 
     * @param restaurantId Restaurant ID
     * @param ingredientId Ingredient ID
     * @return Current balance (positive = in stock, negative = depleted)
     */
    @Query("""
        SELECT b.currentBalance 
        FROM InventoryIngredientBalance b 
        WHERE b.restaurant.id = :restaurantId 
          AND b.ingredient.id = :ingredientId
    """)
    Optional<BigDecimal> findCurrentBalance(@Param("restaurantId") Long restaurantId, 
                                            @Param("ingredientId") Long ingredientId);

    /**
     * Check if ingredient has sufficient stock (for order validation).
     * 
     * @param restaurantId Restaurant ID
     * @param ingredientId Ingredient ID
     * @param requiredQty Required quantity
     * @return true if current_balance >= requiredQty
     */
    @Query("""
        SELECT CASE WHEN b.currentBalance >= :requiredQty THEN true ELSE false END
        FROM InventoryIngredientBalance b
        WHERE b.restaurant.id = :restaurantId
          AND b.ingredient.id = :ingredientId
    """)
    boolean hasSufficientStock(@Param("restaurantId") Long restaurantId,
                               @Param("ingredientId") Long ingredientId,
                               @Param("requiredQty") BigDecimal requiredQty);

    /**
     * Get all ingredients with low stock (below reorder point).
     * 
     * @param restaurantId Restaurant ID
     * @return List of low-stock ingredients with balances
     */
    @Query("""
        SELECT b 
        FROM InventoryIngredientBalance b
        JOIN b.ingredient i
        WHERE b.restaurant.id = :restaurantId
          AND b.currentBalance <= i.parLevel
        ORDER BY b.currentBalance ASC
    """)
    List<InventoryIngredientBalance> findLowStockIngredients(@Param("restaurantId") Long restaurantId);

    /**
     * Get all ingredients that are out of stock.
     * 
     * @param restaurantId Restaurant ID
     * @return List of out-of-stock ingredients
     */
    @Query("""
        SELECT b 
        FROM InventoryIngredientBalance b
        WHERE b.restaurant.id = :restaurantId
          AND b.currentBalance <= 0
        ORDER BY b.currentBalance ASC
    """)
    List<InventoryIngredientBalance> findOutOfStockIngredients(@Param("restaurantId") Long restaurantId);

    /**
     * Get inventory summary for dashboard (all ingredients with positive balance).
     * 
     * @param restaurantId Restaurant ID
     * @return List of ingredients with current balances
     */
    @Query("""
        SELECT b 
        FROM InventoryIngredientBalance b
        JOIN b.ingredient i
        WHERE b.restaurant.id = :restaurantId
          AND b.currentBalance > 0
        ORDER BY b.currentBalance DESC
    """)
    List<InventoryIngredientBalance> findInventorySummary(@Param("restaurantId") Long restaurantId);

    /**
     * Count ingredients with negative balances (should be 0 in production).
     * 
     * @param restaurantId Restaurant ID
     * @return Count of ingredients with negative balance
     */
    @Query("""
        SELECT COUNT(b) 
        FROM InventoryIngredientBalance b
        WHERE b.restaurant.id = :restaurantId
          AND b.currentBalance < 0
    """)
    long countNegativeBalances(@Param("restaurantId") Long restaurantId);

    /**
     * Get total inventory value (sum of all positive balances).
     * 
     * @param restaurantId Restaurant ID
     * @return Total quantity across all ingredients
     */
    @Query("""
        SELECT COALESCE(SUM(b.currentBalance), 0)
        FROM InventoryIngredientBalance b
        WHERE b.restaurant.id = :restaurantId
          AND b.currentBalance > 0
    """)
    BigDecimal getTotalPositiveBalance(@Param("restaurantId") Long restaurantId);

    /**
     * Find ingredient balance by ID (for quick lookup).
     */
    Optional<InventoryIngredientBalance> findByRestaurantIdAndIngredientId(
        @Param("restaurantId") Long restaurantId,
        @Param("ingredientId") Long ingredientId
    );

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM InventoryIngredientBalance b WHERE b.restaurant.id = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") Long restaurantId);
}
