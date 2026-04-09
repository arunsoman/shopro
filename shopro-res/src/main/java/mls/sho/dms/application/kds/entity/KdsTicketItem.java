package mls.sho.dms.application.kds.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * [K] One line item within a KdsTicket.
 *
 * menuItemId / menuItemName snapshot: we copy the name at fire
 * time so the KDS still shows the correct item if the menu
 * changes mid-service.
 *
 * Modifications: stored as a JSONB array of strings.
 * e.g. ["no onion", "add bacon", "sauce on side", "well done"]
 * Each mod is shown as a separate line under the item on the KDS.
 *
 * allergenFlags: pipe-separated allergen codes, e.g. "GLUTEN|NUTS"
 * Shown as a red badge on the KDS item.
 *
 * courseNumber: can differ from ticket.courseNumber if a server
 * fires all courses at once. Items with courseNumber > active
 * course are held in a pending strip.
 */
@Entity
@Table(name = "kds_ticket_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KdsTicketItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private KdsTicket ticket;

    @Column(name = "pos_order_line_id")
    private Long posOrderLineId;            // FK → OrderLine.id, null for non-POS

    @Column(name = "menu_item_id")
    private Long menuItemId;                // FK → MenuItem.id (snapshot reference)

    @Column(name = "menu_item_name", nullable = false)
    private String menuItemName;            // snapshot at fire time

    @Column(name = "plu_number")
    private Integer pluNumber;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "prep_time_minutes")
    private Integer prepTimeMinutes;

    @Column(name = "course_number")
    private Integer courseNumber;

    /**
     * JSONB: ["no onion", "extra cheese", "well done"]
     * Each mod shows as an indented line on the KDS.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "modifications", columnDefinition = "jsonb")
    private String modifications;

    /**
     * Pipe-separated allergen codes. Shown as red badge.
     * e.g. "GLUTEN|DAIRY|NUTS"
     */
    @Column(name = "allergen_flags", length = 200)
    private String allergenFlags;

    /**
     * Computed status across all stations.
     * NEW → IN_PROGRESS (any station started) → DONE (all bumped)
     * → VOIDED
     *
     * [D] derived from StationTicketItem statuses — not written
     * directly. Updated by StationTicketItemService.onBump().
     *
     * [R] kds:{restaurantId}:ticket:{ticketId}:item:{id}:status
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ItemStatus status = ItemStatus.NEW;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "ticketItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StationTicketItem> stationItems = new ArrayList<>();

    public enum ItemStatus { NEW, IN_PROGRESS, DONE, VOIDED, HELD }
}
