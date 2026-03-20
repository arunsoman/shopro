package mls.sho.dms.entity.marketplace;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "quality_audit")
@Getter
@Setter
@NoArgsConstructor
public class QualityAudit extends BaseEntity {

    @Column(name = "po_id", nullable = false, unique = true)
    private UUID poId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuditStatus status = AuditStatus.PENDING;

    @Column(name = "auditor_notes", columnDefinition = "TEXT")
    private String auditorNotes;

    @Column(name = "inspected_at")
    private Instant inspectedAt;

    @Column(name = "inspected_by")
    private UUID inspectedBy;

    public enum AuditStatus {
        PENDING, APPROVED, REJECTED
    }
}
