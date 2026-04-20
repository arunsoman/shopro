package mls.sho.dms.application.inventory.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.inventory.entity.*;
import mls.sho.dms.application.inventory.repository.InventoryActiveLotRepository;
import mls.sho.dms.application.inventory.service.InventoryBalanceService;
import mls.sho.dms.application.inventory.repository.InventoryLedgerRepository;
import mls.sho.dms.application.inventory.repository.InventoryWasteRepository;
import mls.sho.dms.application.purchasing.entity.Supplier;
import mls.sho.dms.common.enums.StockMovementType;
import mls.sho.dms.entity.Restaurant;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Phase 2 & 3: Executes a {@link DepletionPlan} against the database.
 *
 * ARCHITECTURE:
 * ─────────────
 * 1. SINGLE bulk SELECT … FOR UPDATE — acquires PESSIMISTIC_WRITE locks on ALL
 *    relevant lots in ONE round-trip, in deterministic order (ingredient_id ASC)
 *    to prevent deadlocks from concurrent orders.
 *
 * 2. IN-MEMORY FIFO matching — iterates pre-fetched lots per ingredient,
 *    building ledger entries per {@link DepletionPlan.LineContribution}
 *    (preserves per-line fulfillment_key and menuId).
 *
 * 3. BATCH PERSIST — uses saveAll() with Hibernate jdbc.batch_size enabled
 *    for true multi-row INSERT/UPDATE in minimal round-trips.
 *
 * CONCURRENCY GUARANTEE:
 * ─────────────────────
 * PESSIMISTIC_WRITE locks on all candidate lots are acquired BEFORE any
 * in-memory mutation.  Concurrent orders hitting the same lots will block
 * at step 1 until the first transaction commits.  Lock ordering is
 * deterministic (by ingredient_id → expiry_date → lot id) so no deadlocks.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DepletionExecutor {

    private final InventoryActiveLotRepository activeLotRepository;
    private final InventoryLedgerRepository ledgerRepository;
    private final InventoryWasteRepository wasteRepository;
    private final InventoryBalanceService balanceService;

    /**
     * Execute the plan: lock lots → match FIFO → batch persist.
     *
     * @return list of created ledger entries (for callers that need them)
     */
    @Transactional
    public List<InventoryIngredientLedger> execute(DepletionPlan plan) {
        if (plan == null || plan.getRequirements().isEmpty()) return List.of();

        // ── Step 1: Bulk Lock & Fetch ────────────────────────
        // Single query — acquires PESSIMISTIC_WRITE on all relevant lots
        // in ingredient_id order (deadlock prevention).
        List<InventoryActiveLot> lockedLots = activeLotRepository
                .findAvailableLotsForUpdateByIngredientIds(
                        plan.getRestaurantId(),
                        new ArrayList<>(plan.getIngredientIds()));

        // Build O(1) lookup: ingredientId → ordered list of lots
        Map<Long, List<InventoryActiveLot>> lotsByIngredient = new LinkedHashMap<>();
        for (InventoryActiveLot lot : lockedLots) {
            lotsByIngredient.computeIfAbsent(
                    lot.getIngredient().getId(), k -> new ArrayList<>()).add(lot);
        }

        // Load ingredient master data for fallback cost on stockout
        Map<Long, Ingredient> ingredientMasters = new HashMap<>();
        for (InventoryActiveLot lot : lockedLots) {
            ingredientMasters.putIfAbsent(lot.getIngredient().getId(), lot.getIngredient());
        }
        // Also load masters for ingredients with no lots at all (stockout)
        for (Long ingId : plan.getIngredientIds()) {
            if (!ingredientMasters.containsKey(ingId)) {
                // No lots at all for this ingredient — will use fallback cost
                // The first lot we encounter or the ingredient itself from the plan
                // We don't have the entity yet — the stockout path handles this
            }
        }

        // ── Step 2: In-Memory FIFO Match ─────────────────────
        // Build a mutable availableQty tracker per lot (don't mutate entities yet)
        Map<Long, BigDecimal> lotAvailableTracker = new LinkedHashMap<>();
        for (InventoryActiveLot lot : lockedLots) {
            lotAvailableTracker.put(lot.getId(), lot.getAvailableQty());
        }

        List<InventoryIngredientLedger> ledgerEntries = new ArrayList<>();
        List<InventoryWasteRegistry> wasteEntries = new ArrayList<>();
        List<InventoryActiveLot> lotsToUpdate = new ArrayList<>();

        // Process each ingredient requirement
        for (var entry : plan.getRequirements().entrySet()) {
            Long ingredientId = entry.getKey();
            DepletionPlan.IngredientRequirement req = entry.getValue();
            List<InventoryActiveLot> lots = lotsByIngredient.getOrDefault(ingredientId, List.of());

            // Process each line contribution SEPARATELY to preserve per-line context
            for (DepletionPlan.LineContribution contrib : req.getLineContributions()) {
                BigDecimal remaining = contrib.getQuantity();

                for (InventoryActiveLot lot : lots) {
                    if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

                    BigDecimal available = lotAvailableTracker.getOrDefault(lot.getId(), BigDecimal.ZERO);
                    if (available.compareTo(BigDecimal.ZERO) <= 0) continue;

                    BigDecimal take = available.min(remaining);

                    // Update tracker (not entity yet)
                    lotAvailableTracker.put(lot.getId(), available.subtract(take));

                    // Build ledger entry for this line's consumption from this lot
                    BigDecimal taxContrib = BigDecimal.ZERO;
                    if (lot.getInitialQty().compareTo(BigDecimal.ZERO) > 0) {
                        taxContrib = lot.getTaxAmount()
                                .multiply(take)
                                .divide(lot.getInitialQty(), 4, RoundingMode.HALF_UP);
                    }

                    InventoryIngredientLedger ledgerEntry = buildLedgerEntry(
                            plan, ingredientId, contrib, take.negate(),
                            lot.getUnitPrice(), taxContrib.negate(),
                            lot, "LOT_CONSUMED");

                    ledgerEntries.add(ledgerEntry);

                    if (isWasteType(plan.getMovementType())) {
                        wasteEntries.add(buildWasteRegistry(ledgerEntry, plan, contrib));
                    }

                    remaining = remaining.subtract(take);
                }

                // ── Over-depletion / Stockout ────────────────
                // If this line still has unmet quantity (no lots left), record it
                // as a lot-less entry for Theoretical-vs-Actual accuracy.
                if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal fallbackCost = getFallbackCost(lots, ingredientId);
                    InventoryIngredientLedger stockoutEntry = buildLedgerEntry(
                            plan, ingredientId, contrib, remaining.negate(),
                            fallbackCost, BigDecimal.ZERO,
                            null, "OVER_DEPLETION_STOCKOUT");

                    ledgerEntries.add(stockoutEntry);

                    if (isWasteType(plan.getMovementType())) {
                        wasteEntries.add(buildWasteRegistry(stockoutEntry, plan, contrib));
                    }
                }
            }
        }

        // ── Step 3: Apply lot mutations from tracker ─────────
        for (InventoryActiveLot lot : lockedLots) {
            BigDecimal newQty = lotAvailableTracker.getOrDefault(lot.getId(), lot.getAvailableQty());
            if (newQty.compareTo(lot.getAvailableQty()) != 0) {
                lot.setAvailableQty(newQty);
                // @PreUpdate will auto-deactivate if availableQty <= 0
                lotsToUpdate.add(lot);
            }
        }

        // ── Step 4: Batch Persist ────────────────────────────
        if (!lotsToUpdate.isEmpty()) {
            activeLotRepository.saveAll(lotsToUpdate);
        }
        if (!ledgerEntries.isEmpty()) {
            ledgerRepository.saveAll(ledgerEntries);
            balanceService.applyLedgerEntries(ledgerEntries);
        }
        if (!wasteEntries.isEmpty()) {
            wasteRepository.saveAll(wasteEntries);
        }

        log.info("Depletion executed: restaurant={} orderId={} ingredients={} ledgerEntries={} lotsModified={}",
                plan.getRestaurantId(), plan.getOrderId(),
                plan.getIngredientIds().size(), ledgerEntries.size(), lotsToUpdate.size());

        return ledgerEntries;
    }

    // ── Helpers ──────────────────────────────────────────────

    private InventoryIngredientLedger buildLedgerEntry(
            DepletionPlan plan, Long ingredientId,
            DepletionPlan.LineContribution contrib,
            BigDecimal quantity, BigDecimal unitCost, BigDecimal taxAmount,
            InventoryActiveLot lot, String reasonCode,
            Ingredient ingredientEntity) {

        InventoryIngredientLedger entry = new InventoryIngredientLedger();
        entry.setRestaurant(null); // will be set from the ingredient or lot
        entry.setIngredient(ingredientEntity);
        entry.setEventType(plan.getMovementType());
        entry.setQuantity(quantity);
        entry.setUnitCost(unitCost);
        entry.setTaxAmount(taxAmount);
        entry.setActiveLot(lot);
        entry.setGrnId(lot != null && lot.getGoodsReceipt() != null ? lot.getGoodsReceipt().getId() : null);
        entry.setPoId(lot != null && lot.getGoodsReceipt() != null && lot.getGoodsReceipt().getPurchaseOrder() != null
                ? lot.getGoodsReceipt().getPurchaseOrder().getId() : null);
        entry.setSupplierId(lot != null && lot.getSupplier() != null ? lot.getSupplier().getId() : null);
        entry.setOrderId(plan.getOrderId());
        entry.setLineItemId(contrib.getOrderLineId());
        entry.setMenuId(contrib.getMenuItemId());
        entry.setFulfillmentKey(contrib.getFulfillmentKey());
        entry.setTableId(plan.getTableId());
        entry.setStaffId(plan.getStaffId());
        entry.setReasonCode(reasonCode);
        if (plan.getOrderDate() != null) entry.setCreatedAt(plan.getOrderDate());
        entry.setCreatedBy(plan.getActor());
        entry.setTotalValue(quantity.multiply(unitCost).add(taxAmount != null ? taxAmount : BigDecimal.ZERO)
                .setScale(4, RoundingMode.HALF_UP));

        return entry;
    }

    private BigDecimal getFallbackCost(List<InventoryActiveLot> lots, Long ingredientId) {
        // Use the last known price from any existing lot
        if (lots != null && !lots.isEmpty()) {
            return lots.get(0).getUnitPrice();
        }
        // No lots at all — will be filled by caller if ingredient master is available
        return BigDecimal.ZERO;
    }

    private boolean isWasteType(StockMovementType type) {
        return type == StockMovementType.MISFIRE || type == StockMovementType.DISCARD;
    }

    private InventoryWasteRegistry buildWasteRegistry(InventoryIngredientLedger ledger,
                                                       DepletionPlan plan,
                                                       DepletionPlan.LineContribution contrib) {
        InventoryWasteRegistry waste = new InventoryWasteRegistry();
        waste.setLedger(ledger);
        waste.setOrderId(plan.getOrderId());
        waste.setMenuId(contrib.getMenuItemId());
        waste.setStaffId(plan.getStaffId());
        waste.setReasonCode(plan.getReason() != null ? plan.getReason() : "UNSPECIFIED");
        return waste;
    }
}