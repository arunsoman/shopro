package mls.sho.dms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Audit log entry for tracking all API actions.
 * Stores user actions for compliance and troubleshooting.
 */
@Entity
@Table(name = "audit_log", indexes = {
    @Index(name = "idx_audit_log_username", columnList = "username"),
    @Index(name = "idx_audit_log_entity_name", columnList = "entity_name"),
    @Index(name = "idx_audit_log_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_log_action", columnList = "action")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "action", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AuditAction action;

    @Column(name = "entity_name", nullable = false, length = 100)
    private String entityName;

    @Column(name = "entity_id", length = 50)
    private String entityId;

    @Column(name = "details", length = 500)
    private String details;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /**
     * Action types for audit logging.
     */
    public enum AuditAction {
        CREATE,
        READ,
        UPDATE,
        DELETE
    }

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
