package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "procurement_policy")
@Getter
@Setter
public class ProcurementPolicy extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyType type;

    @Column(name = "config", columnDefinition = "JSONB")
    private String config; // JSON settings per type

    @Column(name = "is_active")
    private boolean active = true;

    public enum PolicyType {
        CONSOLIDATION, SUBSTITUTION, BATCHING
    }
}
