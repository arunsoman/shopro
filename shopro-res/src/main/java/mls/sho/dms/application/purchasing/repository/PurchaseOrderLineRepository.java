package mls.sho.dms.application.purchasing.repository;

import mls.sho.dms.application.purchasing.entity.PurchaseOrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PurchaseOrderLineRepository extends JpaRepository<PurchaseOrderLine, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM PurchaseOrderLine l WHERE l.purchaseOrder.id IN (SELECT p.id FROM PurchaseOrder p WHERE p.restaurant.id = :restaurantId)")
    void deleteByPurchaseOrderRestaurantId(@Param("restaurantId") Long restaurantId);
}
