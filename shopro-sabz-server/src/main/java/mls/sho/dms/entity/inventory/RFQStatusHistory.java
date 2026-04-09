package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import java.util.UUID;

/**
 * Audit trail for all RFQ status changes.
 */
@Entity
@Table(name = "rfq_status_history", indexes = {
    @Index(name = "idx_rfq_history_rfq_id", columnList = "rfq_id")
})
public class RFQStatusHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rfq_id", nullable = false)
    private RFQ rfq;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 25)
    private RfqStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 25)
    private RfqStatus toStatus;

    @Column(name = "actor_id", nullable = false)
    private UUID actorId;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    public RFQ getRfq() { return rfq; }
    public void setRfq(RFQ rfq) { this.rfq = rfq; }
    public RfqStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(RfqStatus fromStatus) { this.fromStatus = fromStatus; }
    public RfqStatus getToStatus() { return toStatus; }
    public void setToStatus(RfqStatus toStatus) { this.toStatus = toStatus; }
    public UUID getActorId() { return actorId; }
    public void setActorId(UUID actorId) { this.actorId = actorId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
