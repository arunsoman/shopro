package mls.sho.dms.application.purchasing.repository;

import mls.sho.dms.application.purchasing.entity.PreferredVendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PreferredVendorRepository extends JpaRepository<PreferredVendor, Long> {

    List<PreferredVendor> findByRestaurantIdAndActiveTrue(Long restaurantId);

    @Query("SELECT pv FROM PreferredVendor pv WHERE pv.restaurant.id = :restaurantId AND pv.ingredient.id = :ingredientId AND pv.preferred = true")
    Optional<PreferredVendor> findPreferredVendor(@Param("restaurantId") Long restaurantId, @Param("ingredientId") Long ingredientId);

    @Query("SELECT pv FROM PreferredVendor pv WHERE pv.restaurant.id = :restaurantId AND pv.ingredient.id = :ingredientId AND pv.active = true")
    List<PreferredVendor> findAllVendorsForIngredient(@Param("restaurantId") Long restaurantId, @Param("ingredientId") Long ingredientId);

    @Query("SELECT pv FROM PreferredVendor pv WHERE pv.supplier.id = :supplierId AND pv.active = true")
    List<PreferredVendor> findBySupplierId(Long supplierId);

    boolean existsByRestaurantIdAndIngredientIdAndPreferredTrue(Long restaurantId, Long ingredientId);
}
