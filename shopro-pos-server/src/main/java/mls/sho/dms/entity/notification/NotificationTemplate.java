package mls.sho.dms.entity.notification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

/**
 * Defines the content template for a specific NotificationType on a specific Channel.
 * Corresponds to the `notification_templates` table.
 */
@Entity
@Table(name = "notification_templates", 
       uniqueConstraints = {
               @UniqueConstraint(columnNames = {"notification_type_id", "channel_id"})
       })
@Getter
@Setter
@NoArgsConstructor
public class NotificationTemplate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_type_id", nullable = false)
    private NotificationType notificationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @Column(name = "subject", length = 500)
    private String subject;

    @Column(name = "body_template", columnDefinition = "text", nullable = false)
    private String bodyTemplate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "meta", columnDefinition = "jsonb")
    private Map<String, Object> meta;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
