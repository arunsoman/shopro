package mls.sho.dms.repository.marketplace;

import mls.sho.dms.entity.marketplace.MaskedIdentity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaskedIdentityRepository extends JpaRepository<MaskedIdentity, UUID> {
    Optional<MaskedIdentity> findByInternalId(UUID internalId);
    Optional<MaskedIdentity> findByMaskedId(String maskedId);
}
