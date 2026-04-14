package mls.sho.dms.repository;

import mls.sho.dms.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for audit log entries with filtering capabilities.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Find all audit logs with multiple optional filters.
     */
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:startDate IS NULL OR a.timestamp >= :startDate) AND " +
           "(:endDate IS NULL OR a.timestamp <= :endDate) AND " +
           "(:username IS NULL OR a.username = :username) AND " +
           "(:entityName IS NULL OR a.entityName = :entityName) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:ipAddress IS NULL OR a.ipAddress = :ipAddress) " +
           "ORDER BY a.timestamp DESC")
    Page<AuditLog> findWithFilters(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("username") String username,
            @Param("entityName") String entityName,
            @Param("action") AuditLog.AuditAction action,
            @Param("ipAddress") String ipAddress,
            Pageable pageable);

    /**
     * Find all audit logs for a specific user.
     */
    List<AuditLog> findByUsernameOrderByTimestampDesc(String username);

    /**
     * Find all audit logs for a specific entity.
     */
    List<AuditLog> findByEntityNameAndEntityIdOrderByTimestampDesc(String entityName, String entityId);

    /**
     * Find all audit logs within a date range.
     */
    List<AuditLog> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Count audit logs for cleanup/retention purposes.
     */
    long countByTimestampBefore(LocalDateTime date);
}
