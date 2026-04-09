// ============================================================
// SERVICE LAYER  — Restaurant Management Platform
// Subsystems 1–4  +  POS Layer
//
// Legend:
//  [DB]    reads/writes PostgreSQL via repository
//  [COMP]  computed in-process via ConversionFunctions
//  [CACHE] served from Redis if present, computed + stored if not
//  [INVAL] invalidates one or more Redis keys
//  [EVENT] publishes a domain event (consumed by other services)
//
// Design rules:
//  • Services never talk to each other directly — they go through
//    domain events or are orchestrated by a use-case / facade.
//  • No repository interfaces here — just what each method does.
//  • Every method that mutates state is @Transactional.
//  • Every method that only reads is @Transactional(readOnly=true).
// ============================================================

package com.restaurant.service;

// ─────────────────────────────────────────────────────────────
// ██  1. RESTAURANT SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages the Restaurant tenant record.
 * Gateway for multi-tenancy — every other service receives a restaurantId.
 */
@Service
public class RestaurantService {

    /**
     * [DB] Creates a new restaurant tenant.
     * Also seeds default: MenuCostGroups, DiningTables (none), Suppliers (none).
     */
    Restaurant createRestaurant(CreateRestaurantRequest req);

    /**
     * [DB] Fetches restaurant by id.
     * Used by all other services to validate tenancy.
     */
    Restaurant getById(Long restaurantId);

    /**
     * [DB] Updates name or timezone.
     * [INVAL] Clears all restaurant:{id}:* Redis keys (timezone shift changes
     *         all "today" windows).
     */
    Restaurant update(Long restaurantId, UpdateRestaurantRequest req);

    /**
     * [DB] Lists all restaurants (admin / platform use only).
     */
    List<RestaurantSummaryDto> listAll();
}


// ─────────────────────────────────────────────────────────────
// ██  2. SUPPLIER SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages the supplier / vendor master list.
 */
@Service
public class SupplierService {

    /**
     * [DB] Creates a new supplier for a restaurant.
     * Validates name uniqueness within the restaurant.
     */
    Supplier create(Long restaurantId, CreateSupplierRequest req);

    /**
     * [DB] Returns all active suppliers for a restaurant, sorted by name.
     */
    List<SupplierDto> listActive(Long restaurantId);

    /**
     * [DB] Returns all suppliers including inactive (for admin screens).
     */
    List<SupplierDto> listAll(Long restaurantId);

    /**
     * [DB] Updates supplier contact details.
     */
    Supplier update(Long restaurantId, Long supplierId, UpdateSupplierRequest req);

    /**
     * [DB] Soft-deletes a supplier (sets active = false).
     * Blocked if supplier has any POSTED invoices in the current period.
     */
    void deactivate(Long restaurantId, Long supplierId);

    /**
     * [DB] Searches suppliers by name fragment — powers the autocomplete
     *      in the invoice entry form.
     */
    List<SupplierDto> search(Long restaurantId, String nameFragment);
}


// ─────────────────────────────────────────────────────────────
// ██  3. INGREDIENT SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages the ingredient master catalogue.
 * Also the source of truth for all unit costs used in recipe costing.
 */
@Service
public class IngredientService {

    /**
     * [DB] Creates a new ingredient.
     * Auto-assigns next itemCode (zero-padded sequence per restaurant).
     */
    Ingredient create(Long restaurantId, CreateIngredientRequest req);

    /**
     * [DB] Returns full ingredient record by id.
     */
    Ingredient getById(Long restaurantId, Long ingredientId);

    /**
     * [DB] Returns all active ingredients, optionally filtered by
     *      inventoryType (FOOD|BAR) or category.
     * Used to populate the ingredient picker in recipe editor.
     */
    List<IngredientSummaryDto> list(Long restaurantId,
                                    InventoryType type,
                                    InventoryCategory category);

    /**
     * [DB] Searches ingredients by description fragment.
     * Powers the autocomplete on recipe and invoice entry screens.
     */
    List<IngredientSummaryDto> search(Long restaurantId, String fragment);

    /**
     * [DB] Updates ingredient fields (description, price, units, yield, par level).
     * [INVAL] If purchaseUnitPrice, ruPerPu, yieldPct, or iuPerPu changed:
     *   - Clears restaurant:{id}:ingredient:{id}:costs
     *   - Clears restaurant:{id}:recipe:{id}:cost for every recipe using this ingredient
     *   - Clears restaurant:{id}:menuitem:{id}:cost for every menu item using this ingredient
     * [EVENT] Publishes IngredientPriceChangedEvent so MenuItemCostService
     *         can recompute affected cost cards asynchronously.
     */
    Ingredient update(Long restaurantId, Long ingredientId, UpdateIngredientRequest req);

    /**
     * [DB] Soft-deletes an ingredient (sets active = false).
     * Blocked if ingredient is used in any active BatchRecipe or MenuItem.
     * Returns a list of affected recipe/menu item names if blocked.
     */
    void deactivate(Long restaurantId, Long ingredientId);

    /**
     * [CACHE] Returns { ruCost, iuCost } for one ingredient.
     *
     * Cache hit  → served from restaurant:{id}:ingredient:{id}:costs
     * Cache miss → [COMP] calcRuCost() + calcIuCost() from ConversionFunctions,
     *              result stored in Redis (TTL 24 hr).
     *
     * Hot path — called on every recipe cost card load, so must be fast.
     */
    IngredientCostDto getCosts(Long restaurantId, Long ingredientId);

    /**
     * [DB] Returns all ingredients whose current count (from the latest
     *      FINALISED InventoryPeriod) is below par level.
     * Powers the low-stock alerts screen.
     */
    List<LowStockAlertDto> getLowStockAlerts(Long restaurantId);

    /**
     * [DB] Uploads or replaces the ingredient image.
     * Stores the object-storage key, increments imageVersion.
     * Returns the CDN URL assembled in-process (cdnBase + key + ?v=version).
     */
    String uploadImage(Long restaurantId, Long ingredientId, MultipartFile image);
}


// ─────────────────────────────────────────────────────────────
// ██  4. INVENTORY SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages inventory count periods and line items.
 * The only entity that writes to InventoryPeriod and InventoryLineItem.
 */
