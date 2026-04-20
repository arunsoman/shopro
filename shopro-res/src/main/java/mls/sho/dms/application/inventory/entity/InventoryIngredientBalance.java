package mls.sho.dms.application.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import mls.sho.dms.entity.Restaurant;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Summary table for real-time ingredient balance lookups.
 * Maintained by {@link mls.sho.dms.application.inventory.service.InventoryBalanceService}
 * (application layer) — NOT by DB triggers.
 *
 * <p>Invariant: {@code currentBalance >= 0}. The DB enforces this via
 * {@code chk_balance_not_negative}; the application enforces it by clamping
 * in {@link #apply(InventoryIngredientLedger)}.</p>
 *
 * Query performance: O(1) instead of O(n) aggregation.
 */
@Entity
@Table(name = "inventory_ingredient_balance",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "ingredient_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryIngredientBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    /**
     * Current available balance (sum of all ledger entries).
     * Positive = in stock, Negative = depleted (should not happen in production).
     */
    @Column(name = "current_balance", nullable = false, precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal currentBalance = BigDecimal.ZERO;

    /**
     * Timestamp of most recent ledger entry for this ingredient.
     */
    @Column(name = "last_movement_at", nullable = false)
    private LocalDateTime lastMovementAt;

    /**
     * Type of last movement (RECEIPT, DEPLETION, WASTE, ADJUSTMENT).
     */
    @Column(name = "last_movement_type", length = 50)
    private String lastMovementType;

    /**
     * Most recent lot ID used (for FIFO tracking).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_lot_id")
    private InventoryActiveLot lastLot;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void beforeInsert() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void beforeUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Check if ingredient is available for ordering.
     * 
     * @param requiredQty Required quantity for order
     * @return true if current_balance >= requiredQty
     */
    @Transient
    public boolean isAvailable(BigDecimal requiredQty) {
        return currentBalance != null && currentBalance.compareTo(requiredQty) >= 0;
    }

    /**
     * Check if ingredient is out of stock.
     * 
     * @return true if current_balance <= 0
     */
    @Transient
    public boolean isOutOfStock() {
        return currentBalance == null || currentBalance.compareTo(BigDecimal.ZERO) <= 0;
    }

    /**
     * Check if ingredient is low on stock (below reorder point).
     * 
     * @return true if current_balance <= reorder_point
     */
    @Transient
    public boolean isLowStock() {
        if (ingredient == null || ingredient.getParLevel() == null) {
            return false;
        }
        return currentBalance != null && currentBalance.compareTo(ingredient.getParLevel()) <= 0;
    }

    /**
     * Get stock status as enum-like string.
     * 
     * @return "OUT_OF_STOCK", "LOW_STOCK", or "OK"
     */
    @Transient
    public String getStockStatus() {
        if (isOutOfStock()) {
            return "OUT_OF_STOCK";
        } else if (isLowStock()) {
            return "LOW_STOCK";
        } else {
            return "OK";
        }
    }

    /**
     * Calculate how much more can be ordered before running out.
     * 
     * @return Available quantity (current_balance - 0)
     */
    @Transient
    public BigDecimal getAvailableQty() {
        return currentBalance != null && currentBalance.compareTo(BigDecimal.ZERO) > 0 
            ? currentBalance 
            : BigDecimal.ZERO;
    }

    /**
     * Calculate shortage if a specific quantity is requested.
     * 
     * @param requiredQty Requested quantity
     * @return Shortage amount (0 if sufficient stock)
     */
    @Transient
    public BigDecimal getShortage(BigDecimal requiredQty) {
        if (currentBalance == null || requiredQty == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal shortage = requiredQty.subtract(currentBalance);
        return shortage.compareTo(BigDecimal.ZERO) > 0 ? shortage : BigDecimal.ZERO;
    }

    // -----------------------------------------------------------------------
    // Factory & mutation
    // -----------------------------------------------------------------------

    /**
     * Creates a new, unpersisted balance row initialised to zero.
     * Called by {@link mls.sho.dms.application.inventory.service.InventoryBalanceService}
     * when a ledger entry arrives for an ingredient that has no balance row yet.
     */
    public static InventoryIngredientBalance zero(Restaurant restaurant, Ingredient ingredient) {
        InventoryIngredientBalance b = new InventoryIngredientBalance();
        b.setRestaurant(restaurant);
        b.setIngredient(ingredient);
        b.setCurrentBalance(BigDecimal.ZERO);
        b.setLastMovementAt(java.time.LocalDateTime.now());
        b.setCreatedAt(java.time.LocalDateTime.now());
        b.setUpdatedAt(java.time.LocalDateTime.now());
        return b;
    }

    /**
     * Atomically applies a ledger entry's quantity delta to {@code currentBalance}.
     *
     * <p>Balance is <em>clamped to zero</em> — it will never go negative, matching
     * the {@code chk_balance_not_negative} DB constraint.</p>
     *
     * @param entry a persisted ledger entry
     */
    public void apply(InventoryIngredientLedger entry) {
        if (entry == null || entry.getQuantity() == null) return;

        BigDecimal raw = (this.currentBalance != null ? this.currentBalance : BigDecimal.ZERO)
                .add(entry.getQuantity());

        // Clamp: balance must not go below zero (DB constraint + business rule)
        this.currentBalance = raw.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : raw;
        this.lastMovementAt = entry.getCreatedAt() != null
                ? entry.getCreatedAt() : java.time.LocalDateTime.now();
        this.lastMovementType = entry.getEventType() != null
                ? entry.getEventType().name() : this.lastMovementType;
        this.lastLot = entry.getActiveLot() != null ? entry.getActiveLot() : this.lastLot;
        this.updatedAt = java.time.LocalDateTime.now();
    }
}
