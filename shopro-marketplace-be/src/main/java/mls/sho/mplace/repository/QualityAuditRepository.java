package mls.sho.mplace.repository;

import mls.sho.mplace.entity.QualityAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface QualityAuditRepository extends JpaRepository<QualityAudit, UUID> {
    Optional<QualityAudit> findBySubOrderId(UUID subOrderId);
}
