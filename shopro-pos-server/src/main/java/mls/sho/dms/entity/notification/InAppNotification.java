package mls.sho.dms.entity.notification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * High volume time-series entity representing a push notification delivery to a user's POS.
 * The `in_app_notifications` table is partition-optimized on PostgreSQL.
 */
@Entity
@Table(name = "in_app_notifications", indexes = {
        @Index(name = "idx_in_app_notification_recipient", columnList = "recipient_id, is_dismissed, created_at DESC")
})
@Getter
@Setter
@NoArgsConstructor
public class InAppNotification extends BaseEntity {

    @Column(name = "recipient_id", nullable = false)
    private UUID recipientId;

    @Column(name = "type_code", nullable = false, length = 100)
    private String typeCode;

    @Column(name = "correlation_id")
    private String correlationId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "body", columnDefinition = "text", nullable = false)
    private String body;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data", columnDefinition = "jsonb")
    private Map<String, Object> data;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "is_dismissed", nullable = false)
    private boolean isDismissed = false;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
}
