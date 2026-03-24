package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "markup_rule")
@Getter
@Setter
public class MarkupRule {
    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "target_type", nullable = false)
    private String targetType; // GLOBAL, GROUP, SUBGROUP, ITEM

    @Column(name = "target_value")
    private String targetValue; // Food ID, Group Name, etc.

    @Column(name = "subgroup_value")
    private String subgroupValue;

    @Column(name = "markup_value", nullable = false, precision = 19, scale = 4)
    private BigDecimal markupValue;

    @Column(name = "markup_type", nullable = false)
    private String markupType; // PERCENTAGE, FLAT

    @Column(nullable = false)
    private Integer priority;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
