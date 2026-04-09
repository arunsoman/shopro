package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.Recipe;
import mls.sho.dms.entity.inventory.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, UUID> {
    List<RecipeIngredient> findByRecipe(Recipe recipe);
}
