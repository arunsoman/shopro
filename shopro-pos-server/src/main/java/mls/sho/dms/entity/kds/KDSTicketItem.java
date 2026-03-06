package mls.sho.dms.entity.kds;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.order.OrderItem;

import java.time.Instant;

/**
 * Links a specific OrderItem to its KDSTicket, tracking per-item readiness.
 * The Expeditor view uses this to know when each sub-item is ready across all stations.
 */
@Entity
@Table(
    name = "kds_ticket_item",
    indexes = {
        @Index(name = "idx_kds_ticket_item_ticket", columnList = "kds_ticket_id"),
        @Index(name = "idx_kds_ticket_item_order",  columnList = "order_item_id")
    }
)
public class KDSTicketItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kds_ticket_id", nullable = false)
    private KDSTicket kdsTicket;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private KDSItemStatus status = KDSItemStatus.PENDING;

    /** Timestamp when this specific item was marked ready by the cook. */
    @Column(name = "ready_at")
    private Instant readyAt;

    public KDSTicket getKdsTicket() { return kdsTicket; }
    public void setKdsTicket(KDSTicket kdsTicket) { this.kdsTicket = kdsTicket; }
    public OrderItem getOrderItem() { return orderItem; }
    public void setOrderItem(OrderItem orderItem) { this.orderItem = orderItem; }
    public KDSItemStatus getStatus() { return status; }
    public void setStatus(KDSItemStatus status) { this.status = status; }
    public Instant getReadyAt() { return readyAt; }
    public void setReadyAt(Instant readyAt) { this.readyAt = readyAt; }
}
