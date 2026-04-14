package mls.sho.dms.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.entity.AuditLog;
import mls.sho.dms.repository.AuditLogRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service for async audit log persistence with retry and circuit breaker logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    // Circuit breaker: track consecutive failures
    private final AtomicInteger consecutiveFailures = new AtomicInteger(0);
    private static final int CIRCUIT_BREAKER_THRESHOLD = 10;
    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 100;

    /**
     * Log an audit entry asynchronously.
     * This method returns immediately without blocking the API call.
     */
    @Async("auditExecutor")
    public void logAsync(String username, AuditLog.AuditAction action, String entityName, 
                         String entityId, String details, String ipAddress) {
        saveWithRetry(username, action, entityName, entityId, details, ipAddress);
    }

    /**
     * Log an audit entry synchronously (for critical operations).
     */
    public void logSync(String username, AuditLog.AuditAction action, String entityName,
                        String entityId, String details, String ipAddress) {
        saveWithRetry(username, action, entityName, entityId, details, ipAddress);
    }

    /**
     * Save with retry logic and exponential backoff.
     */
    private void saveWithRetry(String username, AuditLog.AuditAction action, String entityName,
                               String entityId, String details, String ipAddress) {
        int attempt = 0;
        long backoffMs = INITIAL_BACKOFF_MS;

        while (attempt < MAX_RETRIES) {
            try {
                AuditLog auditLog = AuditLog.builder()
                        .username(username)
                        .action(action)
                        .entityName(entityName)
                        .entityId(entityId)
                        .details(details)
                        .timestamp(LocalDateTime.now())
                        .ipAddress(ipAddress)
                        .build();

                auditLogRepository.save(auditLog);
                
                // Success: reset circuit breaker
                consecutiveFailures.set(0);
                log.debug("Audit log saved: {} -> {} [{}:{}]", username, action, entityName, entityId);
                return;

            } catch (Exception e) {
                attempt++;
                consecutiveFailures.incrementAndGet();
                
                log.warn("Failed to save audit log (attempt {}/{}): {}", 
                         attempt, MAX_RETRIES, e.getMessage());

                // Check circuit breaker
                if (consecutiveFailures.get() >= CIRCUIT_BREAKER_THRESHOLD) {
                    log.error("CIRCUIT BREAKER TRIGGERED: {} consecutive failures logging audit. " +
                              "Alerting admin!", consecutiveFailures.get());
                    // Alert admin - in production, this would send alert
                    fallbackLog(username, action, entityName, entityId, details, ipAddress);
                    return;
                }

                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(backoffMs);
                        backoffMs *= 2; // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        // All retries exhausted - fallback to stdout
        fallbackLog(username, action, entityName, entityId, details, ipAddress);
    }

    /**
     * Fallback logging to stdout when database fails.
     */
    private void fallbackLog(String username, AuditLog.AuditAction action, String entityName,
                            String entityId, String details, String ipAddress) {
        String fallbackMessage = String.format(
                "AUDIT_FALLBACK: user=%s action=%s entity=%s entityId=%s details=%s ip=%s timestamp=%s",
                username, action, entityName, entityId, details, ipAddress, LocalDateTime.now()
        );
        
        // Use System.err for visibility - these are critical failures
        log.error(fallbackMessage);
    }

    /**
     * Get audit logs with filtering and pagination.
     */
    public List<AuditLog> getAuditLogs(LocalDateTime startDate, LocalDateTime endDate,
                                       String username, String entityName,
                                       AuditLog.AuditAction action, String ipAddress,
                                       int page, int size) {
        // This would be called by the controller with Pageable
        return List.of(); // Placeholder - actual implementation in controller
    }

    /**
     * Get a single audit log by ID.
     */
    public AuditLog getAuditLog(Long id) {
        return auditLogRepository.findById(id).orElse(null);
    }

    /**
     * Delete an audit log (Admin only).
     */
    public void deleteAuditLog(Long id) {
        auditLogRepository.deleteById(id);
    }

    /**
     * Get all audit logs (for export).
     */
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }

    /**
     * Cleanup old audit logs based on retention policy.
     * Should be called by a scheduled job.
     */
    public int cleanupOldLogs(int retentionDays) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
        List<AuditLog> oldLogs = auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(
                LocalDateTime.of(2000, 1, 1, 0, 0), cutoffDate);
        
        if (!oldLogs.isEmpty()) {
            auditLogRepository.deleteAll(oldLogs);
            log.info("Cleaned up {} old audit logs older than {} days", oldLogs.size(), retentionDays);
        }
        
        return oldLogs.size();
    }

    /**
     * Get current consecutive failure count (for monitoring).
     */
    public int getConsecutiveFailures() {
        return consecutiveFailures.get();
    }

    /**
     * Reset circuit breaker (for testing/admin).
     */
    public void resetCircuitBreaker() {
        consecutiveFailures.set(0);
        log.info("Circuit breaker reset");
    }
}
