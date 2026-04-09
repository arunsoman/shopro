package mls.sho.dms.application.users.service;

import mls.sho.dms.entity.users.AuthAudit;
import mls.sho.dms.application.users.repo.AuthAuditRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {
    
    private final AuthAuditRepository auditRepository;
    
    @Async
    public void log(UUID userId, String action, String ipAddress, boolean success) {
        log(userId, action, ipAddress, success, null);
    }
    
    @Async
    public void log(UUID userId, String action, String ipAddress, boolean success, Map<String, Object> details) {
        try {
            AuthAudit audit = AuthAudit.builder()
                .userId(userId)
                .action(action)
                .ipAddress(ipAddress)
                .success(success)
                .details(details)
                .createdAt(LocalDateTime.now())
                .build();
            
            auditRepository.save(audit);
            
            // Also log to application logs
            if (success) {
                log.info("Auth audit: {} - User: {} - IP: {}", action, userId, ipAddress);
            } else {
                log.warn("Auth audit FAILED: {} - User: {} - IP: {}", action, userId, ipAddress);
            }
        } catch (Exception e) {
            // Don't fail authentication if audit fails
            log.error("Failed to save audit log", e);
        }
    }
}