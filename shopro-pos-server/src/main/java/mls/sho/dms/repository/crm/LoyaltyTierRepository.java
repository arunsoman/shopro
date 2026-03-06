package mls.sho.dms.repository.crm;

import mls.sho.dms.entity.crm.LoyaltyTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoyaltyTierRepository extends JpaRepository<LoyaltyTier, UUID> {
    Optional<LoyaltyTier> findByName(String name);
}