@Service
public class InventoryService {

    /**
     * [DB] Opens a new inventory count period for today.
     * Blocked if an OPEN period of the same type already exists.
     * Pre-populates all active ingredients as line items with count = 0.
     */
    InventoryPeriod openPeriod(Long restaurantId, InventoryType type);

    /**
     * [DB] Returns the currently OPEN period, or the most recent FINALISED
     *      period if none is open.
     */
    InventoryPeriod getCurrentPeriod(Long restaurantId, InventoryType type);

    /**
     * [DB] Returns a full period with all line items and computed extensions.
     * [COMP] For each line: extension = count × calcIuCost(ingredient)
     *        categorySubtotals = GROUP BY ingredient.category (in memory)
     *        totalValue = SUM(extensions)
     */
    InventoryPeriodDetailDto getPeriodDetail(Long restaurantId, Long periodId);

    /**
     * [DB] Updates the count for one line item.
     * Only allowed while period status = OPEN.
     */
    void updateCount(Long restaurantId, Long periodId,
                     Long lineItemId, BigDecimal count);

    /**
     * [DB] Batch-updates multiple line items in one transaction.
     * Used when the user saves a full page of counts at once.
     */
    void batchUpdateCounts(Long restaurantId, Long periodId,
                           List<LineCountUpdateRequest> updates);

    /**
     * [DB] Finalises the period (status → FINALISED, sets finalisedAt).
     * Blocked if any ingredient has a null count (must be 0 or a real count).
     * [INVAL] Clears restaurant:{id}:inventory:latest:{FOOD|BAR}
     * [EVENT] Publishes InventoryPeriodFinalisedEvent so PrimeCostService
     *         can pick up new beginning/ending inventory values.
     */
    void finalisePeriod(Long restaurantId, Long periodId);

    /**
     * [CACHE] Returns the latest finalised period summary.
     *
     * Cache hit  → restaurant:{id}:inventory:latest:{FOOD|BAR}
     * Cache miss → [DB] fetch latest FINALISED period,
     *              [COMP] compute totalValue + categoryBreakdown,
     *              store in Redis (TTL: until next period finalised).
     *
     * Endpoint: GET /api/inventory/periods/latest?type=FOOD
     */
    InventoryLatestDto getLatest(Long restaurantId, InventoryType type);

    /**
     * [DB] Returns a list of all periods (header only, no line items).
     * Used to populate the period history list.
     */
    List<InventoryPeriodSummaryDto> listPeriods(Long restaurantId, InventoryType type);

    /**
     * [DB] Compares two finalised periods — returns per-ingredient
     *      count and value delta, plus category-level delta.
     * [COMP] delta = period2.count − period1.count per ingredient
     */
    InventoryComparisonDto comparePeriods(Long restaurantId,
                                          Long periodId1, Long periodId2);
}


// ─────────────────────────────────────────────────────────────
// ██  5. PURCHASE INVOICE SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages supplier invoice entry and weekly purchase reporting.
 */
@Service
public class PurchaseInvoiceService {

    /**
     * [DB] Creates a new invoice in DRAFT status.
     * Validates that supplier belongs to the restaurant.
     */
    PurchaseInvoice createDraft(Long restaurantId, CreateInvoiceRequest req);

    /**
     * [DB] Returns one invoice with all its category lines.
     * [COMP] proof = invoiceAmount − SUM(lines.amount) via calcInvoiceProof()
     *        pctByCategory = line.amount / invoiceAmount per line
     */
    InvoiceDetailDto getDetail(Long restaurantId, Long invoiceId);

    /**
     * [DB] Adds or updates a category split line on a DRAFT invoice.
     * [COMP] Recomputes proof after every line change.
     * Returns the updated proof value so the UI can show it in real-time.
     */
    BigDecimal upsertLine(Long restaurantId, Long invoiceId,
                          PurchaseCategory category, BigDecimal amount);

    /**
     * [DB] Removes a category line from a DRAFT invoice.
     * [COMP] Recomputes and returns proof.
     */
    BigDecimal removeLine(Long restaurantId, Long invoiceId,
                          PurchaseCategory category);

    /**
     * [DB] Posts an invoice (DRAFT → POSTED).
     * Blocked if proof != 0 (lines don't add up to invoice total).
     * [INVAL] Clears restaurant:{id}:purchases:week:{weekStartDate}
     *         Clears restaurant:{id}:kpis:week:{weekStartDate}
     * [EVENT] Publishes InvoicePostedEvent for PrimeCostService.
     */
    void post(Long restaurantId, Long invoiceId);

    /**
     * [DB] Voids an invoice (POSTED → VOID).
     * [INVAL] Same keys as post().
     * [EVENT] Publishes InvoiceVoidedEvent.
     */
    void voidInvoice(Long restaurantId, Long invoiceId);

    /**
     * [DB] Returns all invoices for a date range, optionally filtered by supplier.
     */
    List<InvoiceSummaryDto> list(Long restaurantId, LocalDate from,
                                  LocalDate to, Long supplierId);

    /**
     * [CACHE] Returns weekly purchase totals by category for a given week.
     *
     * Cache hit  → restaurant:{id}:purchases:week:{weekStartDate}
     * Cache miss → [DB] SUM(lines.amount) GROUP BY purchaseCategory
     *              WHERE invoiceDate BETWEEN weekStart AND weekStart+6
     *              AND status = POSTED,
     *              [COMP] pctByCategory = categoryTotal / grandTotal,
     *              stored in Redis (TTL 1 hr).
     *
     * Endpoint: GET /api/purchases/weekly-summary?weekStart=2024-01-01
     */
    WeeklyPurchaseSummaryDto getWeeklySummary(Long restaurantId, LocalDate weekStart);

    /**
     * [DB] Returns purchase totals grouped by supplier for a date range.
     * Powers the "Spend by Supplier" screen.
     */
    List<SupplierSpendDto> getSpendBySupplier(Long restaurantId,
                                               LocalDate from, LocalDate to);

