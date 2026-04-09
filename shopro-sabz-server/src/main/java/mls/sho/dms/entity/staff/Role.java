package mls.sho.dms.entity.staff;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import java.util.HashSet;
import java.util.Set;

/**
 * Represents a logical role (e.g., Manager, Server) with an associated set of permissions.
 * Supports single-level inheritance for permission propagation.
 */
@Entity
@Table(name = "staff_roles", uniqueConstraints = {
    @UniqueConstraint(columnNames = "name")
})
public class Role extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_role_id")
    private Role parentRole;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Set<Permission> getPermissions() { return permissions; }
    public void setPermissions(Set<Permission> permissions) { this.permissions = permissions; }

    public Role getParentRole() { return parentRole; }
    public void setParentRole(Role parentRole) { this.parentRole = parentRole; }

    /**
     * Helper to get all effective permissions (including inherited).
     */
    public Set<Permission> getEffectivePermissions() {
        Set<Permission> effective = new HashSet<>(permissions);
        if (parentRole != null) {
            effective.addAll(parentRole.getEffectivePermissions());
        }
        return effective;
    }
}
