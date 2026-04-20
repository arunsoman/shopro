package mls.sho.dms.application.purchasing.repository;

import mls.sho.dms.application.purchasing.entity.GoodsReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface GoodsReceiptRepository extends JpaRepository<GoodsReceipt, Long> {
    List<GoodsReceipt> findAllByRestaurantIdOrderByReceivedDateDesc(Long restaurantId);

    @Query("SELECT g FROM GoodsReceipt g WHERE g.restaurant.id = :restaurantId " +
           "AND g.status = 'RECEIVED' " +
           "AND NOT EXISTS (SELECT 1 FROM PurchaseInvoice pi WHERE pi.goodsReceipt = g)")
    List<GoodsReceipt> findStaleGRNs(@Param("restaurantId") Long restaurantId);

    List<GoodsReceipt> findAllByPurchaseOrderId(Long poId);

    @Query("SELECT g FROM GoodsReceipt g WHERE g.restaurant.id = :restaurantId AND g.status = 'CONFLICT'")
    List<GoodsReceipt> findAllConflicts(@Param("restaurantId") Long restaurantId);

    @Query("SELECT COUNT(g) FROM GoodsReceipt g WHERE g.restaurant.id = :restaurantId " +
           "AND g.status = 'RECEIVED' " +
           "AND NOT EXISTS (SELECT 1 FROM PurchaseInvoice pi WHERE pi.goodsReceipt = g)")
    int countUnmatchedGRNs(@Param("restaurantId") Long restaurantId);

    @Modifying
    @Transactional
    @Query("DELETE FROM GoodsReceipt g WHERE g.restaurant.id = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") Long restaurantId);
}
