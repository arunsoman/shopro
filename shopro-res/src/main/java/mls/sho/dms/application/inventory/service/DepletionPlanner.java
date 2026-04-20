package mls.sho.dms.application.inventory.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.costing.entity.Recipe;
import mls.sho.dms.application.costing.entity.RecipeIngredientLine;
import mls.sho.dms.application.inventory.entity.Ingredient;
import mls.sho.dms.application.pos.entity.MenuItem;
import mls.sho.dms.application.pos.entity.Order;
import mls.sho.dms.application.pos.entity.OrderLine;
import mls.sho.dms.common.enums.RecipeType;
import mls.sho.dms.common.enums.StockMovementType;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.application.pos.repository.TableStaffMapRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Phase 1: Builds a {@link DepletionPlan} from an Order.
 *
 * This is a PURE COMPUTATION — no DB reads, no locks, no side effects.
 * Runs outside any transaction boundary.
 *
 * KEY PROPERTIES:
 * ──────────────
 * 1. Aggregates all ingredient requirements from all order lines
 *    into a single map keyed by ingredientId.
 *
 * 2. Preserves per-line context (fulfillmentKey, menuId, lineItemId)
 *    so that each ledger entry can be traced back to its source order line.
 *
 * 3. Handles BATCH vs PLATE recipe yield adjustments.
 *
 * 4. Applies ingredient yieldPct (trimming loss).
 *
 * 5. Deduplicates ingredients across lines — if 3 items all use Salt,
 *    Salt appears once in the plan with 3 LineContributions.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DepletionPlanner {

    private final TableStaffMapRepository tableStaffMapRepository;

    /**
     * Build a plan from a complete order (all lines).
     */
    public DepletionPlan planOrder(Order order) {
        return planOrder(order, order.getLines());
    }

    /**
     * Build a plan from only specific (new) lines — for delta depletion.
     */
    public DepletionPlan planDelta(Order order, List<OrderLine> lines) {
        return planOrder(order, lines);
    }

    /**
     * Build a plan for a single-item depletion (misfire, discard).
     */
    public DepletionPlan planSingleItem(Restaurant restaurant, MenuItem item,
                                         BigDecimal quantity, StockMovementType type,
                                         Long orderId, String reason, UUID staffId,
                                         LocalDateTime orderDate, String actor) {
        Map<Long, DepletionPlan.IngredientRequirement> requirements = new LinkedHashMap<>();
        expandRecipe(restaurant.getId(), item, quantity, orderId, reason, orderDate, requirements);

        return new DepletionPlan(restaurant.getId(), type, orderId,
                requirements, null, staffId, orderDate, actor, reason);
    }

    // ── Private ──────────────────────────────────────────────

    private DepletionPlan planOrder(Order order, List<OrderLine> lines) {
        if (order == null || lines == null || lines.isEmpty()) return null;

        Long restaurantId = order.getRestaurantId();
        Map<Long, DepletionPlan.IngredientRequirement> requirements = new LinkedHashMap<>();

        // Resolve table/staff context once
        Long tableId = null;
        UUID staffId = null;
        if (order.getSession() != null && order.getSession().getTable() != null) {
            tableId = order.getSession().getTable().getId();
            var assignment = tableStaffMapRepository.findPrimaryServerForTable(tableId).orElse(null);
            if (assignment != null) {
                staffId = assignment.getStaff().getStaffId();
            }
        }

        // Expand each order line into ingredient requirements
        for (OrderLine line : lines) {
            MenuItem item = line.getMenuItem();
            if (item == null) continue;

            String fulfillmentKey = "ORD:" + order.getId() + ":" + line.getId();
            BigDecimal orderQty = BigDecimal.valueOf(line.getQuantity());

            expandRecipeWithLineContext(restaurantId, item, orderQty,
                    order.getId(), line.getId(), item.getId(), fulfillmentKey,
                    requirements);
        }

        return new DepletionPlan(restaurantId, StockMovementType.DEPLETION, order.getId(),
                requirements, tableId, staffId, order.getCreatedAt(), "SYSTEM", "POS_SALE");
    }

    /**
     * Expand a single recipe into ingredient requirements, attaching per-line context.
     */
    private void expandRecipeWithLineContext(Long restaurantId, MenuItem item, BigDecimal quantity,
                                              Long orderId, Long orderLineId, Long menuItemId,
                                              String fulfillmentKey,
                                              Map<Long, DepletionPlan.IngredientRequirement> accumulator) {
        Recipe activeRecipe = item.getRecipes().stream()
                .filter(Recipe::isActive)
                .findFirst()
                .orElse(null);

        if (activeRecipe == null) return;

        BigDecimal recipeYieldQty = activeRecipe.getYieldQuantity();
        if (recipeYieldQty == null || recipeYieldQty.compareTo(BigDecimal.ZERO) <= 0) {
            recipeYieldQty = BigDecimal.ONE;
        }

        boolean isBatchRecipe = activeRecipe.getRecipeType() == RecipeType.BATCH;

        for (RecipeIngredientLine recipeLine : activeRecipe.getIngredientLines()) {
            BigDecimal baseUsage = quantity.multiply(recipeLine.getQuantityRu());

            BigDecimal adjustedUsage = baseUsage;
            if (isBatchRecipe && recipeYieldQty.compareTo(BigDecimal.ONE) > 0) {
                adjustedUsage = quantity.multiply(recipeLine.getQuantityRu())
                        .divide(recipeYieldQty, 6, RoundingMode.HALF_UP);
            }

            // Apply yieldPct for trimming loss
            Ingredient ingredient = recipeLine.getIngredient();
            if (ingredient != null && ingredient.getYieldPct() != null
                    && ingredient.getYieldPct().compareTo(BigDecimal.ZERO) > 0
                    && ingredient.getYieldPct().compareTo(BigDecimal.ONE) < 0) {
                adjustedUsage = adjustedUsage.divide(ingredient.getYieldPct(), 6, RoundingMode.HALF_UP);
            }

            if (ingredient == null) continue;

            final BigDecimal finalAdjustedUsage = adjustedUsage;

            // Build the LineContribution
            DepletionPlan.LineContribution contrib = DepletionPlan.LineContribution.builder()
                    .orderLineId(orderLineId)
                    .menuItemId(menuItemId)
                    .fulfillmentKey(fulfillmentKey)
                    .quantity(finalAdjustedUsage)
                    .build();

            // Merge into accumulator
            accumulator.compute(ingredient.getId(), (id, existing) -> {
                if (existing == null) {
                    return DepletionPlan.IngredientRequirement.builder()
                            .ingredientId(ingredient.getId())
                            .totalQty(finalAdjustedUsage)
                            .lineContributions(new ArrayList<>(List.of(contrib)))
                            .build();
                } else {
                    // Aggregate: add this line's contribution
                    List<DepletionPlan.LineContribution> merged = new ArrayList<>(existing.getLineContributions());
                    merged.add(contrib);
                    return DepletionPlan.IngredientRequirement.builder()
                            .ingredientId(ingredient.getId())
                            .totalQty(existing.getTotalQty().add(finalAdjustedUsage))
                            .lineContributions(merged)
                            .build();
                }
            });
        }
    }

    /**
     * Expand recipe WITHOUT line context (for single-item plans like misfire/discard).
     */
    private void expandRecipe(Long restaurantId, MenuItem item, BigDecimal quantity,
                               Long orderId, String reason, LocalDateTime orderDate,
                               Map<Long, DepletionPlan.IngredientRequirement> accumulator) {
        Recipe activeRecipe = item.getRecipes().stream()
                .filter(Recipe::isActive)
                .findFirst()
                .orElse(null);

        if (activeRecipe == null) return;

        BigDecimal recipeYieldQty = activeRecipe.getYieldQuantity();
        if (recipeYieldQty == null || recipeYieldQty.compareTo(BigDecimal.ZERO) <= 0) {
            recipeYieldQty = BigDecimal.ONE;
        }

        boolean isBatchRecipe = activeRecipe.getRecipeType() == RecipeType.BATCH;

        for (RecipeIngredientLine recipeLine : activeRecipe.getIngredientLines()) {
            BigDecimal adjustedUsage = quantity.multiply(recipeLine.getQuantityRu());
            if (isBatchRecipe && recipeYieldQty.compareTo(BigDecimal.ONE) > 0) {
                adjustedUsage = quantity.multiply(recipeLine.getQuantityRu())
                        .divide(recipeYieldQty, 6, RoundingMode.HALF_UP);
            }

            Ingredient ingredient = recipeLine.getIngredient();
            if (ingredient != null && ingredient.getYieldPct() != null
                    && ingredient.getYieldPct().compareTo(BigDecimal.ZERO) > 0
                    && ingredient.getYieldPct().compareTo(BigDecimal.ONE) < 0) {
                adjustedUsage = adjustedUsage.divide(ingredient.getYieldPct(), 6, RoundingMode.HALF_UP);
            }

            if (ingredient == null) continue;

            final BigDecimal finalAdjustedUsage = adjustedUsage;
            String fulfillmentKey = orderId != null
                    ? "ORD:" + orderId + ":" + item.getId()
                    : null;

            DepletionPlan.LineContribution contrib = DepletionPlan.LineContribution.builder()
                    .orderLineId(null)
                    .menuItemId(item.getId())
                    .fulfillmentKey(fulfillmentKey)
                    .quantity(finalAdjustedUsage)
                    .build();

            accumulator.compute(ingredient.getId(), (id, existing) -> {
                if (existing == null) {
                    return DepletionPlan.IngredientRequirement.builder()
                            .ingredientId(ingredient.getId())
                            .totalQty(finalAdjustedUsage)
                            .lineContributions(new ArrayList<>(List.of(contrib)))
                            .build();
                } else {
                    List<DepletionPlan.LineContribution> merged = new ArrayList<>(existing.getLineContributions());
                    merged.add(contrib);
                    return DepletionPlan.IngredientRequirement.builder()
                            .ingredientId(ingredient.getId())
                            .totalQty(existing.getTotalQty().add(finalAdjustedUsage))
                            .lineContributions(merged)
                            .build();
                }
            });
        }
    }
}