    /**
     * [DB] Returns week-over-week purchase trend for a category over N weeks.
     * Powers the "Purchase Trend" chart — no Redis needed (infrequent, heavy query).
     */
    List<PurchaseTrendPointDto> getCategoryTrend(Long restaurantId,
                                                  PurchaseCategory category,
                                                  int weeks);
}


// ─────────────────────────────────────────────────────────────
// ██  6. BATCH RECIPE SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages batch / sub-recipes and their procedure steps.
 */
@Service
public class BatchRecipeService {

    /**
     * [DB] Creates a new batch recipe with no ingredient lines yet.
     */
    BatchRecipe create(Long restaurantId, CreateBatchRecipeRequest req);

    /**
     * [DB] Returns the recipe header + all ingredient lines + procedure steps.
     * [COMP] For each line:
     *   ruCost    = calcRuCost(ingredient)
     *   extension = calcRecipeLineExtension(quantityRu, ruCost)
     * [COMP] totalCost = calcTotalBatchCost(extensions)
     * [COMP] costPerYieldUnit = calcBatchCostPerYieldUnit(totalCost, yieldQuantity)
     *
     * Note: costs come from IngredientService.getCosts() which is Redis-backed.
     */
    BatchRecipeDetailDto getDetail(Long restaurantId, Long recipeId);

    /**
     * [CACHE] Returns only the cost summary for a recipe.
     *
     * Cache hit  → restaurant:{id}:recipe:{id}:cost
     * Cache miss → [COMP] same as getDetail() cost section,
     *              stored in Redis (TTL 24 hr).
     *
     * Endpoint: GET /api/recipes/{id}/cost
     * Called when a recipe is used as an ingredient on a menu item cost card.
     */
    RecipeCostDto getCost(Long restaurantId, Long recipeId);

    /**
     * [DB] Updates recipe header (name, station, shelf life, tools, notes, yield).
     * [INVAL] Clears restaurant:{id}:recipe:{id}:cost
     *         Clears restaurant:{id}:menuitem:{id}:cost for all items using this recipe
     */
    BatchRecipe updateHeader(Long restaurantId, Long recipeId,
                             UpdateBatchRecipeRequest req);

    /**
     * [DB] Adds an ingredient line to the recipe.
     * [INVAL] Clears recipe cost cache and affected menu item cost caches.
     */
    RecipeIngredientLine addIngredientLine(Long restaurantId, Long recipeId,
                                           AddIngredientLineRequest req);

    /**
     * [DB] Updates quantity on one ingredient line.
     * [INVAL] Same as addIngredientLine.
     */
    RecipeIngredientLine updateIngredientLine(Long restaurantId, Long recipeId,
                                              Long lineId, BigDecimal quantityRu);

    /**
     * [DB] Removes an ingredient line.
     * [INVAL] Same as addIngredientLine.
     */
    void removeIngredientLine(Long restaurantId, Long recipeId, Long lineId);

    /**
     * [DB] Reorders ingredient lines (drag-to-reorder in UI).
     * Accepts a list of { lineId, newLineNumber } and updates all in one transaction.
     */
    void reorderIngredientLines(Long restaurantId, Long recipeId,
                                 List<LineReorderRequest> reorders);

    /**
     * [DB] Adds a procedure step.
     */
    RecipeProcedureStep addStep(Long restaurantId, Long recipeId,
                                AddStepRequest req);

    /**
     * [DB] Updates a procedure step instruction.
     */
    RecipeProcedureStep updateStep(Long restaurantId, Long recipeId,
                                   Long stepId, String instruction);

    /**
     * [DB] Reorders procedure steps (drag-to-reorder).
     */
    void reorderSteps(Long restaurantId, Long recipeId,
                      List<StepReorderRequest> reorders);

    /**
     * [DB] Removes a procedure step.
     */
    void removeStep(Long restaurantId, Long recipeId, Long stepId);

    /**
     * [DB] Returns all active batch recipes, summarised (no lines).
     * Used to populate the recipe picker on menu item cost cards.
     */
    List<BatchRecipeSummaryDto> listActive(Long restaurantId);

    /**
     * [DB] Soft-deletes a recipe.
     * Blocked if recipe is used by any active MenuItem ingredient line.
     */
    void deactivate(Long restaurantId, Long recipeId);

    /**
     * [COMP] Scales a recipe to a different batch size.
     * Does NOT persist — returns a transient ScaledRecipeDto.
     * All ingredient quantities multiplied by (targetYield / currentYield).
     * Used for the "what if I make 3× this batch?" feature.
     */
    ScaledRecipeDto scaleRecipe(Long restaurantId, Long recipeId,
                                BigDecimal targetYieldQuantity);
}


// ─────────────────────────────────────────────────────────────
// ██  7. MENU ITEM COST SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages menu items and their costing data.
 * The primary cost-card engine.
 */
@Service
public class MenuItemCostService {

    /**
     * [DB] Creates a new menu item in a cost group.
     */
    MenuItem create(Long restaurantId, Long costGroupId,
                    CreateMenuItemRequest req);

    /**
     * [DB] Returns full menu item detail with costed ingredient lines.
     * [COMP] For each line:
     *   if ingredient:    ruCost = IngredientService.getCosts().ruCost
     *   if batchRecipe:   ruCost = BatchRecipeService.getCost().costPerYieldUnit
     *   extension = calcRecipeLineExtension(quantityRu, ruCost)
     * [COMP] totalCost      = calcMenuItemTotalCost(extensions, plateCost)
     * [COMP] grossProfit    = calcGrossProfit(menuPrice, totalCost)
     * [COMP] foodCostPct    = calcFoodCostPct(totalCost, menuPrice)
     * [COMP] targetPrice    = calcTargetMenuPrice(totalCost, targetFoodCostPct)
     */
    MenuItemDetailDto getDetail(Long restaurantId, Long menuItemId);

    /**
     * [CACHE] Returns cost summary only — the hot path for menu engineering
     *         and cost group summaries.
     *
     * Cache hit  → restaurant:{id}:menuitem:{id}:cost
     * Cache miss → [COMP] same computation as getDetail() cost section,
     *              stored in Redis (TTL 24 hr).
     *
     * Endpoint: GET /api/menu-items/{id}/cost
     */
    MenuItemCostDto getCost(Long restaurantId, Long menuItemId);

