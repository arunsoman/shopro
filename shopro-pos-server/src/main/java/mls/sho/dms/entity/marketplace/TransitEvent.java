package mls.sho.dms.entity.marketplace;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transit_event")
@Getter
@Setter
@NoArgsConstructor
public class TransitEvent extends BaseEntity {

    @Column(name = "po_id", nullable = false)
    private UUID poId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 30)
    private TransitEventType eventType;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt = Instant.now();

    @Column(name = "location_desc", columnDefinition = "TEXT")
    private String locationDesc;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "evidence_images", columnDefinition = "jsonb")
    private String evidenceImages;

    @Column(name = "inspected_by")
    private UUID inspectedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum TransitEventType {
        PICKED_UP, HUB_RECEIVED, HUB_INSPECTED, HUB_DISPATCHED, DELIVERED
    }
}
