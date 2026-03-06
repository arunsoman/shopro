package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.math.BigDecimal;

/**
 * A single purchasable ingredient tracked at the raw material level.
 *
 * PostgreSQL strategy:
 *   - Generated column `effective_cost_per_unit = cost_per_unit / yield_pct`:
 *     computed in the database, always consistent with source values.
 *     DDL: effective_cost_per_unit NUMERIC(10,4) GENERATED ALWAYS AS (cost_per_unit / yield_pct) STORED
 *   - Composite index on (current_stock <= reorder_point) supports fast low-stock alert queries:
 *     Use partial index: WHERE current_stock <= reorder_point
 *   - yieldPct: stored as decimal (e.g., 0.80 = 80%). Default 1.00 = full yield.
 */
@Entity
@Table(
    name = "raw_ingredient",
    indexes = {
        @Index(name = "idx_ingredient_low_stock",  columnList = "current_stock, reorder_point"),
        @Index(name = "idx_ingredient_supplier",   columnList = "supplier_id"),
        @Index(name = "uq_ingredient_name",        columnList = "name", unique = true)
    }
)
public class RawIngredient extends BaseEntity {

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    /** Unit of measure (e.g., "oz", "kg", "each", "liter"). */
    @Column(name = "unit_of_measure", nullable = false, length = 20)
    private String unitOfMeasure;

    /** Latest cost per raw purchase unit. Updated when a PO is received. */
    @Column(name = "cost_per_unit", nullable = false, precision = 10, scale = 4)
    private BigDecimal costPerUnit;

    /**
     * Yield fraction (0.01 to 1.00). Represents usable ratio after trim/cook loss.
     * 1.00 = 100% yield (no loss). 0.80 = 80% usable.
     */
    @Column(name = "yield_pct", nullable = false, precision = 5, scale = 4)
    private BigDecimal yieldPct = BigDecimal.ONE;

    /**
     * Computed column: effectiveCostPerUnit = costPerUnit / yieldPct.
     * Inserted and updated only via the DB generated column expression.
     * Read-only in the application layer.
     */
    @Generated(event = EventType.INSERT)
    @Column(name = "effective_cost_per_unit", insertable = false, updatable = false, precision = 10, scale = 4)
    private BigDecimal effectiveCostPerUnit;

    @Column(name = "current_stock", nullable = false, precision = 12, scale = 4)
    private BigDecimal currentStock = BigDecimal.ZERO;

    /** Par level — the ideal maximum stock target for this ingredient. */
    @Column(name = "par_level", nullable = false, precision = 12, scale = 4)
    private BigDecimal parLevel = BigDecimal.ZERO;

    /** Threshold below which an automatic low-stock alert is fired. */
    @Column(name = "reorder_point", nullable = false, precision = 12, scale = 4)
    private BigDecimal reorderPoint = BigDecimal.ZERO;

    @Column(name = "safety_level", nullable = false, precision = 12, scale = 4)
    private BigDecimal safetyLevel = BigDecimal.ZERO;

    @Column(name = "critical_level", nullable = false, precision = 12, scale = 4)
    private BigDecimal criticalLevel = BigDecimal.ZERO;

    @Column(name = "max_stock_level", nullable = false, precision = 12, scale = 4)
    private BigDecimal maxStockLevel = BigDecimal.ZERO;

    @Column(name = "auto_replenish", nullable = false)
    private boolean autoReplenish = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "raw_ingredient_allergen", joinColumns = @JoinColumn(name = "ingredient_id",
            foreignKey = @ForeignKey(name = "fk_allergen_ingredient")))
    @Enumerated(EnumType.STRING)
    @Column(name = "allergen", length = 30)
    private java.util.Set<Allergen> allergens = new java.util.HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    public String getName() { return name; }
    public void setName(String n) { this.name = n; }
    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String u) { this.unitOfMeasure = u; }
    public BigDecimal getCostPerUnit() { return costPerUnit; }
    public void setCostPerUnit(BigDecimal c) { this.costPerUnit = c; }
    public BigDecimal getYieldPct() { return yieldPct; }
    public void setYieldPct(BigDecimal y) { this.yieldPct = y; }
    public BigDecimal getEffectiveCostPerUnit() { return effectiveCostPerUnit; }
    public void setEffectiveCostPerUnit(BigDecimal e) { this.effectiveCostPerUnit = e; }
    public BigDecimal getCurrentStock() { return currentStock; }
    public void setCurrentStock(BigDecimal s) { this.currentStock = s; }
    public BigDecimal getParLevel() { return parLevel; }
    public void setParLevel(BigDecimal p) { this.parLevel = p; }
    public BigDecimal getReorderPoint() { return reorderPoint; }
    public void setReorderPoint(BigDecimal r) { this.reorderPoint = r; }
    public BigDecimal getSafetyLevel() { return safetyLevel; }
    public void setSafetyLevel(BigDecimal safetyLevel) { this.safetyLevel = safetyLevel; }
    public BigDecimal getCriticalLevel() { return criticalLevel; }
    public void setCriticalLevel(BigDecimal criticalLevel) { this.criticalLevel = criticalLevel; }
    public BigDecimal getMaxStockLevel() { return maxStockLevel; }
    public void setMaxStockLevel(BigDecimal maxStockLevel) { this.maxStockLevel = maxStockLevel; }
    public boolean isAutoReplenish() { return autoReplenish; }
    public void setAutoReplenish(boolean autoReplenish) { this.autoReplenish = autoReplenish; }
    public java.util.Set<Allergen> getAllergens() { return allergens; }
    public void setAllergens(java.util.Set<Allergen> allergens) { this.allergens = allergens; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier s) { this.supplier = s; }
}
