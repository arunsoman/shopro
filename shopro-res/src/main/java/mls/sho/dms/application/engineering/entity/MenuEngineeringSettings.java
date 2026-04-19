package mls.sho.dms.application.engineering.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.entity.Restaurant;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Configuration settings for menu engineering analysis per restaurant.
 */
@Entity
@Table(name = "menu_engineering_settings",
       indexes = @Index(name = "idx_mes_restaurant", columnList = "restaurant_id", unique = true))
@Data
public class MenuEngineeringSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false, unique = true)
    private Restaurant restaurant;

    /**
     * Popularity threshold factor (default 0.7 = 70% of average).
     * Items selling above (avg * factor) are considered "high popularity".
     */
    @Column(name = "popularity_threshold_factor", nullable = false)
    private BigDecimal popularityThresholdFactor = new BigDecimal("0.70");

    /**
     * Food cost percentage warning threshold (default 35%).
     * Items above this threshold will be flagged.
     */
    @Column(name = "food_cost_warning_threshold", nullable = false)
    private BigDecimal foodCostWarningThreshold = new BigDecimal("35.00");

    /**
     * Minimum contribution margin (default $2.00).
     * Items below this may be flagged.
     */
    @Column(name = "min_contribution_margin", nullable = false)
    private BigDecimal minContributionMargin = new BigDecimal("2.00");

    /**
     * Default daypart for analysis if not specified.
     */
    @Column(name = "default_daypart")
    private String defaultDaypart = "ALL";

    /**
     * Restaurant type for menu engineering benchmarks.
     * Options: FINE_DINING, CASUAL, FAST_CASUAL, QSR, CAFE, BISTRO
     */
    @Column(name = "restaurant_type")
    private String restaurantType = "CASUAL";

    /**
     * WINNER classification threshold - minimum popularity score (default 0.70).
     */
    @Column(name = "winner_popularity_threshold", precision = 5, scale = 2)
    private BigDecimal winnerPopularityThreshold = new BigDecimal("0.70");

    /**
     * WINNER classification threshold - minimum contribution margin (default 3.00).
     */
    @Column(name = "winner_margin_threshold", precision = 10, scale = 2)
    private BigDecimal winnerMarginThreshold = new BigDecimal("3.00");

    /**
     * Whether to auto-generate recommendations after analysis.
     */
    @Column(name = "auto_generate_recommendations")
    private Boolean autoGenerateRecommendations = true;

    /**
     * Number of days before due date to send reminder.
     */
    @Column(name = "reminder_days_before")
    private Integer reminderDaysBefore = 3;

    /**
     * Enable email notifications.
     */
    @Column(name = "email_notifications_enabled")
    private Boolean emailNotificationsEnabled = true;

    /**
     * Email recipients for notifications (comma-separated).
     */
    @Column(name = "notification_emails", length = 500)
    private String notificationEmails;

    /**
     * Target percentage for WINNER items (ideal: 15-20%).
     */
    @Column(name = "target_winner_pct", precision = 5, scale = 2)
    private BigDecimal targetWinnerPct = new BigDecimal("20.00");

    /**
     * Target percentage for LOSER items (ideal: under 10%).
     */
    @Column(name = "target_loser_pct", precision = 5, scale = 2)
    private BigDecimal targetLoserPct = new BigDecimal("10.00");

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
