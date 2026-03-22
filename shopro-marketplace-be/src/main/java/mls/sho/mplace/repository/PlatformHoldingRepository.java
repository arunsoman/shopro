package mls.sho.mplace.repository;

import mls.sho.mplace.entity.PlatformHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface PlatformHoldingRepository extends JpaRepository<PlatformHolding, UUID> {
    Optional<PlatformHolding> findByAccountName(String accountName);
}
