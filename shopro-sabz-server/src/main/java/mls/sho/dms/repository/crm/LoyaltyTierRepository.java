package mls.sho.dms.repository.crm;

import mls.sho.dms.entity.crm.LoyaltyTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoyaltyTierRepository extends JpaRepository<LoyaltyTier, UUID> {
    Optional<LoyaltyTier> findByName(String name);
    List<LoyaltyTier> findAllByOrderBySpendThresholdAsc();
    Optional<LoyaltyTier> findTopBySpendThresholdLessThanEqualOrderBySpendThresholdDesc(BigDecimal spend);
}
