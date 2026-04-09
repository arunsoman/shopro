package mls.sho.dms.application.costing.repository;

import mls.sho.dms.entity.RecipeIngredientLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeLineRepository extends JpaRepository<RecipeIngredientLine, Long> {
    void deleteAllByRecipeId(Long recipeId);
}
