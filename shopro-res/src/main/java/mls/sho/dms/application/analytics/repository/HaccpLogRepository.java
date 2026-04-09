package mls.sho.dms.application.analytics.repository;

import mls.sho.dms.entity.HaccpLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/** Repository for HACCP compliance log entries, scoped by restaurant. */
@Repository
public interface HaccpLogRepository extends JpaRepository<HaccpLog, Long> {

    List<HaccpLog> findAllByRestaurantIdAndCreatedAtBetween(
            Long restaurantId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(l) FROM HaccpLog l WHERE l.restaurant.id = :restaurantId AND l.compliant = false AND l.createdAt > :since")
    Integer countAlerts(Long restaurantId, LocalDateTime since);
}
