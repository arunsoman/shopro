package mls.sho.dms.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.common.enums.StockMovementType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Immutable audit log of every ingredient movement in the kitchen.
 * Links shipments, sales, misfires, and prep into a single intelligence ledger.
 */
@Entity
@Table(name = "inventory_ingredient_ledger")
@Data
public class InventoryIngredientLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private StockMovementType eventType;

    // -- Movement (Store in Standard Base Unit) --
    // Positive for IN, Negative for OUT
    @Column(nullable = false, precision = 12, scale = 4)
    private BigDecimal quantity;

    @Column(name = "unit_cost", nullable = false, precision = 12, scale = 4)
    private BigDecimal unitCost;

    @Column(name = "total_value", nullable = false, precision = 12, scale = 4)
    private BigDecimal totalValue;

    @Column(name = "tax_amount", precision = 12, scale = 4)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    // -- FIFO & Traceability ----------------------------------
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id")
    private InventoryActiveLot activeLot;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "grn_id")
    private Long grnId;

    @Column(name = "po_id")
    private Long poId;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "line_item_id")
    private Long lineItemId;

    @Column(name = "menu_id")
    private Long menuId;

    @Column(name = "recipe_id")
    private Long recipeId;

    @Column(name = "reason_code")
    private String reasonCode;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by")
    private String createdBy;

    @PrePersist
    protected void beforeSave() {
        if (quantity != null && unitCost != null) {
            this.totalValue = quantity.multiply(unitCost);
        }
    }
}
