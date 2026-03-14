package mls.sho.dms.tax.repository;

import mls.sho.dms.tax.entity.VenueCountryAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VenueCountryAssignmentRepository extends JpaRepository<VenueCountryAssignment, java.util.UUID> {
    Optional<VenueCountryAssignment> findByVenueIdAndActiveTrue(UUID venueId);
    Optional<VenueCountryAssignment> findByVenueId(UUID venueId);
}
