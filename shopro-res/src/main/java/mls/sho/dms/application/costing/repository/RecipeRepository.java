package mls.sho.dms.application.costing.repository;

import mls.sho.dms.application.costing.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    @EntityGraph(attributePaths = {"ingredientLines", "ingredientLines.ingredient"})
    List<Recipe> findAllByRestaurantId(Long restaurantId);

    @EntityGraph(attributePaths = {"ingredientLines", "ingredientLines.ingredient"})
    Optional<Recipe> findById(Long id);
}
