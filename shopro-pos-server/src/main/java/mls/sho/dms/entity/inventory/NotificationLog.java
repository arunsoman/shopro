package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;

import java.time.Instant;

@Entity
@Table(name = "notification_log")
@Getter
@Setter
public class NotificationLog extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type; // EMAIL, SMS, IN_APP

    @Column(name = "recipient", nullable = false)
    private String recipient;

    @Column(name = "subject")
    private String subject;

    @Column(name = "message", columnDefinition = "text", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private NotificationStatus status; // SENT, FAILED, PENDING

    @Column(name = "sent_at")
    private Instant sentAt;
    
    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    public enum NotificationType {
        EMAIL, SMS, IN_APP
    }

    public enum NotificationStatus {
        PENDING, SENT, FAILED
    }
}
