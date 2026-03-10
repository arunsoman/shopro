package mls.sho.dms.entity.notification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;

import java.util.HashSet;
import java.util.Set;

/**
 * Represents a logical group of recipients or a dynamic mapping to a Role.
 * Corresponds to the `recipient_groups` table.
 */
@Entity
@Table(name = "recipient_groups", indexes = {
        @Index(name = "idx_recipient_groups_role_code", columnList = "role_code")
})
@Getter
@Setter
@NoArgsConstructor
public class RecipientGroup extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "role_code", length = 100)
    private String roleCode;

    @ManyToMany
    @JoinTable(
            name = "recipient_group_members",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "recipient_id")
    )
    private Set<Recipient> members = new HashSet<>();
}