    /**
     * [DB] Updates menu item header (name, menuPrice, plateCost,
     *      targetFoodCostPct, pluNumber).
     * [INVAL] Clears restaurant:{id}:menuitem:{id}:cost
     *         Clears restaurant:{id}:costgroup:{costGroupId}:cost-summary
     * [EVENT] Publishes MenuItemPriceChangedEvent (consumed by OrderService
     *         to note that future orders will use the new price).
     */
    MenuItem updateHeader(Long restaurantId, Long menuItemId,
                          UpdateMenuItemRequest req);

    /**
     * [DB] Adds a costing line (ingredient or batch recipe).
     * Validates mutual exclusivity — cannot set both ingredient and batchRecipe.
     * [INVAL] Same as updateHeader.
     */
    MenuItemIngredientLine addCostingLine(Long restaurantId, Long menuItemId,
                                          AddCostingLineRequest req);

    /**
     * [DB] Updates quantity on a costing line.
     * [INVAL] Same as updateHeader.
     */
    MenuItemIngredientLine updateCostingLine(Long restaurantId, Long menuItemId,
                                             Long lineId, BigDecimal quantityRu);

    /**
     * [DB] Removes a costing line.
     * [INVAL] Same as updateHeader.
     */
    void removeCostingLine(Long restaurantId, Long menuItemId, Long lineId);

    /**
     * [DB] Reorders costing lines.
     */
    void reorderCostingLines(Long restaurantId, Long menuItemId,
                              List<LineReorderRequest> reorders);

    /**
     * [CACHE] Returns cost summary for all items in a cost group.
     *
     * Cache hit  → restaurant:{id}:costgroup:{costGroupId}:cost-summary
     * Cache miss → [COMP] getCost() for each item in group (each warm from Redis),
     *              aggregated into a list,
     *              stored in Redis (TTL 1 hr).
     *
     * Endpoint: GET /api/cost-groups/{id}/cost-summary
     */
    List<MenuItemCostDto> getCostGroupSummary(Long restaurantId, Long costGroupId);

    /**
     * [COMP] Target price calculator — not persisted.
     * Returns { targetPrice } for a given totalCost and targetFoodCostPct.
     * Used by the "Target Price Calculator" tool on the cost card screen.
     */
    BigDecimal calculateTargetPrice(Long restaurantId, Long menuItemId,
                                    BigDecimal targetFoodCostPct);

    /**
     * [DB] Uploads or replaces the menu item image.
     * Stores image_storage_key, increments image_version.
     * Returns assembled CDN URL.
     */
    String uploadImage(Long restaurantId, Long menuItemId, MultipartFile image);

    /**
     * [DB] Moves a menu item to a different cost group.
     * [INVAL] Clears old and new cost group summaries.
     */
    void moveToCostGroup(Long restaurantId, Long menuItemId, Long newCostGroupId);

    /**
     * [DB] Soft-deletes a menu item.
     * Blocked if item has OrderLines in the current or previous period.
     */
    void deactivate(Long restaurantId, Long menuItemId);

    /**
     * Internal method — called by IngredientPriceChangedEvent listener.
     * [DB] Finds all MenuItems that use the changed ingredient (directly or
     *      via a BatchRecipe).
     * [INVAL] Clears restaurant:{id}:menuitem:{id}:cost for each affected item.
     * No return value — pure cache invalidation.
     */
    void invalidateCostCacheForIngredient(Long restaurantId, Long ingredientId);
}


// ─────────────────────────────────────────────────────────────
// ██  8. MENU COST GROUP SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages cost groups (categories of menu items).
 */
@Service
public class MenuCostGroupService {

    /**
     * [DB] Creates a new cost group.
     */
    MenuCostGroup create(Long restaurantId, CreateCostGroupRequest req);

    /**
     * [DB] Returns all cost groups for a restaurant.
     */
    List<MenuCostGroupDto> listAll(Long restaurantId);

    /**
     * [DB] Updates cost group name or display order.
     * [INVAL] Clears restaurant:{id}:costgroup:{id}:cost-summary
     */
    MenuCostGroup update(Long restaurantId, Long costGroupId,
                         UpdateCostGroupRequest req);

    /**
     * [DB] Reorders cost groups (drag-to-reorder on the hub screen).
     */
    void reorder(Long restaurantId, List<GroupReorderRequest> reorders);

    /**
     * [DB] Deactivates a cost group.
     * Blocked if any active menu items exist in the group.
     */
    void deactivate(Long restaurantId, Long costGroupId);
}


// ─────────────────────────────────────────────────────────────
// ██  9. BUILD CHART SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages station build cards for menu items.
 */
@Service
public class BuildChartService {

    /**
     * [DB] Creates or replaces the build chart for a menu item.
     * A menu item can have only one build chart (1:1).
     */
    RecipeBuildChart createOrReplace(Long restaurantId, Long menuItemId,
                                     CreateBuildChartRequest req);

    /**
     * [DB] Returns the build chart with all lines for a menu item.
     * Returns null if no build chart exists yet.
     */
    BuildChartDetailDto getByMenuItem(Long restaurantId, Long menuItemId);

    /**
     * [DB] Updates the chart header (station, plating spec).
     */
    RecipeBuildChart updateHeader(Long restaurantId, Long buildChartId,
                                  UpdateBuildChartRequest req);

    /**
     * [DB] Adds a line to the build chart.
     * Validates: portionUnit null ↔ portionNote not null.
     *            servingUtensil = CUSTOM ↔ utensilNote not null.
     */
    BuildChartLine addLine(Long restaurantId, Long buildChartId,
                           AddBuildChartLineRequest req);

    /**
     * [DB] Updates a build chart line.
     */
    BuildChartLine updateLine(Long restaurantId, Long buildChartId,
                              Long lineId, UpdateBuildChartLineRequest req);

    /**
     * [DB] Removes a line from the build chart.
     */
    void removeLine(Long restaurantId, Long buildChartId, Long lineId);

