package mls.sho.dms.application.analytics.repository;

import mls.sho.dms.entity.WaitlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/** Repository for guest waitlist entries, scoped by restaurant. */
@Repository
public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, Long> {

    List<WaitlistEntry> findAllByRestaurantIdAndStatus(
            Long restaurantId, WaitlistEntry.WaitlistStatus status);

    // Double getAvgWaitTime(Long restaurantId, LocalDateTime since);
}
