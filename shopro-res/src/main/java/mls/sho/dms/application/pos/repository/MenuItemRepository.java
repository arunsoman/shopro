package mls.sho.dms.application.pos.repository;

import mls.sho.dms.application.pos.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantIdAndActiveTrue(Long restaurantId);

    /**
     * Lightweight query without EntityGraph - for POS menu display.
     * Use when recipe details are not needed.
     */
    List<MenuItem> findAllByRestaurantId(Long restaurantId);

    /**
     * Eager-loaded query with recipes and ingredient lines.
     * Use when recipe/ingredient details are required (e.g., inventory depletion, cost analysis).
     */
    @EntityGraph(attributePaths = {
            "recipes",
            "recipes.ingredientLines",
            "recipes.ingredientLines.ingredient"
    })
    @Query("SELECT m FROM MenuItem m WHERE m.restaurant.id = :restaurantId")
    List<MenuItem> fetchByRestaurantIdWithRecipes(@Param("restaurantId") Long restaurantId);

    List<MenuItem> findAllByGroupId(Long groupId);
    Optional<MenuItem> findByPosIdAndRestaurantId(String posId, Long restaurantId);
    
    /**
     * Returns only menu items that have complete recipes (recipe + at least one ingredient line).
     * This ensures inventory depletion can be tracked for all ordered items.
     */
    @Query("SELECT DISTINCT m FROM MenuItem m " +
           "JOIN Recipe r ON r.menuItem.id = m.id " +
           "JOIN RecipeIngredientLine ril ON ril.recipe.id = r.id " +
           "WHERE m.restaurant.id = :restaurantId " +
           "AND m.active = true " +
           "AND r.active = true")
    List<MenuItem> findMenuItemsWithCompleteRecipes(@Param("restaurantId") Long restaurantId);
}
