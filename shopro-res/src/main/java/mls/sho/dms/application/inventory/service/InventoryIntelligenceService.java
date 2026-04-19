package mls.sho.dms.application.inventory.service;
import java.util.Comparator;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.inventory.dto.InventoryIntelligenceDtos.*;
import mls.sho.dms.application.inventory.repository.InventoryActiveLotRepository;
import mls.sho.dms.application.inventory.repository.InventoryLedgerRepository;
import mls.sho.dms.application.inventory.repository.InventoryWasteRepository;
import mls.sho.dms.common.enums.StockMovementType;
import mls.sho.dms.entity.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryIntelligenceService {

    private final InventoryLedgerRepository ledgerRepository;
    private final InventoryActiveLotRepository activeLotRepository;
    private final InventoryWasteRepository wasteRepository;
    private final mls.sho.dms.application.analytics.service.ExperimentService experimentService;
    private final InventoryBalanceService balanceService;

    /**
     * Records physical shipment intake. 
     * Creates new active FIFO lots and corresponding ledger inflows.
     * Uses PO lines from the linked PurchaseOrder.
     */
    @Transactional
    public void receiveShipment(GoodsReceipt grn) {
        var restaurant = grn.getRestaurant();
        var supplier = grn.getSupplier();
        var grnId = grn.getId();
        var purchaseOrder = grn.getPurchaseOrder();
        
        for (PurchaseOrderLine lin : grn.getLines()) {
            if (lin.getReceivedQty() == null || lin.getReceivedQty().compareTo(BigDecimal.ZERO) <= 0) {
                continue; // Skip lines with no received quantity
            }
            Ingredient ingredient = lin.getIngredient();
            BigDecimal receivedQty = lin.getReceivedQty();
            BigDecimal unitPrice = lin.getUnitPrice();
            
            // 1. Create the FIFO Lot
            InventoryActiveLot lot = new InventoryActiveLot();
            lot.setRestaurant(restaurant);
            lot.setIngredient(ingredient);
            lot.setGoodsReceipt(grn);
            lot.setSupplier(supplier);
            lot.setInitialQty(receivedQty);
            lot.setAvailableQty(receivedQty);
            lot.setUnitPrice(unitPrice);
            lot.setReceivedAt(grn.getReceivedDate());
            activeLotRepository.save(lot);

            // 2. Create the Ledger Inflow Entry
            createLedgerEntry(restaurant, ingredient, StockMovementType.RECEIVING, 
                    receivedQty, unitPrice, BigDecimal.ZERO, lot, 
                    grnId, (purchaseOrder != null ? purchaseOrder.getId() : null), 
                    (supplier != null ? supplier.getId() : null), 
                    null, lin.getId(), null, grn.getReceivedDate(), "SYSTEM", "GRN_INTAKE");
        }
    }

    @Transactional
    public void receiveShipment(GoodsReceipt grn, Ingredient ingredient, BigDecimal quantity, BigDecimal unitCost, BigDecimal taxAmount, LocalDateTime createdAt) {
        // 1. Create FIFO Lot if it's a new arrival
        InventoryActiveLot lot = null;
        if (grn != null) {
            lot = new InventoryActiveLot();
            lot.setRestaurant(ingredient.getRestaurant());
            lot.setIngredient(ingredient);
            lot.setGoodsReceipt(grn);
            lot.setSupplier(grn.getSupplier());
            lot.setInitialQty(quantity);
            lot.setAvailableQty(quantity);
            lot.setUnitPrice(unitCost != null ? unitCost : BigDecimal.ZERO);
            lot.setTaxAmount(taxAmount != null ? taxAmount : BigDecimal.ZERO);
            if (createdAt != null) lot.setReceivedAt(createdAt);
            lot = activeLotRepository.save(lot);
        }

        // 2. Create Ledger entry
        createLedgerEntry(ingredient.getRestaurant(), ingredient, StockMovementType.RECEIVING,
                quantity, unitCost, taxAmount, lot, 
                (grn != null ? grn.getId() : null),
                (grn != null && grn.getPurchaseOrder() != null ? grn.getPurchaseOrder().getId() : null),
                (grn != null && grn.getSupplier() != null ? grn.getSupplier().getId() : null),
                null, null, null, createdAt, "SYSTEM", "MANUAL_RECEIVE");
    }

    @Transactional
    public void receiveShipment(GoodsReceipt grn, Ingredient ingredient, BigDecimal quantity, BigDecimal unitCost, BigDecimal taxAmount, String actor) {
        // 1. Create FIFO Lot if it's a new arrival
        InventoryActiveLot lot = null;
        if (grn != null) {
            lot = new InventoryActiveLot();
            lot.setRestaurant(ingredient.getRestaurant());
            lot.setIngredient(ingredient);
            lot.setGoodsReceipt(grn);
            lot.setSupplier(grn.getSupplier());
            lot.setInitialQty(quantity);
            lot.setAvailableQty(quantity);
            lot.setUnitPrice(unitCost != null ? unitCost : BigDecimal.ZERO);
            lot.setTaxAmount(taxAmount != null ? taxAmount : BigDecimal.ZERO);
            lot = activeLotRepository.save(lot);
        }

        // 2. Create Ledger entry
        createLedgerEntry(ingredient.getRestaurant(), ingredient, StockMovementType.RECEIVING,
                quantity, unitCost, taxAmount, lot, 
                (grn != null ? grn.getId() : null),
                (grn != null && grn.getPurchaseOrder() != null ? grn.getPurchaseOrder().getId() : null),
                (grn != null && grn.getSupplier() != null ? grn.getSupplier().getId() : null),
                null, null, null, null, actor, "MANUAL_RECEIVE");
    }

    /**
     * Depletes stock automatically based on a POS Order.
     * Expands the recipe for each Menu Item and consumes batches in FIFO order.
     * Supports recursive expansion of Batch Recipes.
     */
    @Transactional
    public void orderFulfillment(Order order) {
        if (order == null || order.getLines() == null) return;

        List<InventoryIngredientLedger> bulkLedgerEntries = new ArrayList<>();
        List<InventoryActiveLot> bulkLotUpdates = new ArrayList<>();
        List<InventoryWasteRegistry> bulkWasteEntries = new ArrayList<>();

        for (OrderLine line : order.getLines()) {
            MenuItem item = line.getMenuItem();
            if (item == null) continue;
            
            BigDecimal orderQty = BigDecimal.valueOf(line.getQuantity());
            accumulateDepletionsRecursive(order.getRestaurant(), item, orderQty, 
                    StockMovementType.DEPLETION, order.getId(), line.getId(), 
                    order.getCreatedAt(), "SYSTEM", "POS_SALE", 
                    bulkLedgerEntries, bulkLotUpdates, bulkWasteEntries);
        }

        if (!bulkLotUpdates.isEmpty()) {
            activeLotRepository.saveAll(bulkLotUpdates);
        }
        if (!bulkLedgerEntries.isEmpty()) {
            ledgerRepository.saveAll(bulkLedgerEntries);
            balanceService.applyLedgerEntries(bulkLedgerEntries);
        }
        if (!bulkWasteEntries.isEmpty()) {
            wasteRepository.saveAll(bulkWasteEntries);
        }
    }

    /**
     * Records a kitchen error or misfire.
     * Depletes stock physically but categorizes as controllable loss.
     */
    @Transactional
    public void recordMisfire(Restaurant restaurant, MenuItem item, Long orderId, String reason, UUID staffId) {
        List<InventoryIngredientLedger> bulkLedgerEntries = new ArrayList<>();
        List<InventoryActiveLot> bulkLotUpdates = new ArrayList<>();
        List<InventoryWasteRegistry> bulkWasteEntries = new ArrayList<>();

        accumulateDepletionsRecursive(restaurant, item, BigDecimal.ONE, 
                StockMovementType.MISFIRE, orderId, null, 
                LocalDateTime.now(), "KITCHEN_AGENT", reason,
                bulkLedgerEntries, bulkLotUpdates, bulkWasteEntries);

        if (!bulkLotUpdates.isEmpty()) activeLotRepository.saveAllAndFlush(bulkLotUpdates);
        if (!bulkLedgerEntries.isEmpty()) {
            ledgerRepository.saveAllAndFlush(bulkLedgerEntries);
            balanceService.applyLedgerEntries(bulkLedgerEntries);
        }
        if (!bulkWasteEntries.isEmpty()) wasteRepository.saveAllAndFlush(bulkWasteEntries);
    }

    private void accumulateDepletionsRecursive(Restaurant restaurant, MenuItem item, BigDecimal quantity, 
                                 StockMovementType type, Long orderId, Long lineItemId, 
                                 LocalDateTime orderDate, String actor, String reason,
                                 List<InventoryIngredientLedger> entries, List<InventoryActiveLot> lotsToUpdate,
                                 List<InventoryWasteRegistry> wastes) {
        // Find the active recipe for this menu item
        Recipe activeRecipe = item.getRecipes().stream()
                .filter(Recipe::isActive)
                .findFirst()
                .orElse(null);

        if (activeRecipe == null) return;

        // Get recipe yield quantity (how many portions this recipe produces)
        // Default to 1 if not set (single portion recipe)
        BigDecimal recipeYieldQty = activeRecipe.getYieldQuantity();
        if (recipeYieldQty == null || recipeYieldQty.compareTo(BigDecimal.ZERO) <= 0) {
            recipeYieldQty = BigDecimal.ONE;
        }

        // Check if this is a BATCH recipe - batch recipes need yield factor applied
        // PLATE recipes already have per-portion quantities (converted at recipe creation time)
        boolean isBatchRecipe = activeRecipe.getRecipeType() == mls.sho.dms.common.enums.RecipeType.BATCH;

        // Sort lines by line number
        List<RecipeIngredientLine> sortedLines = new ArrayList<>(activeRecipe.getIngredientLines());
        sortedLines.sort(Comparator.comparing(RecipeIngredientLine::getLineNumber));

        for (RecipeIngredientLine recipeLine : sortedLines) {
            // Base calculation: order quantity * recipe unit quantity per portion
            BigDecimal baseUsage = quantity.multiply(recipeLine.getQuantityRu());

            // Apply recipe yield factor only for BATCH recipes
            // For BATCH recipes: quantityRu is for the entire batch, so we need to scale by (orderQty / yieldQty)
            // For PLATE recipes: quantityRu is already per-portion, so no scaling needed
            BigDecimal totalUsage = baseUsage;
            if (isBatchRecipe && recipeYieldQty.compareTo(BigDecimal.ONE) > 0) {
                // For batch recipes: (orderQty * batchQty) / yieldQty
                // Example: ordering 15 portions from a batch that makes 10 = 1.5 batches
                totalUsage = quantity.multiply(recipeLine.getQuantityRu())
                        .divide(recipeYieldQty, 6, RoundingMode.HALF_UP);
            }

            // Apply ingredient yield percentage (yieldPct)
            // This accounts for inedible portions (trimming, bones, spoilage, etc.)
            // If yieldPct is 0.85 (85% usable), we need to use more purchased quantity
            // to get the required usable amount
            Ingredient ingredient = recipeLine.getIngredient();
            if (ingredient != null && ingredient.getYieldPct() != null 
                    && ingredient.getYieldPct().compareTo(BigDecimal.ZERO) > 0
                    && ingredient.getYieldPct().compareTo(BigDecimal.ONE) < 1) {
                // Divide by yieldPct to get the actual purchase quantity needed
                // e.g., need 1kg usable chicken with 85% yield = 1/0.85 = 1.176kg purchase qty
                totalUsage = totalUsage.divide(ingredient.getYieldPct(), 6, RoundingMode.HALF_UP);
            }

            // Since nested sub-recipes were removed, we only look at direct Ingredients
            if (ingredient != null) {
                depleteFifoBulk(restaurant, ingredient, totalUsage, 
                        type, orderId, lineItemId, item.getId(), reason, null, orderDate, actor, entries, lotsToUpdate, wastes);
            }
        }
    }

    private void depleteFifoBulk(Restaurant restaurant, Ingredient ingredient, BigDecimal quantityToDeplete, 
                              StockMovementType type, Long orderId, Long lineItemId, Long menuId, 
                              String reason, UUID staffId, LocalDateTime orderDate, String actor,
                              List<InventoryIngredientLedger> entriesAccumulator, List<InventoryActiveLot> lotsAccumulator,
                              List<InventoryWasteRegistry> wastesAccumulator) {
        
        List<InventoryActiveLot> activeLots = activeLotRepository.findAvailableLotsOrderByFifo(restaurant.getId(), ingredient.getId());
        BigDecimal remainingToDeplete = quantityToDeplete;

        for (InventoryActiveLot lot : activeLots) {
            if (remainingToDeplete.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal availableInLot = lot.getAvailableQty();
            BigDecimal amountFromThisLot = availableInLot.min(remainingToDeplete);

            lot.setAvailableQty(availableInLot.subtract(amountFromThisLot));
            lotsAccumulator.add(lot);

            BigDecimal taxContribution = BigDecimal.ZERO;
            if (lot.getInitialQty().compareTo(BigDecimal.ZERO) > 0) {
                taxContribution = lot.getTaxAmount()
                        .multiply(amountFromThisLot)
                        .divide(lot.getInitialQty(), 4, RoundingMode.HALF_UP);
            }

            InventoryIngredientLedger entry = new InventoryIngredientLedger();
            entry.setRestaurant(restaurant);
            entry.setIngredient(ingredient);
            entry.setEventType(type);
            entry.setQuantity(amountFromThisLot.negate());
            entry.setUnitCost(lot.getUnitPrice());
            entry.setTaxAmount(taxContribution.negate());
            entry.setActiveLot(lot);
            entry.setGrnId(lot.getGoodsReceipt() != null ? lot.getGoodsReceipt().getId() : null);
            entry.setPoId((lot.getGoodsReceipt() != null && lot.getGoodsReceipt().getPurchaseOrder() != null) ? lot.getGoodsReceipt().getPurchaseOrder().getId() : null);
            entry.setSupplierId(lot.getSupplier() != null ? lot.getSupplier().getId() : null);
            entry.setOrderId(orderId);
            entry.setLineItemId(lineItemId);
            entry.setMenuId(menuId);
            entry.setReasonCode(reason);
            if (orderDate != null) entry.setCreatedAt(orderDate);
            entry.setCreatedBy(actor);
            entry.setTotalValue(entry.getQuantity().multiply(entry.getUnitCost()).add(entry.getTaxAmount()).setScale(4, RoundingMode.HALF_UP));

            entriesAccumulator.add(entry);
            
            if (type == StockMovementType.MISFIRE || type == StockMovementType.DISCARD) {
                wastesAccumulator.add(buildWasteRegistry(entry, orderId, menuId, staffId, reason != null ? reason : "UNSPECIFIED"));
            }

            remainingToDeplete = remainingToDeplete.subtract(amountFromThisLot);
        }

        // --- QA Hardening: Over-depletion handling ---
        // If we still have remaining quantity (Physical Stockout), we MUST still record the depletion
        // for Theoretical-vs-Actual accuracy. We record this as a lot-less entry.
        if (remainingToDeplete.compareTo(BigDecimal.ZERO) > 0) {
            InventoryIngredientLedger entry = new InventoryIngredientLedger();
            entry.setRestaurant(restaurant);
            entry.setIngredient(ingredient);
            entry.setEventType(type);
            entry.setQuantity(remainingToDeplete.negate().setScale(4, RoundingMode.HALF_UP));
            
            // Fallback Unit Cost (Last Purchase or Ingredient Master)
            BigDecimal unitCost = ingredient.getPurchaseUnitPrice() != null ? ingredient.getPurchaseUnitPrice() : BigDecimal.ZERO;
            entry.setUnitCost(unitCost);
            entry.setTaxAmount(BigDecimal.ZERO);
            entry.setActiveLot(null); // No lot available
            entry.setOrderId(orderId);
            entry.setLineItemId(lineItemId);
            entry.setMenuId(menuId);
            entry.setReasonCode(reason != null ? reason : "OVER_DEPLETION_STOCKOUT");
            if (orderDate != null) entry.setCreatedAt(orderDate);
            entry.setCreatedBy(actor);
            entry.setTotalValue(entry.getQuantity().multiply(entry.getUnitCost()).setScale(4, RoundingMode.HALF_UP));

            entriesAccumulator.add(entry);

            if (type == StockMovementType.MISFIRE || type == StockMovementType.DISCARD) {
                wastesAccumulator.add(buildWasteRegistry(entry, orderId, menuId, staffId, 
                        (reason != null ? reason : "OVER_DEPLETION_STOCKOUT")));
            }
        }
    }

    /**
     * Realigns the ledger with a physical count.
     * Computes the "Invisible Variance" and creates a RECONCILIATION entry.
     */
    @Transactional
    public void recordReconciliation(Restaurant restaurant, Ingredient ingredient, BigDecimal physicalCount, String actor) {
        BigDecimal theoreticalQty = getLiveQuantity(restaurant.getId(), ingredient.getId());
        BigDecimal adjustmentQty = physicalCount.subtract(theoreticalQty);

        if (adjustmentQty.compareTo(BigDecimal.ZERO) == 0) return; // Perfect match

        // For reconciliation, we use the last known unit cost for the ingredient
        BigDecimal unitCost = ingredient.getPurchaseUnitPrice() != null ? ingredient.getPurchaseUnitPrice() : BigDecimal.ZERO;
        
        createLedgerEntry(restaurant, ingredient, StockMovementType.RECONCILIATION, 
                adjustmentQty, unitCost, null, null, null, null, null, null, null, null, null, actor, "PHYSICAL_COUNT");
        // Balance is updated inside createLedgerEntry() via InventoryBalanceService.
        // Ingredient.onHand is deprecated and no longer written.
    }

    /**
     * Records manual spoilage or discard.
     */
    @Transactional
    public void recordDiscard(Restaurant restaurant, Ingredient ingredient, BigDecimal qty, String reason, UUID staffId) {
        List<InventoryIngredientLedger> entries = new ArrayList<>();
        List<InventoryActiveLot> lots = new ArrayList<>();
        List<InventoryWasteRegistry> wastes = new ArrayList<>();
        
        depleteFifoBulk(restaurant, ingredient, qty, StockMovementType.DISCARD, 
                null, null, null, reason, staffId, LocalDateTime.now(), "MANUAL_DISCARD", entries, lots, wastes);
        
        if (!lots.isEmpty()) activeLotRepository.saveAll(lots);
        if (!entries.isEmpty()) {
            ledgerRepository.saveAll(entries);
            balanceService.applyLedgerEntries(entries);
        }
        if (!wastes.isEmpty()) wasteRepository.saveAll(wastes);
    }

    @Transactional(readOnly = true)
    public MenuProfitabilityDto getMenuProfitability(Long menuId, MenuItem item) {
        BigDecimal totalCostBasis = BigDecimal.ZERO;
        List<IngredientCostDetailDto> breakdown = new ArrayList<>();

        Recipe activeRecipe = item.getRecipes().stream()
                .filter(Recipe::isActive)
                .findFirst()
                .orElse(null);

        if (activeRecipe != null) {
            for (RecipeIngredientLine line : activeRecipe.getIngredientLines()) {
                Ingredient ing = line.getIngredient();
                if (ing == null) continue;

                // Use ingredient's purchase price as fallback instead of lot price
                // to avoid pessimistic locking issues in read-only transactions
                BigDecimal currentPrice = getCurrentBatchPriceReadOnly(item.getRestaurant().getId(), ing.getId());
                BigDecimal lineCost = line.getQuantityRu().multiply(currentPrice).setScale(4, RoundingMode.HALF_UP);
                totalCostBasis = totalCostBasis.add(lineCost);

                breakdown.add(IngredientCostDetailDto.builder()
                        .ingredientName(ing.getDescription())
                        .quantityUsed(line.getQuantityRu())
                        .unit(line.getRecipeUnit().name())
                        .currentLotPrice(currentPrice)
                        .lineCostContribution(lineCost)
                        .build());
            }
        }

        BigDecimal grossMargin = item.getSellPriceBuffer().subtract(totalCostBasis);
        BigDecimal fcPct = item.getSellPriceBuffer().compareTo(BigDecimal.ZERO) > 0 
                ? totalCostBasis.divide(item.getSellPriceBuffer(), 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        return MenuProfitabilityDto.builder()
                .menuId(menuId)
                .menuName(item.getName())
                .sellPrice(item.getSellPriceBuffer())
                .actualCostBasis(totalCostBasis)
                .grossMargin(grossMargin)
                .foodCostPct(fcPct)
                .costBreakdown(breakdown)
                .build();
    }

    @Transactional(readOnly = true)
    public WasteSummaryDto getWasteSummary(Long restaurantId, LocalDateTime start, LocalDateTime end) {
        List<InventoryWasteRegistry> wastes = wasteRepository.findAllByCreatedAtBetween(start, end);
        
        BigDecimal totalWasteValue = wastes.stream()
                .map(w -> w.getLedger().getTotalValue().abs()) 
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, List<InventoryWasteRegistry>> grouped = wastes.stream()
                .collect(Collectors.groupingBy(InventoryWasteRegistry::getReasonCode));

        List<WasteCategoryDto> categories = grouped.entrySet().stream()
                .map(e -> {
                    BigDecimal catVal = e.getValue().stream().map(w -> w.getLedger().getTotalValue().abs()).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal catQty = e.getValue().stream().map(w -> w.getLedger().getQuantity().abs()).reduce(BigDecimal.ZERO, BigDecimal::add);
                    return WasteCategoryDto.builder()
                            .reason(e.getKey())
                            .value(catVal)
                            .quantity(catQty)
                            .build();
                })
                .collect(Collectors.toList());

        return WasteSummaryDto.builder()
                .restaurantId(restaurantId)
                .totalWasteValue(totalWasteValue)
                .breakdowns(categories)
                .build();
    }

    private BigDecimal getCurrentBatchPrice(Long restaurantId, Long ingredientId) {
        List<InventoryActiveLot> lots = activeLotRepository.findAvailableLotsOrderByFifo(restaurantId, ingredientId);
        if (lots.isEmpty()) {
            return BigDecimal.ZERO; // fallback to last purchase price from ingredient master if needed
        }
        return lots.get(0).getUnitPrice();
    }

    /**
     * Read-only version that doesn't use pessimistic locking.
     * Uses ingredient's purchase price as fallback.
     */
    private BigDecimal getCurrentBatchPriceReadOnly(Long restaurantId, Long ingredientId) {
        try {
            List<InventoryActiveLot> lots = activeLotRepository.findAllByRestaurantIdAndActiveTrueOrderByExpiryDateAsc(restaurantId).stream()
                    .filter(lot -> lot.getIngredient().getId().equals(ingredientId) && lot.getAvailableQty().compareTo(BigDecimal.ZERO) > 0)
                    .toList();
            if (!lots.isEmpty()) {
                return lots.get(0).getUnitPrice();
            }
        } catch (Exception e) {
            // Ignore - will fallback to ingredient purchase price
        }
        return BigDecimal.ZERO;
    }

    private InventoryIngredientLedger createLedgerEntry(Restaurant restaurant, Ingredient ingredient, StockMovementType type,
                                                        BigDecimal quantity, BigDecimal unitCost, BigDecimal taxAmount,
                                                        InventoryActiveLot lot,
                                                        Long grnId, Long poId, Long supplierId, 
                                                        Long orderId, Long lineItemId, Long menuId, 
                                                        LocalDateTime createdAt, String actor, String reasonCode) {
        InventoryIngredientLedger entry = new InventoryIngredientLedger();
        entry.setRestaurant(restaurant);
        entry.setIngredient(ingredient);
        entry.setEventType(type);
        entry.setQuantity(quantity);
        entry.setUnitCost(unitCost);
        entry.setTaxAmount(taxAmount != null ? taxAmount : BigDecimal.ZERO);
        entry.setActiveLot(lot);
        entry.setGrnId(grnId);
        entry.setPoId(poId);
        entry.setSupplierId(supplierId);
        entry.setOrderId(orderId);
        entry.setLineItemId(lineItemId);
        entry.setMenuId(menuId);
        entry.setReasonCode(reasonCode);
        if (createdAt != null) {
            entry.setCreatedAt(createdAt);
        }
        entry.setCreatedBy(actor);
        
        // Calculate and set the total value for this entry
        BigDecimal qty = quantity != null ? quantity : BigDecimal.ZERO;
        BigDecimal cost = unitCost != null ? unitCost : BigDecimal.ZERO;
        BigDecimal tax = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        entry.setTotalValue(qty.multiply(cost).add(tax).setScale(4, RoundingMode.HALF_UP));

        InventoryIngredientLedger saved = ledgerRepository.saveAndFlush(entry);
        balanceService.applyLedgerEntry(saved);
        return saved;
    }

    private InventoryWasteRegistry buildWasteRegistry(InventoryIngredientLedger ledger, Long orderId, Long menuId, UUID staffId, String reason) {
        InventoryWasteRegistry waste = new InventoryWasteRegistry();
        waste.setLedger(ledger);
        waste.setOrderId(orderId);
        waste.setMenuId(menuId);
        waste.setStaffId(staffId);
        waste.setReasonCode(reason);

        // Record experiment metric
        if (ledger.getRestaurant() != null) {
            experimentService.recordMetric(ledger.getRestaurant().getId(), "WASTE_VALUE", 
                ledger.getTotalValue().abs(), 
                java.util.Map.of("ledgerId", (ledger.getId() != null ? ledger.getId().toString() : "PENDING"), "reason", reason));
        }
        return waste;
    }

    @Transactional(readOnly = true)
    public BigDecimal getLiveQuantity(Long restaurantId, Long ingredientId) {
        BigDecimal qty = ledgerRepository.sumQuantityByIngredient(restaurantId, ingredientId);
        return qty != null ? qty : BigDecimal.ZERO;
    }

    /**
     * Records cost basis update when an invoice is posted.
     * This creates a ledger entry for price variance analysis and tracks
     * the last purchase price for ingredient cost tracking.
     */
    @Transactional
    public void recordCostBasisUpdate(Restaurant restaurant, Ingredient ingredient, BigDecimal unitPrice, BigDecimal quantity, Long invoiceId) {
        createLedgerEntry(
            restaurant,
            ingredient,
            StockMovementType.COST_BASIS_UPDATE,
            quantity, // positive quantity to add to ledger
            unitPrice,
            BigDecimal.ZERO, // no tax on cost basis
            null, // no lot
            null, // grnId
            null, // poId
            null, // supplierId
            null, // orderId
            null, // lineItemId
            null, // menuId
            LocalDateTime.now(),
            "INVOICE_POST",
            "COST_BASIS_UPDATE"
        );

        // Record experiment metric for cost tracking
        if (restaurant != null) {
            BigDecimal totalValue = unitPrice.multiply(quantity);
            experimentService.recordMetric(
                restaurant.getId(),
                "INVOICE_POSTED_VALUE",
                totalValue,
                java.util.Map.of("ingredientId", ingredient.getId().toString(), "invoiceId", String.valueOf(invoiceId))
            );
        }
    }
}
