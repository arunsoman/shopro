package mls.sho.dms.entity.inventory.ingredient;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.inventory.stock.RestockingMode;
import mls.sho.dms.entity.inventory.vendor.Supplier;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.generator.EventType;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

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
@Getter
@Setter
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

    @Enumerated(EnumType.STRING)
    @Column(name = "restocking_mode", nullable = false, length = 20)
    private RestockingMode restockingMode = RestockingMode.MANUAL;

    @Column(name = "shelf_life_days", nullable = false)
    private int shelfLifeDays = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "storage_type", nullable = false, length = 20)
    private StorageType storageType = StorageType.AMBIENT;

    @Column(name = "daily_restock_enrolled", nullable = false)
    private boolean dailyRestockEnrolled = false;

    @Column(name = "item_code", nullable = false, length = 10, unique = true)
    private String itemCode;

    @Column(name = "item_description", length = 200)
    private String itemDescription;

    @Column(name = "case_pack", length = 100)
    private String casePack;

    /** Purchase Unit (PU) - e.g. "Case", "Each" */
    @Column(name = "purchase_unit", length = 20)
    private String purchaseUnit;

    /** Recipe Cost Unit (RU) - e.g. "oz", "lb" */
    @Column(name = "recipe_unit", length = 20)
    private String recipeUnit;

    /** Conversion factor: number of RU per PU. Must be > 0. */
    @Column(name = "ru_per_pu", precision = 12, scale = 4)
    private BigDecimal ruPerPu = BigDecimal.ONE;

    /** Inventory Unit (IU) - Unit for physical counting */
    @Column(name = "inventory_unit", length = 20)
    private String inventoryUnit;

    /** Conversion factor: number of IU per PU. Must be > 0. */
    @Column(name = "iu_per_pu", precision = 12, scale = 4)
    private BigDecimal iuPerPu = BigDecimal.ONE;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 50)
    private IngredientCategory managementCategory;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "bid_supplier_pool", columnDefinition = "jsonb")
    private List<UUID> bidSupplierPool = new java.util.ArrayList<>();

    @Column(name = "bid_closing_days", nullable = false)
    @ColumnDefault("1")
    private int bidClosingDays = 1;

    @Column(name = "expected_arrival_days", nullable = false)
    @ColumnDefault("3")
    private int expectedArrivalDays = 3;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "raw_ingredient_allergen", joinColumns = @JoinColumn(name = "ingredient_id",
            foreignKey = @ForeignKey(name = "fk_allergen_ingredient")))
    @Enumerated(EnumType.STRING)
    @Column(name = "allergen", length = 30)
    private java.util.Set<Allergen> allergens = new java.util.HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;
    /** RU Cost = Current Price / (# RU per PU) / Yield % */
    public BigDecimal calculateRuCost() {
        if (ruPerPu == null || ruPerPu.compareTo(BigDecimal.ZERO) <= 0 || yieldPct == null || yieldPct.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return getCostPerUnit().divide(ruPerPu, 4, java.math.RoundingMode.HALF_UP).divide(yieldPct, 4, java.math.RoundingMode.HALF_UP);
    }

    /** IU Cost = Current Price / (# IU per PU) */
    public BigDecimal calculateIuCost() {
        if (iuPerPu == null || iuPerPu.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return getCostPerUnit().divide(iuPerPu, 4, java.math.RoundingMode.HALF_UP);
    }
}
