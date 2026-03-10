package mls.sho.dms.entity.notification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;

/**
 * Defines a type of notification (e.g., ORDER_READY, STOCK_CRITICAL).
 * Corresponds to the `notification_types` table.
 */
@Entity
@Table(name = "notification_types", indexes = {
        @Index(name = "idx_notification_type_code", columnList = "code", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
public class NotificationType extends BaseEntity {

    @Column(name = "code", nullable = false, length = 100, unique = true)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private NotificationSeverity severity = NotificationSeverity.INFO;

    @Column(name = "is_mutable", nullable = false)
    private boolean isMutable = true;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
