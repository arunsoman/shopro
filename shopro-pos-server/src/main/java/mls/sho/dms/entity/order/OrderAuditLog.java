package mls.sho.dms.entity.order;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mls.sho.dms.entity.staff.StaffMember;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "order_audit_log")
@Getter
@Setter
@NoArgsConstructor
public class OrderAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderTicket order;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "details", length = 1000)
    private String details;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private StaffMember performedBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public OrderAuditLog(OrderTicket order, String eventType, String details, StaffMember performedBy) {
        this.order = order;
        this.eventType = eventType;
        this.details = details;
        this.performedBy = performedBy;
    }
}
