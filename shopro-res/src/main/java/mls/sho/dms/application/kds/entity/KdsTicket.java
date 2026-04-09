package mls.sho.dms.application.kds.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * [K] A fired order as seen by the KDS.
 *
 * This is NOT the same as the POS Order entity. The KDS creates
 * its own ticket projection when an order is fired. This
 * decouples the KDS from the POS schema — a ticket can be
 * created from any source (POS, delivery platform, manual).
 *
 * source describes where the ticket originated:
 *   POS        = from the table-side POS (TableSession → Order)
 *   DELIVERY   = from a third-party delivery tablet (Uber, etc.)
 *   ONLINE     = from the restaurant's own online ordering
 *   MANUAL     = manager-entered directly in the KDS
 *   RECALL     = a ticket that was bumped and recalled
 *
 * ticketNumber is the human-readable ticket label shown on screen:
 *   Table 7, Bar Tab 3, Delivery #1042, Online #88, etc.
 *
 * courseNumber: 1 = first fire (starters), 2 = main, 3 = dessert.
 * Items with courseNumber > current fired course are held and
 * shown in a "pending courses" strip — not in the active queue.
 *
 * Redis:
 *   kds:{restaurantId}:outlet:{outletId}:tickets:active
 *   → Sorted set, score = firedAt epoch.  TTL: none.
 *   kds:{restaurantId}:ticket:{id}:state
 *   → Hash of all item states. TTL: 24hr after complete.
 */
@Entity
@Table(name = "kds_ticket")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KdsTicket {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "outlet_id", nullable = false)
    private Long outletId;

    /**
     * FK → POS Order.id — null for non-POS sources.
     * Used to push "ready to plate" signal back to POS
     * so the runner app knows which table to serve.
     */
    @Column(name = "pos_order_id")
    private Long posOrderId;

    /**
     * Human-readable label: "Table 7", "Bar 3", "Online #88"
     */
    @Column(name = "ticket_number", nullable = false)
    private String ticketNumber;

    /**
     * Guest count — shown on expo screen for plating context.
     */
    @Column(name = "guest_count")
    private Integer guestCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false)
    private TicketSource source;

    /**
     * Which course firing this ticket represents.
     * Course 1 = starters / appetisers
     * Course 2 = mains
     * Course 3 = desserts
     * 0 or null = no course management (fire all items together)
     */
    @Column(name = "course_number")
    private Integer courseNumber;

    @Column(name = "fired_at", nullable = false)
    @Builder.Default
    private LocalDateTime firedAt = LocalDateTime.now();

    /**
     * When the last station bumped the last item.
     * Null until all items are DONE.
     */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /**
     * Seconds from firedAt to completedAt.
     * [D] computed on completion. Used for prep time analytics.
     */
    @Column(name = "prep_time_seconds")
    private Integer prepTimeSeconds;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TicketStatus status;

    /**
     * Priority flag set by expo or manager.
     * NORMAL → RUSH: ticket moves to front of queue.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private TicketPriority priority = TicketPriority.NORMAL;

    /**
     * Free-text note from server (e.g. "VIP table", "allergy: nuts").
     * Shown at top of ticket in amber.
     */
    @Column(name = "server_note", length = 200)
    private String serverNote;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<KdsTicketItem> items = new ArrayList<>();

    public enum TicketSource { POS, DELIVERY, ONLINE, MANUAL, RECALL }
    public enum TicketStatus { ACTIVE, COMPLETE, VOIDED, RECALLED }
    public enum TicketPriority { NORMAL, RUSH }
}