    /**
     * [DB] Reorders lines (drag-to-reorder).
     */
    void reorderLines(Long restaurantId, Long buildChartId,
                      List<LineReorderRequest> reorders);

    /**
     * [DB] Returns all build charts for a station — powers the
     *      "print all cards for this station" feature.
     */
    List<BuildChartSummaryDto> getByStation(Long restaurantId,
                                             KitchenStationType station);
}


// ─────────────────────────────────────────────────────────────
// ██  10. OPERATIONS MANUAL SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages operations manual entries (free-form or recipe-linked).
 */
@Service
public class OperationsManualService {

    /**
     * [DB] Creates a manual entry.
     * If batchRecipeId is provided, content field is ignored —
     * the entry will render the linked recipe's procedure steps.
     */
    OperationsManualEntry create(Long restaurantId,
                                  CreateManualEntryRequest req);

    /**
     * [DB] Returns a single entry.
     * If linked to a BatchRecipe, also fetches and returns its procedure steps.
     */
    ManualEntryDetailDto getDetail(Long restaurantId, Long entryId);

    /**
     * [DB] Returns all entries, optionally filtered by station.
     * Sorted by displayOrder.
     */
    List<ManualEntrySummaryDto> list(Long restaurantId,
                                      KitchenStationType station);

    /**
     * [DB] Updates entry header and/or content.
     */
    OperationsManualEntry update(Long restaurantId, Long entryId,
                                  UpdateManualEntryRequest req);

    /**
     * [DB] Reorders entries within a station.
     */
    void reorder(Long restaurantId, List<EntryReorderRequest> reorders);

    /**
     * [DB] Deletes a manual entry (hard delete — manuals are not audited).
     */
    void delete(Long restaurantId, Long entryId);

    /**
     * [DB] Returns all entries across all stations formatted for print.
     * Groups by station, includes recipe steps when linked.
     * Used by the "Print All Manuals" button.
     */
    PrintManualDto buildPrintManual(Long restaurantId);
}


// ─────────────────────────────────────────────────────────────
// ██  11. DINING TABLE SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages the restaurant's table layout.
 */
@Service
public class DiningTableService {

    /**
     * [DB] Creates a dining table (physical or virtual).
     * Validates tableNumber uniqueness per restaurant.
     */
    DiningTable create(Long restaurantId, CreateDiningTableRequest req);

    /**
     * [DB] Returns all active tables, optionally filtered by section.
     */
    List<DiningTableDto> listActive(Long restaurantId, TableSection section);

    /**
     * [DB] Updates table number, seat capacity, or section.
     */
    DiningTable update(Long restaurantId, Long tableId,
                       UpdateDiningTableRequest req);

    /**
     * [DB] Deactivates a table.
     * Blocked if table has an OPEN session.
     */
    void deactivate(Long restaurantId, Long tableId);

    /**
     * [CACHE] Returns the current floor status — all tables with their
     *         session state (OPEN / AVAILABLE) and guest count.
     *
     * Cache hit  → restaurant:{id}:sessions:live (always event-driven, no TTL)
     * Cache miss → [DB] fetch all active tables + any OPEN sessions,
     *              build floor map, store in Redis.
     *
     * Endpoint: GET /api/tables/floor-status
     */
    FloorStatusDto getFloorStatus(Long restaurantId);
}


// ─────────────────────────────────────────────────────────────
// ██  12. TABLE SESSION SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages the guest visit lifecycle at a table.
 * Opening a session starts the "turn"; closing it ends it.
 */
@Service
public class TableSessionService {

    /**
     * [DB] Opens a new session at a table (guests are seated).
     * Blocked if the table already has an OPEN session.
     * [INVAL] Updates restaurant:{id}:sessions:live
     *         Clears restaurant:{id}:kpis:today (covers count changes)
     */
    TableSession open(Long restaurantId, Long tableId,
                      OpenSessionRequest req);              // req has guestCount

    /**
     * [DB] Updates guest count on an OPEN session
     *      (e.g. more guests joined after opening).
     * [INVAL] Clears restaurant:{id}:kpis:today
     */
    TableSession updateGuestCount(Long restaurantId, Long sessionId,
                                   Integer guestCount);

    /**
     * [DB] Closes a session (guests have paid and left).
     * Sets closedAt, status → CLOSED.
     * [INVAL] Clears restaurant:{id}:sessions:live
     *         Clears restaurant:{id}:kpis:today
     *         Clears restaurant:{id}:kpis:week:{weekStart}
     *         Clears restaurant:{id}:kpis:turn-times:{dayOfWeek}:{section}
     * [EVENT] Publishes SessionClosedEvent (consumed by KpiService to
     *         recompute and re-cache daily KPIs).
     */
    TableSession close(Long restaurantId, Long sessionId,
                       Long closedByUserId);

    /**
     * [DB] Voids a session (opened by mistake, no orders).
     * Blocked if session has any non-void Orders.
     * [INVAL] Same as close().
     */
    void voidSession(Long restaurantId, Long sessionId);

    /**
     * [DB] Returns session detail with all its orders and order lines.
     * [COMP] orderTotal  = SUM(lines.priceAtOrder × quantity) per order
     *        sessionTotal = SUM(orderTotals)
     *        checkAverage = sessionTotal / session.guestCount
     *        durationMinutes = closedAt − openedAt (null if still open)
     */
    SessionDetailDto getDetail(Long restaurantId, Long sessionId);

    /**
     * [DB] Returns all sessions for a date range with summary totals.
     * Used in the session history / audit view.
     */
    List<SessionSummaryDto> list(Long restaurantId,
                                  LocalDate from, LocalDate to);

    /**
     * [CACHE] Returns the guest count heatmap (30-min slots) for a week.
     * Derived from sessions for restaurants WITH POS integration.
     * Falls back to GuestCountEntry for restaurants WITHOUT POS.
     *
     * Cache hit  → restaurant:{id}:kpis:guest-heatmap:week:{weekStart}
     * Cache miss → [DB] GROUP BY FLOOR(EXTRACT(MINUTE FROM openedAt)/30)
     *              on TableSession for the week,
     *              stored in Redis (TTL 1 hr).
     *
     * Endpoint: GET /api/sessions/guest-heatmap?weekStart=2024-01-01
     */
    GuestHeatmapDto getGuestHeatmap(Long restaurantId, LocalDate weekStart);

