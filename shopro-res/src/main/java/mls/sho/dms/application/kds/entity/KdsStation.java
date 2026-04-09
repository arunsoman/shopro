package mls.sho.dms.application.kds.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * [K] A kitchen station within an outlet.
 * Examples: GRILL, FRYER, COLD_APPS, PASTRY, EXPO, BAR, PIZZA
 *
 * The station defines WHAT items appear on a KDS device.
 * A menu item maps to one or more stations via StationRouting.
 *
 * EXPO is a special station — it sees ALL items from ALL stations
 * for a given ticket, and is the gate for the "ready to plate"
 * signal. isExpo = true enables this behaviour.
 *
 * Redis:
 *   kds:{restaurantId}:outlet:{outletId}:station:{id}:queue
 *   TTL: none — event-driven updates
 */
@Entity
@Table(name = "kds_station",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"outlet_id", "name"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KdsStation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "outlet_id", nullable = false)
    private Outlet outlet;

    @Column(nullable = false)
    private String name;                // "Grill", "Fryer", "Expo", "Bar"

    @Enumerated(EnumType.STRING)
    @Column(name = "station_type", nullable = false)
    private StationType stationType;   // see enum below

    /**
     * If true, this station receives ALL items from ALL stations
     * in the outlet (not filtered by routing). Used for the expo
     * / pass / expeditor screen.
     */
    @Builder.Default
    @Column(name = "is_expo", nullable = false)
    private boolean isExpo = false;

    /**
     * Seconds after order fire before item turns amber.
     * Null = use system default (300s).
     */
    @Column(name = "warn_threshold_seconds")
    private Integer warnThresholdSeconds;

    /**
     * Seconds after order fire before item turns red.
     * Null = use system default (480s).
     */
    @Column(name = "alert_threshold_seconds")
    private Integer alertThresholdSeconds;

    /**
     * Display order in multi-station views (e.g. expo).
     */
    @Column(name = "display_order")
    private Integer displayOrder;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<KdsDevice> devices = new ArrayList<>();

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StationRouting> routings = new ArrayList<>();

    public enum StationType {
        GRILL, FRYER, COLD_APPS, HOT_APPS, SAUTE, PASTRY,
        PIZZA, BAR, PREP, EXPO, RUNNER, CUSTOM
    }
}
