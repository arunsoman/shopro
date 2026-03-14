package mls.sho.dms.tax.repository;

import mls.sho.dms.tax.entity.VenueTaxConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VenueTaxConfigRepository extends JpaRepository<VenueTaxConfig, java.util.UUID> {
    Optional<VenueTaxConfig> findByVenueIdAndTaxRuleIdAndActiveTrue(UUID venueId, UUID taxRuleId);
}
