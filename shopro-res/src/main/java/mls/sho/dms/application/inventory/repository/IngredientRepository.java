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

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Ingredient i SET i.onHand = 0 WHERE i.restaurant.id = :restaurantId")
    void zeroOutStockByRestaurantId(@org.springframework.data.repository.query.Param("restaurantId") Long restaurantId);

    @Query("SELECT i FROM Ingredient i WHERE i.restaurant.id = :restaurantId AND i.onHand < i.parLevel AND i.active = true")
    List<Ingredient> findAllLowStock(Long restaurantId);

    @Query("SELECT COUNT(i) FROM Ingredient i WHERE i.restaurant.id = :restaurantId AND i.onHand < i.parLevel AND i.active = true")
    long countLowStock(Long restaurantId);

    @Query("SELECT COUNT(i) FROM Ingredient i WHERE i.onHand < i.parLevel AND i.active = true")
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
