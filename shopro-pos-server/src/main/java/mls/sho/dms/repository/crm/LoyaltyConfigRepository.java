package mls.sho.dms.repository.crm;

import mls.sho.dms.entity.crm.LoyaltyConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoyaltyConfigRepository extends JpaRepository<LoyaltyConfig, UUID> {
    
    // We only expect one config row to ever exist, so finding the first one is sufficient
    Optional<LoyaltyConfig> findFirstByOrderByCreatedAtAsc();
}
