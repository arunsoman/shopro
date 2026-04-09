package mls.sho.dms.application.kds.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * [K] Every state transition produces an immutable event row.
 * Never updated or deleted.
 *
 * This gives:
 *   - Full audit trail for every bump, void, recall
 *   - Replay capability (rebuild station queue from events)
 *   - Analytics: actual prep times, station throughput,
 *     peak hours, void rates
 *
 * eventType:
 *   TICKET_FIRED       → ticket created, items dispatched to stations
 *   TICKET_COMPLETE    → all stations bumped all items
 *   TICKET_VOIDED      → entire ticket voided (not yet complete)
 *   TICKET_RECALLED    → bumped ticket pulled back to queue
 *   TICKET_PRIORITY    → priority changed to RUSH
 *   ITEM_BUMPED        → cook bumped one item at one station
 *   ITEM_STARTED       → cook marked item as in-progress
 *   ITEM_VOIDED        → individual item voided after fire
 *   ITEM_RECALLED      → individual item recalled
 *   DEVICE_ONLINE      → KDS device connected
 *   DEVICE_OFFLINE     → KDS device disconnected
 */
@Entity
@Table(name = "kds_event_log",
    indexes = @Index(name = "idx_kds_event_outlet_time",
        columnList = "outlet_id, occurred_at DESC"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KdsEventLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "outlet_id", nullable = false)
    private Long outletId;

    @Column(name = "ticket_id")
    private Long ticketId;

    @Column(name = "ticket_item_id")
    private Long ticketItemId;

    @Column(name = "station_id")
    private Long stationId;

    @Column(name = "device_id")
    private Long deviceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private KdsEventType eventType;

    /**
     * JSONB payload — event-type specific.
     * TICKET_FIRED: { ticketNumber, source, courseNumber, itemCount }
     * ITEM_BUMPED:  { prepTimeSeconds, stationName }
     * ITEM_VOIDED:  { reason, voidedByUserId }
     * DEVICE_ONLINE: { deviceName, deviceType }
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb")
    private String payload;

    @Builder.Default
    @Column(name = "occurred_at", nullable = false, updatable = false)
    private LocalDateTime occurredAt = LocalDateTime.now();

    public enum KdsEventType {
        TICKET_FIRED, TICKET_COMPLETE, TICKET_VOIDED, TICKET_RECALLED, TICKET_PRIORITY,
        ITEM_BUMPED, ITEM_STARTED, ITEM_VOIDED, ITEM_RECALLED,
        DEVICE_ONLINE, DEVICE_OFFLINE
    }
}
