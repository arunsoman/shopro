package mls.sho.dms.application.purchasing.repository;

import mls.sho.dms.entity.GoodsReceiptLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface GoodsReceiptLineRepository extends JpaRepository<GoodsReceiptLine, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM GoodsReceiptLine l WHERE l.goodsReceipt.id IN (SELECT g.id FROM GoodsReceipt g WHERE g.restaurant.id = :restaurantId)")
    void deleteByGoodsReceiptRestaurantId(@Param("restaurantId") Long restaurantId);
}
