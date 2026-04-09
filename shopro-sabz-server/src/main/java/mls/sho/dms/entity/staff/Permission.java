package mls.sho.dms.entity.staff;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

/**
 * Represents a single atomic permission in the system (e.g., ORDER:VOID_ITEM).
 */
@Entity
@Table(name = "staff_permissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = "name")
})
public class Permission extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private PermissionCategory category;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public PermissionCategory getCategory() { return category; }
    public void setCategory(PermissionCategory category) { this.category = category; }
}