    /**
     * [CACHE] Returns 3-week rolling average heatmap.
     * [COMP] Averages getGuestHeatmap() across 3 consecutive weeks.
     *
     * Cache hit  → restaurant:{id}:kpis:guest-heatmap:rolling3w:{weekStart}
     * Cache miss → calls getGuestHeatmap() for 3 weeks, averages per slot.
     *
     * Endpoint: GET /api/sessions/guest-heatmap/rolling?weekStart=2024-01-01&weeks=3
     */
    GuestHeatmapDto getRollingAverageHeatmap(Long restaurantId,
                                              LocalDate weekStart, int weeks);
}


// ─────────────────────────────────────────────────────────────
// ██  13. ORDER SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages orders (POS tickets) and their lines.
 * The primary write path during service — must be fast.
 */
@Service
public class OrderService {

    /**
     * [DB] Creates a new order on an OPEN session.
     * Sets orderedAt = now().
     */
    Order createOrder(Long restaurantId, Long sessionId,
                      Long createdByUserId);

    /**
     * [DB] Adds a menu item line to an OPEN order.
     * Snapshots priceAtOrder from MenuItem.menuPrice at this moment.
     * [INVAL] Clears restaurant:{id}:kpis:today (revenue changes)
     *         Clears restaurant:{id}:menu-engineering:live:{costGroupId}
     *         Clears restaurant:{id}:top-sellers:today
     *         Clears restaurant:{id}:sales:daily:{date}:by-category
     */
    OrderLine addLine(Long restaurantId, Long orderId,
                      Long menuItemId, Integer quantity);

    /**
     * [DB] Updates quantity on an OPEN order line.
     * [INVAL] Same keys as addLine().
     */
    OrderLine updateLineQuantity(Long restaurantId, Long orderId,
                                  Long lineId, Integer quantity);

    /**
     * [DB] Voids one order line (e.g. guest changed mind).
     * Sets line status → VOIDED. Order remains OPEN.
     * [INVAL] Same keys as addLine().
     */
    void voidLine(Long restaurantId, Long orderId, Long lineId);

    /**
     * [DB] Comps one order line (sets status → COMPED, price still recorded).
     * Comped lines are counted in sales mix but excluded from revenue totals.
     * [INVAL] Same keys as addLine().
     */
    void compLine(Long restaurantId, Long orderId, Long lineId);

    /**
     * [DB] Fires an order to the kitchen (status → FIRED).
     * No financial impact — purely operational status.
     */
    void fireOrder(Long restaurantId, Long orderId);

    /**
     * [DB] Closes an order (status → CLOSED, sets closedAt).
     * [INVAL] Clears restaurant:{id}:kpis:today
     *         Clears restaurant:{id}:kpis:week:{weekStart}
     *         Clears restaurant:{id}:kpis:food-cost-pct:today
     * [EVENT] Publishes OrderClosedEvent (consumed by KpiService).
     */
    void closeOrder(Long restaurantId, Long orderId);

    /**
     * [DB] Voids an entire order (all lines → VOIDED, order → VOID).
     * [INVAL] Same as closeOrder().
     */
    void voidOrder(Long restaurantId, Long orderId);

    /**
     * [DB] Returns order detail with all lines.
     * [COMP] lineTotal     = priceAtOrder × quantity per ORDERED/COMPED line
     *        orderTotal    = SUM(lineTotals for ORDERED lines)
     *        compedTotal   = SUM(lineTotals for COMPED lines)
     */
    OrderDetailDto getDetail(Long restaurantId, Long orderId);

    /**
     * [DB] Returns all orders for a session.
     */
    List<OrderSummaryDto> listBySession(Long restaurantId, Long sessionId);
}


// ─────────────────────────────────────────────────────────────
// ██  14. MENU ENGINEERING SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Manages menu engineering analysis periods and results.
 * No manual data entry — all figures sourced from OrderLine.
 */
@Service
public class MenuEngineeringService {

    /**
     * [DB] Creates a new analysis period in DRAFT status.
     * Manager chooses: date range, cost group (null = all), popularity factor.
     */
    MenuEngineeringPeriod createPeriod(Long restaurantId,
                                        CreateEngPeriodRequest req);

    /**
     * [DB] Lists all analysis periods for a restaurant, most recent first.
     */
    List<EngPeriodSummaryDto> listPeriods(Long restaurantId);

    /**
     * Runs the full analysis for a DRAFT period.
     * This is the core computation method.
     *
     * [DB]   Fetches all active MenuItems in the cost group.
     * [DB]   For each item: SUM(orderLine.quantity) + SUM(priceAtOrder × quantity)
     *        WHERE orderedAt BETWEEN periodBeginDate AND periodEndDate
     *        AND orderLine.status != VOIDED.
     * [COMP] For each item:
     *        itemCost         = MenuItemCostService.getCost().totalCost  (Redis-backed)
     *        sellPrice        = latest MenuItem.menuPrice
     *        itemGrossProfit  = calcGrossProfit(sellPrice, itemCost)
     *        salesMixPct      = calcSalesMixPct(quantitySold, totalSold)
     *        totalCost        = calcItemTotalCost(itemCost, quantitySold)
     *        totalRevenue     = calcItemTotalRevenue(sellPrice, quantitySold)
     *        totalProfit      = calcItemTotalProfit(totalRevenue, totalCost)
     * [COMP] Across all items:
     *        popularityThreshold = calcPopularityThreshold(totalSold, itemCount, factor)
     *        weightedAvgGP       = calcWeightedAvgGrossProfit(gpList, qtySoldList)
     * [COMP] Per item classification:
     *        gpCategory     = classifyGrossProfit(itemGP, weightedAvgGP)
     *        mixCategory    = classifySalesMix(salesMixPct, popularityThreshold)
     *        classification = classify(gpCategory, mixCategory)
     * [DB]   Writes one MenuEngineeringResult row per item.
     *        Updates period status → FINALISED.
     * [CACHE] Stores full result set in:
     *         restaurant:{id}:menu-engineering:period:{id}:results
     *         restaurant:{id}:menu-engineering:period:{id}:summary
     *         (permanent TTL — only cleared by reRunAnalysis())
     */
    void runAnalysis(Long restaurantId, Long periodId);

