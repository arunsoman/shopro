package mls.sho.dms.tax.repository;

import mls.sho.dms.tax.entity.TaxAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.UUID;

@Repository
public interface TaxAuditLogRepository extends JpaRepository<TaxAuditLog, java.util.UUID> {
    Page<TaxAuditLog> findByVenueIdOrderByChangedAtDesc(UUID venueId, Pageable pageable);
    
    Page<TaxAuditLog> findByVenueIdAndChangedAtBetweenOrderByChangedAtDesc(
        UUID venueId, Instant from, Instant to, Pageable pageable);
}
