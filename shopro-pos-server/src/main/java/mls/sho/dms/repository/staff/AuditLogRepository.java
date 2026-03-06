package mls.sho.dms.repository.staff;

import mls.sho.dms.entity.staff.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
}
