package mls.sho.dms.application.kds.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * [K] Per-outlet KDS configuration.
 * One row per outlet. Created with defaults on outlet creation.
 *
 * These are the knobs the manager adjusts without touching code.
 */
@Entity
@Table(name = "kds_settings",
    uniqueConstraints = @UniqueConstraint(columnNames = "outlet_id"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KdsSettings {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "outlet_id", nullable = false, unique = true)
    private Long outletId;

    // ── Timer thresholds (seconds) ──────────────────────────
    /** Items turn amber after this many seconds. Default 300. */
    @Builder.Default
    @Column(name = "warn_threshold_seconds", nullable = false)
    private int warnThresholdSeconds = 300;

    /** Items turn red after this many seconds. Default 480. */
    @Builder.Default
    @Column(name = "alert_threshold_seconds", nullable = false)
    private int alertThresholdSeconds = 480;

    // ── Layout ───────────────────────────────────────────────
    /**
     * Max tickets shown per screen.
     * FULL_SCREEN device: 8 | TABLET: 4 | PHONE: 2
     * This is a default; each device can override.
     */
    @Builder.Default
    @Column(name = "max_tickets_per_screen", nullable = false)
    private int maxTicketsPerScreen = 6;

    /** Sort order within a station queue. */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private SortOrder sortOrder = SortOrder.FIRED_ASC;

    // ── Features ─────────────────────────────────────────────
    /**
     * If true, cooks can mark items IN_PROGRESS before bumping.
     * Some kitchens use this for accurate prep time tracking.
     * Others find the extra tap annoying — they just bump.
     */
    @Builder.Default
    @Column(name = "enable_start_action", nullable = false)
    private boolean enableStartAction = false;

    /**
     * If true, bumping a ticket triggers a "ready" notification
     * to the runner app (push or screen flash).
     */
    @Builder.Default
    @Column(name = "enable_runner_notification", nullable = false)
    private boolean enableRunnerNotification = true;

    /**
     * If true, the system plays an audio alert when:
     *   - A new ticket fires
     *   - An item passes the warn threshold
     *   - An item passes the alert threshold
     */
    @Builder.Default
    @Column(name = "enable_audio_alerts", nullable = false)
    private boolean enableAudioAlerts = true;

    /**
     * If true, a RECALL button appears on bumped tickets for
     * a configurable window (recallWindowSeconds).
     */
    @Builder.Default
    @Column(name = "enable_recall", nullable = false)
    private boolean enableRecall = true;

    /** How long after bump the recall button stays visible. Default 60s. */
    @Builder.Default
    @Column(name = "recall_window_seconds", nullable = false)
    private int recallWindowSeconds = 60;

    /**
     * Course management: if true, items are grouped by course
     * and held until the server fires that course.
     * If false, all items fire together regardless of course.
     */
    @Builder.Default
    @Column(name = "enable_course_management", nullable = false)
    private boolean enableCourseManagement = false;

    /**
     * If true, allergy/modification items are shown in a
     * high-contrast bold style with a red badge.
     */
    @Builder.Default
    @Column(name = "highlight_allergens", nullable = false)
    private boolean highlightAllergens = true;

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum SortOrder {
        FIRED_ASC,      // oldest first (standard)
        PRIORITY_FIRST, // RUSH tickets always at top, then FIRED_ASC
        TABLE_NUMBER    // sort by table number (useful for section-based kitchens)
    }
}
