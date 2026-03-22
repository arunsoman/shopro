package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "in_app_notifications")
@Getter
@Setter
public class InAppNotification extends BaseEntity {

    @Column(name = "recipient_id", nullable = false)
    private UUID recipientId;

    @Column(name = "type_code", nullable = false)
    private String typeCode;

    @Column(name = "correlation_id")
    private String correlationId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String data;

    @Column(name = "is_read")
    private boolean isRead = false;

    @Column(name = "is_dismissed")
    private boolean isDismissed = false;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}
