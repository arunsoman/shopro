package mls.sho.mplace.repository;

import mls.sho.mplace.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findTop10ByOrderByCreatedAtDesc();
    List<AuditLog> findBySeverity(AuditLog.Severity severity);
}
