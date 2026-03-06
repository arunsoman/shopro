package mls.sho.dms.entity.kds;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.order.OrderTicket;

import java.time.Instant;

/**
 * A KDS-specific view of an OrderTicket, scoped to a single prep station.
 * When an OrderTicket is fired, the routing engine creates one KDSTicket per station.
 *
 * PostgreSQL strategy:
 *   - PARTITIONED BY RANGE (fired_at) with monthly child tables — high write volume.
 *     DDL: CREATE TABLE kds_ticket PARTITION BY RANGE (fired_at);
 *   - BRIN index on fired_at within each partition (monotonically increasing).
 *   - Composite B-Tree on (station_id, status) — KDS screen query core access pattern.
 */
@Entity
@Table(
    name = "kds_ticket",
    indexes = {
        @Index(name = "idx_kds_ticket_station_status", columnList = "station_id, status"),
        @Index(name = "idx_kds_ticket_fired_brin",     columnList = "fired_at") // Use BRIN in DDL
    }
)
public class KDSTicket extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_ticket_id", nullable = false)
    private OrderTicket orderTicket;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private KDSStation station;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private KDSTicketStatus status = KDSTicketStatus.NEW;

    /** Timestamp when the Server pressed "Send" — used for colour-coded timer alerts. */
    @Column(name = "fired_at", nullable = false)
    private Instant firedAt;

    /** Timestamp when the last item on this ticket was bumped at the station. */
    @Column(name = "bumped_at")
    private Instant bumpedAt;

    public OrderTicket getOrderTicket() { return orderTicket; }
    public void setOrderTicket(OrderTicket orderTicket) { this.orderTicket = orderTicket; }
    public KDSStation getStation() { return station; }
    public void setStation(KDSStation station) { this.station = station; }
    public KDSTicketStatus getStatus() { return status; }
    public void setStatus(KDSTicketStatus status) { this.status = status; }
    public Instant getFiredAt() { return firedAt; }
    public void setFiredAt(Instant firedAt) { this.firedAt = firedAt; }
    public Instant getBumpedAt() { return bumpedAt; }
    public void setBumpedAt(Instant bumpedAt) { this.bumpedAt = bumpedAt; }
}
