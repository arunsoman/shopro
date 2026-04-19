package mls.sho.dms.application.engineering.entity;

import jakarta.persistence.*;
import lombok.*;
import mls.sho.dms.common.enums.MenuEngClassification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "menu_engineering_recommendation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuEngineeringRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Long restaurantId;

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    private Long menuItemId;

    public void setMenuItemId(Long menuItemId) {
        this.menuItemId = menuItemId;
    }

    @Column(name = "period_id", nullable = false)
    private Long periodId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MenuEngClassification classification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecommendationType recommendationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecommendationStatus status;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 2000)
    private String actionPlan;

    @Column(precision = 10, scale = 2)
    private BigDecimal projectedImpactRevenue;

    @Column(precision = 10, scale = 2)
    private BigDecimal projectedImpactProfit;

    @Column(precision = 5, scale = 2)
    private BigDecimal projectedImpactMargin;

    @Column(precision = 10, scale = 2)
    private BigDecimal estimatedImplementationCost;

    @Column(length = 100)
    private String assignedTo;

    private LocalDateTime dueDate;

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime completedAt;

    @Column(length = 500)
    private String dismissedReason;

    // Approval workflow fields
    @Column(length = 100)
    private String approvedBy;

    private LocalDateTime approvedAt;

    @Column(length = 500)
    private String approvalComment;

    // Priority field for sorting
    @Enumerated(EnumType.STRING)
    private RecommendationPriority priority;

    public enum RecommendationPriority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = RecommendationStatus.PENDING;
        }
    }

    public enum RecommendationType {
        // STAR/WINNER recommendations
        RETAIN,
        PROTECT,
        FEATURE,
        HIGHLIGHT,
        
        // PUZZLE/OPPORTUNITY recommendations
        INCREASE_VISIBILITY,
        REPOSITION,
        ENHANCE_DESCRIPTION,
        PROMOTE,
        TRAIN_STAFF,
        
        // PLOW HORSE/WORKHORSE recommendations
        REPRICE_UP,
        REFORMULATE,
        REDUCE_PORTION_COST,
        BUNDLE,
        
        // DOG/LOSER recommendations
        REMOVE,
        REDESIGN,
        REPLACE,
        SEASONAL_ONLY,
        CONVERT_TO_SPECIAL,
        
        // General recommendations
        MONITOR,
        INVESTIGATE,
        ANALYZE
    }

    public enum RecommendationStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        DISMISSED,
        DEFERRED,
        // Approval workflow states
        PENDING_APPROVAL,
        APPROVED,
        REJECTED
    }
}
