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

    @Column(name = "total_quantity", nullable = false)
    private int totalQuantity = 0;

    @Column(name = "quantity_pending", nullable = false)
    private int quantityPending = 0;

    @Column(name = "quantity_cooking", nullable = false)
    private int quantityCooking = 0;

    @Column(name = "quantity_ready", nullable = false)
    private int quantityReady = 0;

    @Column(name = "quantity_served", nullable = false)
    private int quantityServed = 0;

    @Column(name = "priority", nullable = false)
    private int priority = 0;

    /** Timestamp when this specific item was marked ready by the cook. */
    @Column(name = "ready_at")
    private Instant readyAt;

    /** Updates the status enum based on quantity distribution. */
    public void refreshStatus() {
        if (quantityServed == totalQuantity) {
            this.status = KDSItemStatus.SERVED;
        } else if (quantityReady + quantityServed == totalQuantity) {
            this.status = KDSItemStatus.READY;
        } else if (quantityCooking > 0) {
            this.status = KDSItemStatus.COOKING;
        } else {
            this.status = KDSItemStatus.PENDING;
        }
    }

    public KDSTicket getKdsTicket() { return kdsTicket; }
    public void setKdsTicket(KDSTicket kdsTicket) { this.kdsTicket = kdsTicket; }
    public OrderItem getOrderItem() { return orderItem; }
    public void setOrderItem(OrderItem orderItem) { this.orderItem = orderItem; }
    public KDSItemStatus getStatus() { return status; }
    public void setStatus(KDSItemStatus status) { this.status = status; }
    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }
    public Instant getReadyAt() { return readyAt; }
    public void setReadyAt(Instant readyAt) { this.readyAt = readyAt; }

    public int getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; }
    public int getQuantityPending() { return quantityPending; }
    public void setQuantityPending(int quantityPending) { this.quantityPending = quantityPending; }
    public int getQuantityCooking() { return quantityCooking; }
    public void setQuantityCooking(int quantityCooking) { this.quantityCooking = quantityCooking; }
    public int getQuantityReady() { return quantityReady; }
    public void setQuantityReady(int quantityReady) { this.quantityReady = quantityReady; }
    public int getQuantityServed() { return quantityServed; }
    public void setQuantityServed(int quantityServed) { this.quantityServed = quantityServed; }
}
