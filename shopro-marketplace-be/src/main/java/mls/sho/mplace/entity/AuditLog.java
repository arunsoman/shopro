package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "audit_log")
@Getter
@Setter
public class AuditLog extends BaseEntity {

    @Column(nullable = false)
    private String action;

    @Column(name = "performed_by")
    private String performedBy;

    private String target;

    @Enumerated(EnumType.STRING)
    private Severity severity = Severity.LOW;

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
}
