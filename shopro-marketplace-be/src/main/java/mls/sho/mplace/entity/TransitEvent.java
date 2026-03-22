package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "transit_event")
@Getter
@Setter
public class TransitEvent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_order_id", nullable = false)
    private SubOrder subOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private TransitEventType eventType;

    @Column(name = "actor_id")
    private String actorId;

    @Column(name = "evidence_images", columnDefinition = "JSONB")
    private String evidenceImages;

    private String location;

    public enum TransitEventType {
        PICKED_UP,
        HUB_RECEIVED,
        HUB_INSPECTED,
        HUB_DISPATCHED,
        OUT_FOR_DELIVERY,
        DELIVERED,
        FAILED_ATTEMPT
    }
}
