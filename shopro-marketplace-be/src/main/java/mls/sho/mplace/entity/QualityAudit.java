package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "quality_audit")
@Getter
@Setter
public class QualityAudit extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_order_id", nullable = false)
    private SubOrder subOrder;

    @Column(name = "auditor_id")
    private String auditorId;

    @Enumerated(EnumType.STRING)
    private AuditStatus status = AuditStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(columnDefinition = "JSONB")
    private String photos;

    public enum AuditStatus {
        PENDING,
        IN_PROGRESS,
        APPROVED,
        REJECTED,
        CONDITIONAL
    }
}
