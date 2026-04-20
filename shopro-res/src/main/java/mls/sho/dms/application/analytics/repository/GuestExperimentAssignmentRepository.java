package mls.sho.dms.application.analytics.repository;

import mls.sho.dms.application.engineering.entity.GuestExperimentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuestExperimentAssignmentRepository extends JpaRepository<GuestExperimentAssignment, UUID> {
    
    Optional<GuestExperimentAssignment> findByGuestGuestIdAndExperimentId(UUID guestId, UUID experimentId);
    
    Optional<GuestExperimentAssignment> findByFallbackSessionIdAndExperimentId(Long sessionId, UUID experimentId);
}
