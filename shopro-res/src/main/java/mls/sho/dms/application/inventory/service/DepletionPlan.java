package mls.sho.dms.application.inventory.service;

import lombok.Data;
import lombok.Builder;
import mls.sho.dms.common.enums.RecipeType;
import mls.sho.dms.common.enums.StockMovementType;

import java.math.BigDecimal;
import java.util.*;

/**
 * Immutable blueprint for a bulk FIFO depletion operation.
 *
 * Built by {@link DepletionPlanner} in a single pass over order lines,
 * then consumed by {@link DepletionExecutor} — the two phases never overlap.
 *
 * DESIGN DECISIONS:
 * ──────────────────
 * 1. Per-line context is PRESERVED — each ingredient requirement tracks which
 *    order line it came from, its own fulfillment_key, menuId, and lineItemId.
 *    This prevents the "fulfillment_key uniqueness lost" bug.
 *
 * 2. Deduplication of lot queries — the planner aggregates all unique ingredient IDs
 *    so the executor can fetch lots in a single SELECT FOR UPDATE.
 *
 * 3. Recursive recipe expansion is handled in the planner phase (read-only),
 *    not during the locking/write phase.
 */
public class DepletionPlan {

    /**
     * A single ingredient's total requirement across ALL order lines,
     * with per-line attribution preserved for ledger entry creation.
     */
    @Data
    @Builder
    public static class IngredientRequirement {
        private final Long ingredientId;
        /** Sum of all line contributions (after yield & batch adjustments). */
        private final BigDecimal totalQty;
        /** Per-line breakdown — each becomes its own ledger entry. */
        private final List<LineContribution> lineContributions;
    }

    /**
     * One order line's share of depletion for a specific ingredient.
     * Each of these becomes one InventoryIngredientLedger row.
     */
    @Data
    @Builder
    public static class LineContribution {
        private final Long orderLineId;
        private final Long menuItemId;
        private final String fulfillmentKey;
        /** This line's share of the total qty (after yield & batch adjustments). */
        private final BigDecimal quantity;
    }

    // ── Plan fields ──────────────────────────────────────────

    /** Restaurant ID (for the lot query). */
    private final Long restaurantId;

    /** What movement type to record (DEPLETION, MISFIRE, DISCARD). */
    private final StockMovementType movementType;

    /** Order ID (nullable for non-order depletions like discards). */
    private final Long orderId;

    /** Ingredient requirements keyed by ingredientId for O(1) lookup. */
    private final Map<Long, IngredientRequirement> requirements;

    /** All unique ingredient IDs — feed directly into the IN clause. */
    private final Set<Long> ingredientIds;

    /** Table context (nullable for non-dine-in). */
    private final Long tableId;
    private final UUID staffId;

    /** Timestamp for ledger entries. */
    private final java.time.LocalDateTime orderDate;

    /** Actor string (e.g. "SYSTEM", "KITCHEN_AGENT"). */
    private final String actor;

    /** Reason code (nullable). */
    private final String reason;


    DepletionPlan(Long restaurantId, StockMovementType movementType, Long orderId,
                  Map<Long, IngredientRequirement> requirements,
                  Long tableId, UUID staffId,
                  java.time.LocalDateTime orderDate, String actor, String reason) {
        this.restaurantId = restaurantId;
        this.movementType = movementType;
        this.orderId = orderId;
        this.requirements = Collections.unmodifiableMap(requirements);
        this.ingredientIds = Collections.unmodifiableSet(requirements.keySet());
        this.tableId = tableId;
        this.staffId = staffId;
        this.orderDate = orderDate;
        this.actor = actor;
        this.reason = reason;
    }

    public Long getRestaurantId() { return restaurantId; }
    public StockMovementType getMovementType() { return movementType; }
    public Long getOrderId() { return orderId; }
    public Map<Long, IngredientRequirement> getRequirements() { return requirements; }
    public Set<Long> getIngredientIds() { return ingredientIds; }
    public Long getTableId() { return tableId; }
    public UUID getStaffId() { return staffId; }
    public java.time.LocalDateTime getOrderDate() { return orderDate; }
    public String getActor() { return actor; }
    public String getReason() { return reason; }
}