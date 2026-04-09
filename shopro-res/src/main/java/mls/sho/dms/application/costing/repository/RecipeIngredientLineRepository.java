package mls.sho.dms.application.costing.repository;

import mls.sho.dms.entity.RecipeIngredientLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeIngredientLineRepository extends JpaRepository<RecipeIngredientLine, Long> {
}
