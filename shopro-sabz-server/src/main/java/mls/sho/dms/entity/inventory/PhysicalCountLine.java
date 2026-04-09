package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.math.BigDecimal;

/**
 * One ingredient line within a PhysicalCount session.
 *
 * PostgreSQL strategy:
 *   - Generated column `variance = counted_qty - expected_qty`.
 *     DDL: variance NUMERIC(12,4) GENERATED ALWAYS AS (counted_qty - expected_qty) STORED
 *   - The application-layer reconciliation job reads variance to create MANUAL_ADJUSTMENT
 *     InventoryTransaction records and updates RawIngredient.currentStock.
 */
@Entity
@Table(
    name = "physical_count_line",
    indexes = {
        @Index(name = "idx_count_line_count",      columnList = "physical_count_id"),
        @Index(name = "idx_count_line_ingredient",  columnList = "ingredient_id"),
        @Index(name = "uq_count_line",             columnList = "physical_count_id, ingredient_id", unique = true)
    }
)
public class PhysicalCountLine extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "physical_count_id", nullable = false)
    private PhysicalCount physicalCount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private RawIngredient ingredient;

    @Column(name = "expected_qty", nullable = false, precision = 12, scale = 4)
    private BigDecimal expectedQty;

    @Column(name = "counted_qty", nullable = false, precision = 12, scale = 4)
    private BigDecimal countedQty;

    /**
     * Generated column: variance = counted_qty - expected_qty.
     * Positive = overage, Negative = shrinkage. Read-only in the application.
     */
    @Generated(event = EventType.INSERT)
    @Column(name = "variance", insertable = false, updatable = false, precision = 12, scale = 4)
    private BigDecimal variance;

    public PhysicalCount getPhysicalCount() { return physicalCount; }
    public void setPhysicalCount(PhysicalCount physicalCount) { this.physicalCount = physicalCount; }
    public RawIngredient getIngredient() { return ingredient; }
    public void setIngredient(RawIngredient ingredient) { this.ingredient = ingredient; }
    public BigDecimal getExpectedQty() { return expectedQty; }
    public void setExpectedQty(BigDecimal expectedQty) { this.expectedQty = expectedQty; }
    public BigDecimal getCountedQty() { return countedQty; }
    public void setCountedQty(BigDecimal countedQty) { this.countedQty = countedQty; }
    /** Read-only — computed by PostgreSQL. Do not set. */
    public BigDecimal getVariance() { return variance; }
}
