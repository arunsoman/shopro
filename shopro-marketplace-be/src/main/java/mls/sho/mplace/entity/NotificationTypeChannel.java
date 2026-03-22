package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "notification_type_channels", uniqueConstraints = @UniqueConstraint(columnNames = {"notification_type_id", "channel_id"}))
@Getter
@Setter
public class NotificationTypeChannel extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_type_id", nullable = false)
    private NotificationType notificationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_group_id")
    private RecipientGroup recipientGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fallback_channel_id")
    private Channel fallbackChannel;

    @Column(name = "is_active")
    private boolean isActive = true;
}