    /**
     * [CACHE] Returns the full result set for a FINALISED period.
     *
     * Cache hit  → restaurant:{id}:menu-engineering:period:{id}:results
     * Cache miss → [DB] fetches MenuEngineeringResult rows,
     *              [COMP] recomputes all derived fields,
     *              stores in Redis.
     *
     * Endpoint: GET /api/menu-engineering/periods/{id}/results
     */
    List<MenuEngResultDto> getResults(Long restaurantId, Long periodId);

    /**
     * [CACHE] Returns the summary for a FINALISED period.
     *
     * Cache hit  → restaurant:{id}:menu-engineering:period:{id}:summary
     * Cache miss → [COMP] computed from results.
     *
     * Endpoint: GET /api/menu-engineering/periods/{id}/summary
     */
    EngPeriodSummaryDto getSummary(Long restaurantId, Long periodId);

    /**
     * Re-runs analysis on an already-FINALISED period (manager changed
     * the popularity factor or date range).
     * [DB]   Deletes all existing MenuEngineeringResult rows for the period.
     * [INVAL] Clears period results + summary from Redis.
     * Then delegates to runAnalysis().
     */
    void reRunAnalysis(Long restaurantId, Long periodId,
                       ReRunEngRequest req);

    /**
     * [CACHE] Returns live sales counts for a cost group — updated every 5 min.
     * Shows how many of each item have been sold so far today.
     * Gives managers a real-time view before running a formal analysis.
     *
     * Cache hit  → restaurant:{id}:menu-engineering:live:{costGroupId}
     * Cache miss → [DB] SUM(orderLine.quantity) GROUP BY menuItem
     *              WHERE DATE(orderedAt) = today AND status != VOIDED
     *              stored in Redis (TTL 5 min).
     *
     * Endpoint: GET /api/menu-engineering/live?costGroupId=1
     */
    List<LiveSalesCountDto> getLiveSalesCounts(Long restaurantId, Long costGroupId);

    /**
     * [COMP] What-if simulator — does NOT persist, does NOT write to Redis.
     * Given a list of { menuItemId, newSellPrice } overrides, recomputes
     * the full classification for the period as if those prices were in effect.
     * Returns a transient WhatIfResultDto showing before/after classification
     * for each affected item.
     *
     * Endpoint: POST /api/menu-engineering/periods/{id}/what-if
     */
    WhatIfResultDto simulateWhatIf(Long restaurantId, Long periodId,
                                   List<WhatIfOverride> overrides);

    /**
     * [DB] Compares two FINALISED periods side by side.
     * Returns per-item classification changes (e.g. LOSER → WORKHORSE)
     * and aggregate metric deltas (totalRevenue, avgFoodCostPct, etc.).
     *
     * Endpoint: GET /api/menu-engineering/compare?period1=1&period2=2
     */
    PeriodComparisonDto comparePeriods(Long restaurantId,
                                        Long periodId1, Long periodId2);
}


// ─────────────────────────────────────────────────────────────
// ██  15. KPI SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * The single source for all dashboard KPIs and analytics.
 * Purely a read + cache service — writes nothing to the DB.
 * Listens to domain events to know when to recompute.
 */
@Service
public class KpiService {

    /**
     * [CACHE] Returns today's live KPIs.
     *
     * Cache hit  → restaurant:{id}:kpis:today
     * Cache miss → computes all of the below and stores (TTL 5 min):
     *
     * [COMP from TableSession]
     *   coversToday       = SUM(guestCount) WHERE DATE(openedAt) = today AND status != VOID
     *   openSessionsNow   = COUNT(*) WHERE status = OPEN
     *
     * [COMP from Order + OrderLine]
     *   grossSalesToday   = SUM(priceAtOrder × quantity) WHERE ORDERED lines, today
     *   compedToday       = SUM(priceAtOrder × quantity) WHERE COMPED lines, today
     *   checkAvgToday     = grossSalesToday / coversToday
     *
     * [COMP from OrderLine + MenuItemCostService]
     *   foodCostPctToday  = SUM(itemCost × quantity) / grossSalesToday
     *   topSellerToday    = MenuItem with highest quantitySold today
     *
     * Endpoint: GET /api/kpis/today
     */
    TodayKpiDto getTodayKpis(Long restaurantId);

    /**
     * [CACHE] Returns KPIs for a specific week.
     *
     * Cache hit  → restaurant:{id}:kpis:week:{weekStartDate}
     * Cache miss → same computations as getTodayKpis() but scoped to the week.
     *              TTL: 5 min for current week, permanent for past weeks.
     *
     * Endpoint: GET /api/kpis/weekly?weekStart=2024-01-01
     */
    WeekKpiDto getWeekKpis(Long restaurantId, LocalDate weekStart);

    /**
     * [CACHE] Returns average table turn times per section per day-of-week.
     *
     * Cache hit  → restaurant:{id}:kpis:turn-times:{dayOfWeek}:{section}
     * Cache miss → [DB] AVG(closedAt − openedAt) WHERE status = CLOSED
     *              GROUP BY section, EXTRACT(DOW FROM openedAt)
     *              stored in Redis (TTL 1 hr).
     *
     * Endpoint: GET /api/kpis/turn-times
     */
    List<TurnTimeDto> getTableTurnTimes(Long restaurantId);

    /**
     * [CACHE] Returns top N sellers by quantity for a period.
     *
     * Cache hit  → restaurant:{id}:top-sellers:today (or week variant)
     * Cache miss → [DB] SUM(orderLine.quantity) GROUP BY menuItem ORDER BY SUM DESC
     *              stored in Redis (TTL 5 min today / 1 hr week).
     *
     * Endpoint: GET /api/analytics/top-sellers?period=today&limit=10
     */
    List<SellerRankDto> getTopSellers(Long restaurantId,
                                       String period, int limit);

