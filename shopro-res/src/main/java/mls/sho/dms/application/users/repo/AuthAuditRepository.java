package mls.sho.dms.application.users.repo;

import mls.sho.dms.entity.users.AuthAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuthAuditRepository extends JpaRepository<AuthAudit, UUID> {
    
    List<AuthAudit> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    List<AuthAudit> findByActionAndCreatedAtAfter(String action, LocalDateTime since);
    
    List<AuthAudit> findBySuccessFalseAndCreatedAtAfter(LocalDateTime since);
}