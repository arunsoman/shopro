package mls.sho.dms.application.pos.repository;

import mls.sho.dms.application.pos.entity.OrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public interface OrderLineRepository extends JpaRepository<OrderLine, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM OrderLine l WHERE l.order.restaurantId = :restaurantId")
    void deleteByOrderSessionTableRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT l FROM OrderLine l WHERE l.order.restaurantId = :restaurantId AND l.order.createdAt BETWEEN :start AND :end")
    List<OrderLine> findAllByOrderRestaurantIdAndOrderCreatedAtBetween(@Param("restaurantId") Long restaurantId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT l.menuItem.id, SUM(l.quantity), AVG(l.unitPrice) " +
           "FROM OrderLine l " +
           "WHERE l.order.restaurantId = :restaurantId " +
           "AND l.order.createdAt BETWEEN :start AND :end " +
           "GROUP BY l.menuItem.id")
    List<Object[]> findSalesVolumeByMenuItem(@Param("restaurantId") Long restaurantId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
