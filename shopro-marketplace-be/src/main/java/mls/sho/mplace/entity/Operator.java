package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "operator")
@Getter
@Setter
public class Operator extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OperatorRole role;

    @Column(nullable = false)
    private boolean enabled = true;

    public enum OperatorRole {
        SUPER_ADMIN,
        OPS_MANAGER,
        PROCUREMENT_OFFICER,
        FINANCE_OFFICER,
        SUPPLIER_RELATIONS,
        SUPPORT_AGENT,
        AUDITOR
    }
}
