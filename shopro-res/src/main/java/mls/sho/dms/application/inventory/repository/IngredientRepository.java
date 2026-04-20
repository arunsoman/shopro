package mls.sho.dms.application.inventory.repository;

import mls.sho.dms.application.inventory.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    List<Ingredient> findAllByRestaurantId(Long restaurantId);
    Optional<Ingredient> findByRestaurantIdAndItemCode(Long restaurantId, String itemCode);
    long countByRestaurantId(Long restaurantId);

    @Query("""
        SELECT i FROM Ingredient i
        JOIN InventoryIngredientBalance b
            ON b.ingredient = i AND b.restaurant = i.restaurant
        WHERE i.restaurant.id = :restaurantId
          AND i.parLevel IS NOT NULL
          AND b.currentBalance < i.parLevel
          AND i.active = true
          AND i.id NOT IN :onOrderIds
    """)
    List<Ingredient> findAllLowStockNotIn(@org.springframework.data.repository.query.Param("restaurantId") Long restaurantId, @org.springframework.data.repository.query.Param("onOrderIds") List<Long> onOrderIds);

    @Query("""
        SELECT i FROM Ingredient i
        JOIN InventoryIngredientBalance b
            ON b.ingredient = i AND b.restaurant = i.restaurant
        WHERE i.restaurant.id = :restaurantId
          AND i.parLevel IS NOT NULL
          AND b.currentBalance < i.parLevel
          AND i.active = true
    """)
    List<Ingredient> findAllLowStockNoExits(@org.springframework.data.repository.query.Param("restaurantId") Long restaurantId);

    @Query("""
        SELECT COUNT(i) FROM Ingredient i
        JOIN InventoryIngredientBalance b
            ON b.ingredient = i AND b.restaurant = i.restaurant
        WHERE i.restaurant.id = :restaurantId
          AND i.parLevel IS NOT NULL
          AND b.currentBalance < i.parLevel
          AND i.active = true
          AND i.id NOT IN :onOrderIds
    """)
    long countLowStockNotIn(@org.springframework.data.repository.query.Param("restaurantId") Long restaurantId, @org.springframework.data.repository.query.Param("onOrderIds") List<Long> onOrderIds);

    @Query("""
        SELECT COUNT(i) FROM Ingredient i
        JOIN InventoryIngredientBalance b
            ON b.ingredient = i AND b.restaurant = i.restaurant
        WHERE i.restaurant.id = :restaurantId
          AND i.parLevel IS NOT NULL
          AND b.currentBalance < i.parLevel
          AND i.active = true
    """)
    long countLowStockNoExits(@org.springframework.data.repository.query.Param("restaurantId") Long restaurantId);

    @Query("""
        SELECT COUNT(i) FROM Ingredient i
        JOIN InventoryIngredientBalance b
            ON b.ingredient = i AND b.restaurant = i.restaurant
        WHERE i.parLevel IS NOT NULL
          AND b.currentBalance < i.parLevel
          AND i.active = true
          AND i.id NOT IN :onOrderIds
    """)
    long countBelowParGlobalNotIn(@org.springframework.data.repository.query.Param("onOrderIds") List<Long> onOrderIds);

    @Query("""
        SELECT COUNT(i) FROM Ingredient i
        JOIN InventoryIngredientBalance b
            ON b.ingredient = i AND b.restaurant = i.restaurant
        WHERE i.parLevel IS NOT NULL
          AND b.currentBalance < i.parLevel
          AND i.active = true
    """)
    long countBelowParGlobalNoExits();

    @Query("SELECT i FROM Ingredient i WHERE i.restaurant.id = :restaurantId " +
           "AND (:type IS NULL OR i.inventoryType = :type) " +
           "AND (:category IS NULL OR i.category = :category) " +
           "AND (:active IS NULL OR i.active = :active) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.itemCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Ingredient> findFiltered(
            @org.springframework.data.repository.query.Param("restaurantId") Long restaurantId,
            @org.springframework.data.repository.query.Param("type") mls.sho.dms.common.enums.InventoryType type,
            @org.springframework.data.repository.query.Param("category") mls.sho.dms.common.enums.InventoryCategory category,
            @org.springframework.data.repository.query.Param("active") Boolean active,
            @org.springframework.data.repository.query.Param("search") String search);
}

