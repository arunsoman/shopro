package mls.sho.dms.application.engineering.repository;

import mls.sho.dms.application.engineering.entity.MenuEngineeringRecommendation;
import mls.sho.dms.common.enums.MenuEngClassification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MenuEngineeringRecommendationRepository extends JpaRepository<MenuEngineeringRecommendation, UUID> {

    List<MenuEngineeringRecommendation> findByRestaurantId(Long restaurantId);

    List<MenuEngineeringRecommendation> findByRestaurantIdAndPeriodId(Long restaurantId, Long periodId);

    List<MenuEngineeringRecommendation> findByRestaurantIdAndStatus(Long restaurantId, 
            MenuEngineeringRecommendation.RecommendationStatus status);

    List<MenuEngineeringRecommendation> findByRestaurantIdAndClassification(Long restaurantId,
            MenuEngClassification classification);

    List<MenuEngineeringRecommendation> findByRestaurantIdAndMenuItemId(Long restaurantId, Long menuItemId);
    
    List<MenuEngineeringRecommendation> findByRestaurantIdAndPeriodIdAndMenuItemId(
            Long restaurantId, Long periodId, Long menuItemId);

    @Query("SELECT r FROM MenuEngineeringRecommendation r WHERE r.restaurantId = :restaurantId " +
           "AND r.periodId = :periodId AND r.classification = :classification")
    List<MenuEngineeringRecommendation> findByPeriodAndClassification(
            @Param("restaurantId") Long restaurantId,
            @Param("periodId") Long periodId,
            @Param("classification") MenuEngClassification classification);

    @Query("SELECT r FROM MenuEngineeringRecommendation r WHERE r.restaurantId = :restaurantId " +
           "AND r.assignedTo = :assignedTo")
    List<MenuEngineeringRecommendation> findByAssignedTo(
            @Param("restaurantId") Long restaurantId,
            @Param("assignedTo") String assignedTo);

    @Query("SELECT COUNT(r) FROM MenuEngineeringRecommendation r WHERE r.restaurantId = :restaurantId " +
           "AND r.periodId = :periodId AND r.status = :status")
    long countByPeriodAndStatus(
            @Param("restaurantId") Long restaurantId,
            @Param("periodId") Long periodId,
            @Param("status") MenuEngineeringRecommendation.RecommendationStatus status);
}
