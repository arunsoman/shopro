package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "notification_types")
@Getter
@Setter
public class NotificationType extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity = Severity.INFO;

    @Column(name = "is_mutable")
    private boolean isMutable = true;

    @Column(name = "is_active")
    private boolean isActive = true;

    public enum Severity {
        INFO, WARNING, CRITICAL
    }
}
