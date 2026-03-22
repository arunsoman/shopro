package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "recipient_groups")
@Getter
@Setter
public class RecipientGroup extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "role_code")
    private String roleCode;

    @ManyToMany
    @JoinTable(
        name = "recipient_group_members",
        joinColumns = @JoinColumn(name = "group_id"),
        inverseJoinColumns = @JoinColumn(name = "recipient_id")
    )
    private Set<Recipient> members = new HashSet<>();
}
