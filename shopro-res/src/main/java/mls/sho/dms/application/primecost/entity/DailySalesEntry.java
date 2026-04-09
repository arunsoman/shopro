package mls.sho.dms.application.primecost.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.entity.Restaurant;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Daily sales entry - manual fallback for non-POS restaurants.
 */
@Entity
@Table(name = "daily_sales_entry",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "sales_date"}),
       indexes = @Index(name = "idx_sales_res_date", columnList = "restaurant_id, sales_date"))
@Data
public class DailySalesEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "sales_date", nullable = false)
    private LocalDate salesDate;

    @Column(name = "food_sales", precision = 12, scale = 2)        private BigDecimal foodSales;
    @Column(name = "soft_bev_sales", precision = 12, scale = 2)    private BigDecimal softBevSales;
    @Column(name = "liquor_sales", precision = 12, scale = 2)      private BigDecimal liquorSales;
    @Column(name = "bottle_beer_sales", precision = 12, scale = 2) private BigDecimal bottleBeerSales;
    @Column(name = "draft_beer_sales", precision = 12, scale = 2)  private BigDecimal draftBeerSales;
    @Column(name = "wine_sales", precision = 12, scale = 2)        private BigDecimal wineSales;
    @Column(name = "merch_sales", precision = 12, scale = 2)       private BigDecimal merchSales;
    @Column(name = "comps_discounts", precision = 12, scale = 2)   private BigDecimal compsDiscounts;
    @Column(name = "guest_count")                              private Integer    guestCount;

    @Column(name = "source", nullable = false)
    private String source; // "POS" or "MANUAL"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
