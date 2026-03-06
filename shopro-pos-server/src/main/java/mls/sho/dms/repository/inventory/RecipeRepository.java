package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.Recipe;
import mls.sho.dms.entity.menu.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, UUID> {
    
    @Query("SELECT r FROM Recipe r WHERE r.menuItem = :menuItem ORDER BY r.effectiveFrom DESC LIMIT 1")
    Optional<Recipe> findLatestByMenuItem(MenuItem menuItem);

    @Query("SELECT r FROM Recipe r WHERE r.subRecipe.id = :subRecipeId ORDER BY r.effectiveFrom DESC LIMIT 1")
    Optional<Recipe> findLatestBySubRecipe(UUID subRecipeId);
}
