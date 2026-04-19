package mls.sho.dms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Maps an ingredient to its preferred/preferred vendor/supplier.
 * Supports multiple suppliers per ingredient for competitive sourcing.
 * The "preferred" flag indicates the primary vendor for auto-PO generation.
 */
@Entity
@Table(name = "preferred_vendor",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "ingredient_id", "supplier_id"}))
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PreferredVendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    @JsonIgnore
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    @JsonIgnoreProperties({"id", "description", "itemCode"})
    private Ingredient ingredient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    @JsonIgnoreProperties({"id", "name", "contactName", "phone", "email"})
    private Supplier supplier;

    @Column(name = "is_preferred", nullable = false)
    private boolean preferred = true;

    @Column(name = "unit_cost", precision = 10, scale = 4)
    private BigDecimal unitCost;

    @Column(name = "lead_time_days")
    private Integer leadTimeDays;

    @Column(name = "minimum_order_qty")
    private BigDecimal minimumOrderQty;

    @Column(name = "discount_pct", precision = 5, scale = 4)
    private BigDecimal discountPct;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
