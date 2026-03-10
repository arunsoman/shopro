package mls.sho.dms.entity.notification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;

import java.util.UUID;

/**
 * Represents a user's mute override for a specific combination of NotificationType and Channel.
 * Corresponds to `user_notification_preferences`.
 */
@Entity
@Table(name = "user_notification_preferences",
       uniqueConstraints = {
               @UniqueConstraint(columnNames = {"user_id", "notification_type_id", "channel_id"})
       })
@Getter
@Setter
@NoArgsConstructor
public class UserNotificationPreference extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_type_id", nullable = false)
    private NotificationType notificationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @Column(name = "is_muted", nullable = false)
    private boolean isMuted = false;
}
