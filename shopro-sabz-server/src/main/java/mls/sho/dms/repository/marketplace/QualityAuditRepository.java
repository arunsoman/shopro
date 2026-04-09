package mls.sho.dms.repository.marketplace;

import mls.sho.dms.entity.marketplace.QualityAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QualityAuditRepository extends JpaRepository<QualityAudit, UUID> {
    Optional<QualityAudit> findByPoId(UUID poId);
}
