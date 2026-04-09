package mls.sho.dms.application.purchasing.repository;

import mls.sho.dms.entity.PurchaseOrder;
import mls.sho.dms.common.enums.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for PurchaseOrder entity.
 */
@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    @Query("SELECT po FROM PurchaseOrder po WHERE po.restaurant.id = :restaurantId")
    List<PurchaseOrder> findAllByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT po FROM PurchaseOrder po WHERE po.restaurant.id = :restaurantId AND po.status = :status")
    List<PurchaseOrder> findAllByRestaurantIdAndStatus(@Param("restaurantId") Long restaurantId, @Param("status") PurchaseOrderStatus status);

    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.restaurant.id = :restaurantId " +
           "AND po.status IN ('DRAFT', 'SUBMITTED', 'PARTIAL')")
    int countOpenPOs(@Param("restaurantId") Long restaurantId);

    @Query("SELECT po FROM PurchaseOrder po WHERE po.restaurant.id = :restaurantId AND po.id = :id")
    Optional<PurchaseOrder> findByRestaurantIdAndId(@Param("restaurantId") Long restaurantId, @Param("id") Long id);

    @Modifying
    @Transactional
    @Query("DELETE FROM PurchaseOrder p WHERE p.restaurant.id = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") Long restaurantId);
}
