package mls.sho.dms.application.kds.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * [K] Defines which MenuItem (by PLU or menu item ID) routes
 * to which station. This is the heart of the KDS dispatch model.
 *
 * An item can route to multiple stations (e.g. a burger:
 * patty → GRILL, bun toast → FRYER, plating → EXPO).
 *
 * When a ticket is fired, the system creates one
 * StationTicketItem per routing entry per ordered item.
 *
 * routingType = MENU_ITEM_ID | PLU | CATEGORY
 *   MENU_ITEM_ID: routes based on MenuItem.id (core domain)
 *   PLU:          routes based on MenuItem.pluNumber
 *   CATEGORY:     routes all items in a MenuCostGroup
 *                 (coarse-grained — useful for bar vs kitchen split)
 */
@Entity
@Table(name = "station_routing")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationRouting {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private KdsStation station;

    @Enumerated(EnumType.STRING)
    @Column(name = "routing_type", nullable = false)
    private RoutingType routingType;

    /**
     * The ID or value being matched.
     * If routingType = MENU_ITEM_ID: stores the MenuItem.id as string
     * If routingType = PLU:          stores the PLU number as string
     * If routingType = CATEGORY:     stores the MenuCostGroup.id as string
     */
    @Column(name = "routing_key", nullable = false)
    private String routingKey;

    /**
     * Human-readable label for the routing rule.
     * e.g. "Burger — Grill station", "All bar items → Bar"
     */
    @Column(name = "label")
    private String label;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum RoutingType { MENU_ITEM_ID, PLU, CATEGORY }
}
