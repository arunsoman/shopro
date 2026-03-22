package mls.sho.mplace.repository;

import mls.sho.mplace.entity.Food;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodRepository extends JpaRepository<Food, Integer> {
    
    Page<Food> findByNameContainingIgnoreCaseOrFoodGroupContainingIgnoreCase(
            String name, String foodGroup, Pageable pageable);
}
