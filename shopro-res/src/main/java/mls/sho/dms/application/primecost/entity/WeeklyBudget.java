package mls.sho.dms.application.primecost.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.entity.Restaurant;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Weekly budget targets for a restaurant.
 */
@Entity
@Table(name = "weekly_budget",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "week_start_date"}))
@Data
public class WeeklyBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    // Sales forecasts
    @Column(name = "total_sales_forecast", precision = 12, scale = 2) private BigDecimal totalSalesForecast;
    @Column(name = "food_sales_pct", precision = 5, scale = 4)        private BigDecimal foodSalesPct;
    @Column(name = "soft_bev_sales_pct", precision = 5, scale = 4)    private BigDecimal softBevSalesPct;
    @Column(name = "liquor_sales_pct", precision = 5, scale = 4)      private BigDecimal liquorSalesPct;
    @Column(name = "bottle_beer_sales_pct", precision = 5, scale = 4) private BigDecimal bottleBeerSalesPct;
    @Column(name = "draft_beer_sales_pct", precision = 5, scale = 4)  private BigDecimal draftBeerSalesPct;
    @Column(name = "wine_sales_pct", precision = 5, scale = 4)        private BigDecimal wineSalesPct;
    @Column(name = "comps_pct", precision = 5, scale = 4)             private BigDecimal compsPct;

    // COS % targets
    @Column(name = "food_cos_pct_target", precision = 5, scale = 4)    private BigDecimal foodCosPctTarget;
    @Column(name = "bev_cos_pct_target", precision = 5, scale = 4)     private BigDecimal bevCosPctTarget;

    // Labor % targets
    @Column(name = "mgmt_labor_pct_target", precision = 5, scale = 4)   private BigDecimal mgmtLaborPctTarget;
    @Column(name = "hourly_labor_pct_target", precision = 5, scale = 4) private BigDecimal hourlyLaborPctTarget;
    @Column(name = "benefits_rate", precision = 5, scale = 4)           private BigDecimal benefitsRate;

    @Column(name = "fixed_costs", precision = 12, scale = 2)            private BigDecimal fixedCosts;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
