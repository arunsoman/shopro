package mls.sho.dms.application.pos.repository;

import jakarta.transaction.Transactional;
import mls.sho.dms.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT MAX(o.createdAt) FROM Order o WHERE o.session.table.restaurant.id = :restaurantId")
    LocalDateTime findMaxCreatedAt(@Param("restaurantId") Long restaurantId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.session.table.restaurant.id = :restaurantId AND o.createdAt >= :start AND o.status = 'PAID'")
    BigDecimal sumTotalSalesAfter(@Param("restaurantId") Long restaurantId, @Param("start") LocalDateTime start);

    @Query("SELECT SUM(o.session.guestCount) FROM Order o WHERE o.session.table.restaurant.id = :restaurantId AND o.createdAt >= :start AND o.status = 'PAID'")
    Integer sumCoversAfter(@Param("restaurantId") Long restaurantId, @Param("start") LocalDateTime start);

    @Query("SELECT o FROM Order o WHERE o.session.table.restaurant.id = :restaurantId AND o.createdAt >= :start AND o.status = 'PAID'")
    List<Order> findAllPaidAfter(@Param("restaurantId") Long restaurantId, @Param("start") LocalDateTime start);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.session.table.restaurant.id = :restaurantId AND o.createdAt >= :start AND o.createdAt <= :end AND o.status = 'PAID'")
    BigDecimal sumTotalSalesBetween(@Param("restaurantId") Long restaurantId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(o.session.guestCount) FROM Order o WHERE o.session.table.restaurant.id = :restaurantId AND o.createdAt >= :start AND o.createdAt <= :end AND o.status = 'PAID'")
    Integer sumCoversBetween(@Param("restaurantId") Long restaurantId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT o FROM Order o WHERE o.session.table.restaurant.id = :restaurantId " +
           "AND o.createdAt >= :start AND o.createdAt <= :end")
    @EntityGraph(attributePaths = {"lines", "lines.menuItem"})
    List<Order> findAllByRestaurantIdAndCreatedAtBetween(
            @Param("restaurantId") Long restaurantId, 
            @Param("start") LocalDateTime start, 
            @Param("end") LocalDateTime end);

    @org.springframework.data.jpa.repository.Modifying
    @Transactional
    @Query("DELETE FROM Order o WHERE o.session.id IN (SELECT s.id FROM TableSession s WHERE s.table.restaurant.id = :restaurantId)")
    void deleteByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT CAST(o.createdAt as date) as reportDate, SUM(o.totalAmount) as total " +
           "FROM Order o " +
           "WHERE o.session.table.restaurant.id = :restaurantId " +
           "AND o.status = 'PAID' " +
           "AND o.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY CAST(o.createdAt as date) " +
           "ORDER BY reportDate")
    List<Object[]> findDailyRevenue(
            @Param("restaurantId") Long restaurantId, 
            @Param("startDate") java.time.LocalDateTime startDate, 
            @Param("endDate") java.time.LocalDateTime endDate);

    @Query("SELECT CAST(o.createdAt as date) as reportDate, SUM(o.totalAmount) as total " +
           "FROM Order o " +
           "WHERE o.status = 'PAID' " +
           "AND o.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY CAST(o.createdAt as date) " +
           "ORDER BY reportDate")
    List<Object[]> findDailyRevenueGlobal(
            @Param("startDate") java.time.LocalDateTime startDate, 
            @Param("endDate") java.time.LocalDateTime endDate);
}
