package mls.sho.dms.application.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.entity.Ingredient;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * One ingredient line inside a physical inventory count period.
 */
@Entity
@Table(name = "physical_inventory_line",
       indexes = @Index(name = "idx_pil_period", columnList = "period_id"))
@Data
public class PhysicalInventoryLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private PhysicalInventoryPeriod period;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    /** Expected quantity derived from the perpetual ledger at period open. */
    @Column(name = "expected_qty", precision = 12, scale = 4)
    private BigDecimal expectedQty = BigDecimal.ZERO;

    /** Physically counted quantity entered by staff. */
    @Column(name = "counted_qty", precision = 12, scale = 4)
    private BigDecimal countedQty;

    /** counted - expected (positive = overage, negative = shortage). */
    @Column(name = "variance", precision = 12, scale = 4)
    private BigDecimal variance;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
