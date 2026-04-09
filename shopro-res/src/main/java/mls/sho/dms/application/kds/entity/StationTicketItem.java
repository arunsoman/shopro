package mls.sho.dms.application.kds.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * [K] One item at one station for one ticket.
 * This is what a cook sees on their KDS screen.
 *
 * When a ticket is fired, the dispatch engine creates one
 * StationTicketItem per (TicketItem × StationRouting match).
 *
 * Example: "Burger" routes to GRILL and EXPO.
 * One KdsTicketItem("Burger") → two StationTicketItems:
 *   one for the GRILL station, one for the EXPO station.
 *
 * The cook at GRILL sees it, cooks it, bumps it.
 * The EXPO screen shows it as "waiting on GRILL" until bumped,
 * then shows "ready to plate" when all stations bump.
 *
 * stationStartedAt: when the cook first touched the item
 * (optional — some stations use this for more precise timing).
 *
 * bumpedAt: when the cook bumped the item. This is the
 * primary completion signal.
 *
 * recalledAt: if the item was recalled after being bumped
 * (server came back — "that order hasn't been collected yet").
 *
 * [R] kds:{restaurantId}:outlet:{outletId}:station:{stationId}:queue
 *     Sorted set, score = firedAt epoch.
 */
@Entity
@Table(name = "station_ticket_item",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"ticket_item_id", "station_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationTicketItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_item_id", nullable = false)
    private KdsTicketItem ticketItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private KdsStation station;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private StationItemStatus status = StationItemStatus.NEW;

    /** When the cook first touched / started this item. Optional. */
    @Column(name = "started_at")
    private LocalDateTime startedAt;

    /** When the cook bumped this item. The primary signal. */
    @Column(name = "bumped_at")
    private LocalDateTime bumpedAt;

    /** Who bumped it (device ID, for audit). */
    @Column(name = "bumped_by_device_id")
    private Long bumpedByDeviceId;

    /** When this item was recalled to the queue. */
    @Column(name = "recalled_at")
    private LocalDateTime recalledAt;

    /** Seconds from ticket.firedAt to bumpedAt. Analytics. */
    @Column(name = "prep_time_seconds")
    private Integer prepTimeSeconds;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum StationItemStatus {
        NEW,          // visible in queue, not started
        IN_PROGRESS,  // cook has started (optional — requires explicit "start" tap)
        DONE,         // bumped — cook is finished
        VOIDED,       // item was voided mid-cook
        RECALLED      // bumped then recalled — back in queue
    }
}
