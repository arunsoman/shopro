package mls.sho.dms.application.pos.repository;

import jakarta.transaction.Transactional;
import mls.sho.dms.entity.TableSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TableSessionRepository extends JpaRepository<TableSession, Long> {
    Optional<TableSession> findByTableIdAndClosedAtIsNull(Long tableId);

    List<TableSession> findAllByTableRestaurantIdAndClosedAtIsNull(Long restaurantId);

    List<TableSession> findAllByTableRestaurantIdAndClosedAtBetween(
            Long restaurantId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(ts) FROM TableSession ts WHERE ts.table.restaurant.id = :restaurantId AND ts.closedAt IS NULL")
    long countActiveSessions(@Param("restaurantId") Long restaurantId);

    @org.springframework.data.jpa.repository.Modifying
    @Transactional
    @Query("DELETE FROM TableSession ts WHERE ts.table.restaurant.id = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT CAST(ts.openedAt as date) as arrivalDate, SUM(ts.guestCount) as count " +
           "FROM TableSession ts " +
           "WHERE ts.table.restaurant.id = :restaurantId " +
           "AND ts.openedAt BETWEEN :startDate AND :endDate " +
           "GROUP BY CAST(ts.openedAt as date) " +
           "ORDER BY arrivalDate")
    List<Object[]> findDailyGuestCounts(
            @Param("restaurantId") Long restaurantId, 
            @Param("startDate") java.time.LocalDateTime startDate, 
            @Param("endDate") java.time.LocalDateTime endDate);

    @Query("SELECT CAST(ts.openedAt as date) as arrivalDate, SUM(ts.guestCount) as count " +
           "FROM TableSession ts " +
           "WHERE ts.openedAt BETWEEN :startDate AND :endDate " +
           "GROUP BY CAST(ts.openedAt as date) " +
           "ORDER BY arrivalDate")
    List<Object[]> findDailyGuestCountsGlobal(
            @Param("startDate") java.time.LocalDateTime startDate, 
            @Param("endDate") java.time.LocalDateTime endDate);

    @Query(value = "SELECT ts.table_id, dt.table_number, COUNT(ts.id), " +
           "AVG(EXTRACT(EPOCH FROM (ts.closed_at - ts.opened_at))/60.0), " +
           "SUM(o.total_amount) " +
           "FROM table_session ts " +
           "JOIN dining_table dt ON ts.table_id = dt.id " +
           "LEFT JOIN restaurant_order o ON o.session_id = ts.id " +
           "WHERE dt.restaurant_id = :restaurantId " +
           "AND ts.closed_at IS NOT NULL " +
           "AND ts.opened_at BETWEEN :start AND :end " +
           "GROUP BY ts.table_id, dt.table_number", nativeQuery = true)
    List<Object[]> findTableTurnaroundStats(@Param("restaurantId") Long restaurantId, 
                                           @Param("start") LocalDateTime start, 
                                           @Param("end") LocalDateTime end);

}
