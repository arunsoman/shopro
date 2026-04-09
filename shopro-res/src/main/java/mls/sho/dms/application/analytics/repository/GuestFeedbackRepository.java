package mls.sho.dms.application.analytics.repository;

import mls.sho.dms.entity.GuestFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/** Repository for guest feedback entries, scoped by restaurant. */
@Repository
public interface GuestFeedbackRepository extends JpaRepository<GuestFeedback, Long> {

    List<GuestFeedback> findAllByRestaurantIdAndCreatedAtBetween(
            Long restaurantId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT AVG(f.npsScore) FROM GuestFeedback f WHERE f.restaurant.id = :restaurantId AND f.createdAt > :since")
    Double getAverageNps(Long restaurantId, LocalDateTime since);

    @Query("SELECT COUNT(f) FROM GuestFeedback f WHERE f.restaurant.id = :restaurantId AND f.complaintCategory IS NOT NULL AND f.createdAt > :since")
    Integer countUnresolvedComplaints(Long restaurantId, LocalDateTime since);
}
