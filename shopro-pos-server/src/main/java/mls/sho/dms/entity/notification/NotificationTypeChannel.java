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

/**
 * The routing matrix defining which Group receives which NotificationType on which Channel.
 * Corresponds to the `notification_type_channels` table.
 */
@Entity
@Table(name = "notification_type_channels",
       uniqueConstraints = {
               @UniqueConstraint(columnNames = {"notification_type_id", "channel_id"})
       })
@Getter
@Setter
@NoArgsConstructor
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

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
