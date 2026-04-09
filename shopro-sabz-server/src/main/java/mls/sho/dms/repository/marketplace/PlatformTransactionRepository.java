package mls.sho.dms.repository.marketplace;

import mls.sho.dms.entity.marketplace.PlatformTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlatformTransactionRepository extends JpaRepository<PlatformTransaction, UUID> {
    Optional<PlatformTransaction> findByPoId(UUID poId);
}
