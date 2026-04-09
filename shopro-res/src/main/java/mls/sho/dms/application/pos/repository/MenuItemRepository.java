package mls.sho.dms.application.pos.repository;

import mls.sho.dms.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantIdAndActiveTrue(Long restaurantId);

    @EntityGraph(attributePaths = {
            "recipes",
            "recipes.ingredientLines",
            "recipes.ingredientLines.ingredient"
    })
    List<MenuItem> findAllByRestaurantId(Long restaurantId);

    List<MenuItem> findAllByGroupId(Long groupId);
    Optional<MenuItem> findByPosIdAndRestaurantId(String posId, Long restaurantId);
}
