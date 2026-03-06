package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.SubRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SubRecipeRepository extends JpaRepository<SubRecipe, UUID> {
}