    /**
     * [CACHE] Returns slowest N sellers — LOSER candidates.
     *
     * Cache hit  → restaurant:{id}:slow-sellers:week:{weekStart}
     * Cache miss → [DB] same query ordered ASC, stored (TTL 1 hr).
     *
     * Endpoint: GET /api/analytics/slow-sellers?period=week&limit=10
     */
    List<SellerRankDto> getSlowSellers(Long restaurantId,
                                        String period, int limit);

    /**
     * [CACHE] Returns daily revenue broken down by cost group.
     * Replaces the manual DailySalesEntry completely.
     *
     * Cache hit  → restaurant:{id}:sales:daily:{date}:by-category
     * Cache miss → [DB] SUM(orderLine.priceAtOrder × quantity)
     *              GROUP BY menuItem.costGroup WHERE DATE(orderedAt) = date
     *              TTL: 5 min today, 24 hr for past dates.
     *
     * Endpoint: GET /api/sales/daily?date=2024-01-15
     */
    DailySalesByCategoryDto getDailySalesByCategory(Long restaurantId,
                                                     LocalDate date);

    /**
     * [CACHE] Returns live food cost % updated every 5 minutes.
     *
     * Cache hit  → restaurant:{id}:kpis:food-cost-pct:today
     * Cache miss → [COMP] SUM(itemCost × qty) / SUM(priceAtOrder × qty)
     *              using MenuItemCostService.getCost() for each item (Redis-backed).
     *              TTL: 5 min.
     *
     * Endpoint: GET /api/kpis/food-cost?period=today
     */
    FoodCostKpiDto getLiveFoodCostPct(Long restaurantId);

    /**
     * [DB] Returns 8-week prime cost trend.
     * Not cached — infrequent, manager-level report.
     * [COMP] For each week:
     *   grossSales      = from OrderLine
     *   totalCOS        = from PurchaseInvoice (POSTED, that week)
     *   totalLabor      = (future: from LaborService)
     *   primeCost       = totalCOS + totalLabor
     *   primeCostPct    = primeCost / grossSales
     *   grossMarginPct  = (grossSales − primeCost) / grossSales
     *
     * Endpoint: GET /api/kpis/prime-cost-trend?weeks=8
     */
    List<PrimeCostTrendPointDto> getPrimeCostTrend(Long restaurantId, int weeks);

    /**
     * Event listener — triggered by SessionClosedEvent, OrderClosedEvent,
     * InvoicePostedEvent.
     * Proactively recomputes and re-caches restaurant:{id}:kpis:today
     * so the dashboard always shows fresh data without a cache miss penalty.
     */
    void onDomainEvent(RestaurantDomainEvent event);
}


// ─────────────────────────────────────────────────────────────
// ██  16. GUEST COUNT SERVICE  (fallback — no POS)
// ─────────────────────────────────────────────────────────────

/**
 * Manages manual guest count entry.
 * Only used for restaurants that do NOT have POS (TableSession) integration.
 * When TableSession data exists for a week, this service's heatmap is bypassed
 * in favour of TableSessionService.getGuestHeatmap().
 */
@Service
public class GuestCountService {

    /**
     * [DB] Saves or updates the count for one time slot in a week.
     * Upserts on (restaurantId, weekStartDate, timeSlot).
     * [INVAL] Clears restaurant:{id}:kpis:guest-heatmap:week:{weekStart}
     *         Clears restaurant:{id}:kpis:guest-heatmap:rolling3w:{weekStart}
     */
    GuestCountEntry upsertSlot(Long restaurantId, UpsertSlotRequest req);

    /**
     * [DB] Batch-upserts all slots for a week in one transaction.
     * Used when the user saves the full weekly grid at once.
     * [INVAL] Same as upsertSlot().
     */
    void batchUpsert(Long restaurantId, LocalDate weekStart,
                     List<UpsertSlotRequest> slots);

    /**
     * [DB] Returns all entries for a week as a grid (time slot × day).
     * [COMP] weeklyTotal   = SUM(countMon … countSun) per slot
     *        weeklyAverage = weeklyTotal / activeDays per slot
     *        dailyTotals   = SUM per day column
     */
    WeeklyGuestGridDto getWeeklyGrid(Long restaurantId, LocalDate weekStart);

    /**
     * [CACHE] Returns 3-week rolling average heatmap.
     * Mirrors TableSessionService.getRollingAverageHeatmap() for non-POS restaurants.
     *
     * Cache hit  → restaurant:{id}:kpis:guest-heatmap:rolling3w:{weekStart}
     * Cache miss → [DB] AVG(countMon…) GROUP BY timeSlot for 3 weeks,
     *              stored in Redis (TTL 1 hr).
     *
     * Endpoint: GET /api/guest-counts/heatmap/rolling?weekStart=2024-01-01&weeks=3
     */
    GuestHeatmapDto getRollingAverageHeatmap(Long restaurantId,
                                              LocalDate weekStart, int weeks);
}


// ─────────────────────────────────────────────────────────────
// ██  17. UNIT CONVERSION SERVICE
// ─────────────────────────────────────────────────────────────

/**
 * Stateless service wrapping ConversionFunctions for REST exposure.
 * No DB reads, no Redis — pure computation only.
 */
@Service
public class UnitConversionService {

    /**
     * [COMP] Converts a quantity between any two RecipeUnits.
     * Delegates to ConversionFunctions.convertRecipeUnit().
     * ozWeightPerCup required only for cross-dimension conversions.
     *
     * Endpoint: GET /api/conversions/convert
     *           ?from=CUP&to=OZ_WEIGHT&qty=2&ozWeightPerCup=8.5
     */
    BigDecimal convert(BigDecimal quantity, RecipeUnit from,
                       RecipeUnit to, BigDecimal ozWeightPerCup);

    /**
     * [COMP] Given a purchase unit and price, returns cost per fl-oz and
     *        cost per wt-oz — the "Conversion Calculator" screen.
     * Delegates to calcCostPerFlOz() and calcCostPerWtOz().
     *
     * Endpoint: POST /api/conversions/ingredient-cost-calculator
     */
    ConversionCalculatorResultDto calculateIngredientCosts(
            ConversionCalculatorRequest req);
}