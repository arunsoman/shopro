package mls.sho.dms.application.kds.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * [K] A physical or virtual KDS screen.
 * This can be:
 *   - A dedicated 21" weatherproof KDS with a bump bar
 *   - An Android phone mounted at the station
 *   - A browser tab open on a tablet or laptop
 *   - A smart TV in the kitchen
 *
 * deviceType describes the physical form factor — used by the
 * frontend to adjust layout density (PHONE = 1-2 tickets,
 * FULL_SCREEN = 6-8 tickets, etc.)
 *
 * A device subscribes to one station. If you want a screen to
 * show multiple stations (small restaurant, one KDS for all),
 * create a single EXPO station that sees everything.
 *
 * authToken is a long-lived device token, not a user session.
 * The device authenticates once and maintains a persistent
 * WebSocket connection. Token rotation is manual (device re-pair).
 *
 * Redis:
 *   kds:{restaurantId}:device:{id}:status  → ONLINE|OFFLINE
 *   kds:{restaurantId}:device:{id}:lastSeen
 */
@Entity
@Table(name = "kds_device")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KdsDevice {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private KdsStation station;

    @Column(nullable = false)
    private String name;                 // "Grill KDS 1", "Bar Phone", "Manager Tablet"

    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", nullable = false)
    private DeviceType deviceType;

    /**
     * Pairing code shown during device registration.
     * 6-digit alphanumeric, expires after 15 minutes.
     * Null after device is paired.
     */
    @Column(name = "pairing_code", length = 6)
    private String pairingCode;

    @Column(name = "pairing_code_expires_at")
    private LocalDateTime pairingCodeExpiresAt;

    /**
     * Long-lived device auth token (hashed SHA-256 in DB).
     * The raw token is shown once at pairing time.
     * Set to null to force re-pairing.
     */
    @Column(name = "auth_token_hash", length = 64)
    private String authTokenHash;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Display orientation — used by frontend to adjust layout.
     * LANDSCAPE = standard KDS
     * PORTRAIT = phone mounted vertically
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "orientation", nullable = false)
    @Builder.Default
    private Orientation orientation = Orientation.LANDSCAPE;

    public enum DeviceType {
        FULL_SCREEN,   // dedicated 21"+ KDS screen
        TABLET,        // 10–13" tablet
        PHONE,         // smartphone
        BROWSER        // browser tab / laptop
    }

    public enum Orientation { LANDSCAPE, PORTRAIT }
}
