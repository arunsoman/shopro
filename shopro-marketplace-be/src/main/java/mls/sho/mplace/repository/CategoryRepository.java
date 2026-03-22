package mls.sho.mplace.repository;

import mls.sho.mplace.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByParentIsNull();
    List<Category> findByParent_Id(UUID parentId);
    List<Category> findByRestaurantIdOrRestaurantIdIsNull(UUID restaurantId);
}
