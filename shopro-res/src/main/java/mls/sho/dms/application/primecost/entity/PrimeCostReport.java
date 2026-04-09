package mls.sho.dms.application.primecost.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.entity.Restaurant;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Saved prime cost report snapshot - frozen at period close.
 */
@Entity
@Table(name = "prime_cost_report",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "week_start_date"}),
       indexes = @Index(name = "idx_pcr_res_week", columnList = "restaurant_id, week_start_date"))
@Data
public class PrimeCostReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    // -- Revenue ---------------------------------------------
    @Column(name = "gross_sales", precision = 12, scale = 2)       private BigDecimal grossSales;
    @Column(name = "comps_discounts", precision = 12, scale = 2)   private BigDecimal compsDiscounts;
    @Column(name = "net_sales", precision = 12, scale = 2)         private BigDecimal netSales;

    // -- Actual COGS -------------------------------------------
    @Column(name = "beg_inventory_food", precision = 12, scale = 2) private BigDecimal begInventoryFood;
    @Column(name = "end_inventory_food", precision = 12, scale = 2) private BigDecimal endInventoryFood;
    @Column(name = "purchases_food", precision = 12, scale = 2)     private BigDecimal purchasesFood;
    @Column(name = "actual_food_cos", precision = 12, scale = 2)    private BigDecimal actualFoodCos;

    @Column(name = "beg_inventory_bev", precision = 12, scale = 2)  private BigDecimal begInventoryBev;
    @Column(name = "end_inventory_bev", precision = 12, scale = 2)  private BigDecimal endInventoryBev;
    @Column(name = "purchases_bev", precision = 12, scale = 2)      private BigDecimal purchasesBev;
    @Column(name = "actual_bev_cos", precision = 12, scale = 2)     private BigDecimal actualBevCos;

    @Column(name = "total_actual_cos", precision = 12, scale = 2)   private BigDecimal totalActualCos;
    @Column(name = "total_actual_cos_pct", precision = 6, scale = 4) private BigDecimal totalActualCosPct;

    // -- Theoretical COGS --------------------------------------
    @Column(name = "theoretical_cos", precision = 12, scale = 2)    private BigDecimal theoreticalCos;
    @Column(name = "theoretical_cos_pct", precision = 6, scale = 4) private BigDecimal theoreticalCosPct;

    // -- Shrinkage Variance ------------------------------------
    @Column(name = "shrinkage_variance", precision = 12, scale = 2)    private BigDecimal shrinkageVariance;
    @Column(name = "shrinkage_variance_pct", precision = 6, scale = 4) private BigDecimal shrinkageVariancePct;

    // -- Labor -------------------------------------------------
    @Column(name = "mgmt_labor", precision = 12, scale = 2)          private BigDecimal mgmtLabor;
    @Column(name = "hourly_labor", precision = 12, scale = 2)        private BigDecimal hourlyLabor;
    @Column(name = "payroll_taxes_benefits", precision = 12, scale = 2) private BigDecimal payrollTaxesBenefits;
    @Column(name = "total_labor", precision = 12, scale = 2)         private BigDecimal totalLabor;
    @Column(name = "total_labor_pct", precision = 6, scale = 4)      private BigDecimal totalLaborPct;

    // -- Prime Cost --------------------------------------------
    @Column(name = "prime_cost_gross", precision = 12, scale = 2)    private BigDecimal primeCostGross;
    @Column(name = "prime_cost_gross_pct", precision = 6, scale = 4) private BigDecimal primeCostGrossPct;
    @Column(name = "prime_cost_net", precision = 12, scale = 2)      private BigDecimal primeCostNet;
    @Column(name = "prime_cost_net_pct", precision = 6, scale = 4)   private BigDecimal primeCostNetPct;
    @Column(name = "gross_margin", precision = 12, scale = 2)        private BigDecimal grossMargin;
    @Column(name = "gross_margin_pct", precision = 6, scale = 4)     private BigDecimal grossMarginPct;

    // -- Scheduled vs Actual Labor -----------------------------
    @Column(name = "scheduled_labor", precision = 12, scale = 2)     private BigDecimal scheduledLabor;
    @Column(name = "labor_variance", precision = 12, scale = 2)      private BigDecimal laborVariance;

    // -- KPIs --------------------------------------------------
    @Column(name = "total_covers")                               private Integer    totalCovers;
    @Column(name = "check_average", precision = 8, scale = 2)        private BigDecimal checkAverage;
    @Column(name = "labor_cost_per_cover", precision = 8, scale = 2) private BigDecimal laborCostPerCover;
    @Column(name = "sales_per_labor_hour", precision = 8, scale = 2) private BigDecimal salesPerLaborHour;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum ReportStatus {
        DRAFT,
        FINALISED
    }
}
