package mls.sho.dms.application.inventory.repository;

import mls.sho.dms.entity.Ingredient;
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

    /**
     * Returns active ingredients whose live balance (from {@code inventory_ingredient_balance})
     * is below par level AND have no open / in-flight PO lines.
     */
    @Query("""
        SELECT i FROM Ingredient i
        JOIN InventoryIngredientBalance b
            ON b.ingredient = i AND b.restaurant = i.restaurant
        WHERE i.restaurant.id = :restaurantId
          AND i.parLevel IS NOT NULL
          AND b.currentBalance < i.parLevel
          AND i.active = true
          AND NOT EXISTS (
              SELECT 1 FROM PurchaseOrderLine pol
              JOIN pol.purchaseOrder po
              WHERE pol.ingredient = i
                AND po.status IN ('DRAFT', 'SENT', 'PARTIAL')
          )
    """)
    List<Ingredient> findAllLowStock(@org.springframework.data.repository.query.Param("restaurantId") Long restaurantId);

    @Query("""
        SELECT COUNT(i) FROM Ingredient i
        JOIN InventoryIngredientBalance b
            ON b.ingredient = i AND b.restaurant = i.restaurant
        WHERE i.restaurant.id = :restaurantId
          AND i.parLevel IS NOT NULL
          AND b.currentBalance < i.parLevel
          AND i.active = true
          AND NOT EXISTS (
              SELECT 1 FROM PurchaseOrderLine pol
              JOIN pol.purchaseOrder po
              WHERE pol.ingredient = i
                AND po.status IN ('DRAFT', 'SENT', 'PARTIAL')
          )
    """)
    long countLowStock(@org.springframework.data.repository.query.Param("restaurantId") Long restaurantId);

    @Query("""
        SELECT COUNT(i) FROM Ingredient i
        JOIN InventoryIngredientBalance b
            ON b.ingredient = i AND b.restaurant = i.restaurant
        WHERE i.parLevel IS NOT NULL
          AND b.currentBalance < i.parLevel
          AND i.active = true
          AND NOT EXISTS (
              SELECT 1 FROM PurchaseOrderLine pol
              JOIN pol.purchaseOrder po
              WHERE pol.ingredient = i
                AND po.status IN ('DRAFT', 'SENT', 'PARTIAL')
          )
    """)
    long countBelowParGlobal();

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

