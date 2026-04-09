// ================================================================
// COMPLETE SERVICE LAYER — Restaurant Management Platform v4
// All subsystems including Prime Cost, Labor, and Variance Analysis
//
// Legend:
//  [DB]    PostgreSQL read/write
//  [COMP]  pure computation via ConversionFunctions
//  [CACHE] Redis cache-aside pattern
//  [INVAL] Redis key invalidation
//  [EVENT] domain event published
// ================================================================

package com.restaurant.service;

// ════════════════════════════════════════════════════════════════
// 1. RESTAURANT SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class RestaurantService {
    /** [DB] Create tenant. Seeds default cost groups. */
    Restaurant createRestaurant(CreateRestaurantRequest req);
    /** [DB] Fetch by id — validates tenancy on every request. */
    Restaurant getById(Long restaurantId);
    /** [DB] Update name/timezone. [INVAL] All restaurant:{id}:* Redis keys. */
    Restaurant update(Long restaurantId, UpdateRestaurantRequest req);
    /** [DB] Platform admin list. */
    List<RestaurantSummaryDto> listAll();
}

// ════════════════════════════════════════════════════════════════
// 2. SUPPLIER SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class SupplierService {
    /** [DB] Create supplier, unique by name per restaurant. */
    Supplier create(Long restaurantId, CreateSupplierRequest req);
    /** [DB] Active list sorted by name. */
    List<SupplierDto> listActive(Long restaurantId);
    /** [DB] Full list including inactive. */
    List<SupplierDto> listAll(Long restaurantId);
    /** [DB] Update contact details. */
    Supplier update(Long restaurantId, Long supplierId, UpdateSupplierRequest req);
    /** [DB] Soft-delete. Blocked if supplier has POSTED invoices in current period. */
    void deactivate(Long restaurantId, Long supplierId);
    /** [DB] Name-fragment search — powers invoice entry autocomplete. */
    List<SupplierDto> search(Long restaurantId, String fragment);
}

// ════════════════════════════════════════════════════════════════
// 3. INGREDIENT SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class IngredientService {
    /** [DB] Create. Auto-assigns next itemCode. */
    Ingredient create(Long restaurantId, CreateIngredientRequest req);
    /** [DB] Full record. */
    Ingredient getById(Long restaurantId, Long ingredientId);
    /** [DB] Filterable by type and category. */
    List<IngredientSummaryDto> list(Long restaurantId, InventoryType type, InventoryCategory category);
    /** [DB] Name-fragment search — recipe editor autocomplete. */
    List<IngredientSummaryDto> search(Long restaurantId, String fragment);
    /**
     * [DB] Update all fields.
     * [INVAL] If price/yield changed: ingredient costs, all recipe costs using it,
     *         all menu item costs using it.
     * [EVENT] IngredientPriceChangedEvent → MenuItemCostService.invalidateCostCacheForIngredient()
     * [DB] Writes IngredientPriceHistory row when purchaseUnitPrice changes.
     */
    Ingredient update(Long restaurantId, Long ingredientId, UpdateIngredientRequest req);
    /** [DB] Soft-delete. Blocked if used in active recipe/menu item. */
    void deactivate(Long restaurantId, Long ingredientId);
    /**
     * [CACHE] Returns {ruCost, iuCost}.
     * Hit: restaurant:{id}:ingredient:{id}:costs  TTL 24hr.
     * Miss: [COMP] calcRuCost() + calcIuCost() → store.
     */
    IngredientCostDto getCosts(Long restaurantId, Long ingredientId);
    /**
     * [DB] Items where count < parLevel from latest FINALISED period.
     * Powers low-stock alerts badge and screen.
     */
    List<LowStockAlertDto> getLowStockAlerts(Long restaurantId);
    /** [DB] Store object-storage key + increment imageVersion. Returns CDN URL. */
    String uploadImage(Long restaurantId, Long ingredientId, MultipartFile image);
    /** [DB] Price history for one ingredient — used in Variance Attribution. */
    List<IngredientPriceHistory> getPriceHistory(Long restaurantId, Long ingredientId);
}

// ════════════════════════════════════════════════════════════════
// 4. INVENTORY SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class InventoryService {
    /** [DB] Open new period. Pre-populates all active ingredients with count=0. */
    InventoryPeriod openPeriod(Long restaurantId, InventoryType type);
    /** [DB] Current OPEN or most recent FINALISED period. */
    InventoryPeriod getCurrentPeriod(Long restaurantId, InventoryType type);
    /**
     * [DB] Full period with all line items.
     * [COMP] extension = count × calcIuCost(ingredient) per line.
     * [COMP] categorySubtotals, totalValue — computed in memory.
     */
    InventoryPeriodDetailDto getPeriodDetail(Long restaurantId, Long periodId);
    /** [DB] Update single count. */
    void updateCount(Long restaurantId, Long periodId, Long lineItemId, BigDecimal count);
    /** [DB] Batch update — all counts in one transaction. */
    void batchUpdateCounts(Long restaurantId, Long periodId, List<LineCountUpdateRequest> updates);
    /**
     * [DB] OPEN → FINALISED.
     * [INVAL] restaurant:{id}:inventory:latest:{type}
     * [EVENT] InventoryPeriodFinalisedEvent → PrimeCostService picks up new beg/end values.
     */
    void finalisePeriod(Long restaurantId, Long periodId);
    /**
     * [CACHE] Latest finalised summary.
     * Hit: restaurant:{id}:inventory:latest:{FOOD|BAR}
     * Miss: [DB] fetch + [COMP] totalValue + categoryBreakdown → store.
     */
    InventoryLatestDto getLatest(Long restaurantId, InventoryType type);
    /** [DB] Period list header-only. */
    List<InventoryPeriodSummaryDto> listPeriods(Long restaurantId, InventoryType type);
    /**
     * [DB] Compare two FINALISED periods.
     * [COMP] delta per ingredient + per category.
     */
    InventoryComparisonDto comparePeriods(Long restaurantId, Long periodId1, Long periodId2);
}

// ════════════════════════════════════════════════════════════════
// 5. PURCHASE INVOICE SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class PurchaseInvoiceService {
    /** [DB] Create DRAFT invoice. */
    PurchaseInvoice createDraft(Long restaurantId, CreateInvoiceRequest req);
    /**
     * [DB] Full invoice with lines.
     * [COMP] proof = invoiceAmount − SUM(lines.amount).
     * [COMP] pctByCategory per line.
     */
    InvoiceDetailDto getDetail(Long restaurantId, Long invoiceId);
    /** [DB] Add/update category line on DRAFT. [COMP] Returns updated proof. */
    BigDecimal upsertLine(Long restaurantId, Long invoiceId, PurchaseCategory category, BigDecimal amount);
    /** [DB] Remove category line. [COMP] Returns updated proof. */
    BigDecimal removeLine(Long restaurantId, Long invoiceId, PurchaseCategory category);
    /**
     * [DB] DRAFT → POSTED. Blocked if proof ≠ 0.
     * [INVAL] restaurant:{id}:purchases:week:{weekStart}
     *         restaurant:{id}:kpis:week:{weekStart}
     * [EVENT] InvoicePostedEvent → PrimeCostService, KpiService.
     */
    void post(Long restaurantId, Long invoiceId);
    /**
     * [DB] POSTED → VOID.
     * [INVAL] Same keys as post().
     * [EVENT] InvoiceVoidedEvent.
     */
    void voidInvoice(Long restaurantId, Long invoiceId);
    /** [DB] Filtered list by date range + supplier + status. */
    List<InvoiceSummaryDto> list(Long restaurantId, LocalDate from, LocalDate to, Long supplierId);
    /**
     * [CACHE] Weekly totals by category.
     * Hit: restaurant:{id}:purchases:week:{weekStart}  TTL 1hr.
     * Miss: [DB] SUM GROUP BY category → [COMP] pct totals → store.
     */
    WeeklyPurchaseSummaryDto getWeeklySummary(Long restaurantId, LocalDate weekStart);
    /** [DB] SUM by supplier for a date range. "Spend by Supplier" screen. */
    List<SupplierSpendDto> getSpendBySupplier(Long restaurantId, LocalDate from, LocalDate to);
    /** [DB] Week-over-week trend for a category. Not cached — infrequent. */
    List<PurchaseTrendPointDto> getCategoryTrend(Long restaurantId, PurchaseCategory category, int weeks);
}

// ════════════════════════════════════════════════════════════════
// 6. BATCH RECIPE SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class BatchRecipeService {
    /** [DB] Create recipe shell with no lines. */
    BatchRecipe create(Long restaurantId, CreateBatchRecipeRequest req);
    /**
     * [DB] Full detail: header + lines + steps.
     * [COMP] ruCost per line via IngredientService.getCosts() (Redis-backed).
     * [COMP] extension per line, totalCost, costPerYieldUnit.
     */
    BatchRecipeDetailDto getDetail(Long restaurantId, Long recipeId);
    /**
     * [CACHE] Cost summary only.
     * Hit: restaurant:{id}:recipe:{id}:cost  TTL 24hr.
     * Miss: [COMP] full cost → store.
     */
    RecipeCostDto getCost(Long restaurantId, Long recipeId);
    /**
     * [DB] Update header.
     * [INVAL] recipe cost + all menu item costs that use this recipe.
     */
    BatchRecipe updateHeader(Long restaurantId, Long recipeId, UpdateBatchRecipeRequest req);
    /** [DB] Add ingredient line. [INVAL] Recipe + affected menu item cost caches. */
    RecipeIngredientLine addIngredientLine(Long restaurantId, Long recipeId, AddIngredientLineRequest req);
    /** [DB] Update qty. [INVAL] Same. */
    RecipeIngredientLine updateIngredientLine(Long restaurantId, Long recipeId, Long lineId, BigDecimal qty);
    /** [DB] Remove line. [INVAL] Same. */
    void removeIngredientLine(Long restaurantId, Long recipeId, Long lineId);
    /** [DB] Bulk reorder lines. */
    void reorderIngredientLines(Long restaurantId, Long recipeId, List<LineReorderRequest> reorders);
    /** [DB] Add procedure step. */
    RecipeProcedureStep addStep(Long restaurantId, Long recipeId, AddStepRequest req);
    /** [DB] Update step instruction. */
    RecipeProcedureStep updateStep(Long restaurantId, Long recipeId, Long stepId, String instruction);
    /** [DB] Reorder steps. */
    void reorderSteps(Long restaurantId, Long recipeId, List<StepReorderRequest> reorders);
    /** [DB] Remove step. */
    void removeStep(Long restaurantId, Long recipeId, Long stepId);
    /** [DB] Active summary list — recipe picker source. */
    List<BatchRecipeSummaryDto> listActive(Long restaurantId);
    /** [DB] Soft-delete. Blocked if used by active menu items. */
    void deactivate(Long restaurantId, Long recipeId);
    /**
     * [COMP] Scale to a new yield — NOT persisted.
     * Returns transient ScaledRecipeDto with all quantities multiplied by factor.
     */
    ScaledRecipeDto scaleRecipe(Long restaurantId, Long recipeId, BigDecimal targetYieldQuantity);
}

// ════════════════════════════════════════════════════════════════
// 7. MENU ITEM COST SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class MenuItemCostService {
    /** [DB] Create menu item. */
    MenuItem create(Long restaurantId, Long costGroupId, CreateMenuItemRequest req);
    /**
     * [DB] Full detail with costed lines.
     * [COMP] totalCost, grossProfit, foodCostPct, targetPrice.
     */
    MenuItemDetailDto getDetail(Long restaurantId, Long menuItemId);
    /**
     * [CACHE] Cost summary only.
     * Hit: restaurant:{id}:menuitem:{id}:cost  TTL 24hr.
     * Miss: [COMP] → store.
     */
    MenuItemCostDto getCost(Long restaurantId, Long menuItemId);
    /**
     * [DB] Update header.
     * [INVAL] item cost + cost group summary.
     * [EVENT] MenuItemPriceChangedEvent.
     */
    MenuItem updateHeader(Long restaurantId, Long menuItemId, UpdateMenuItemRequest req);
    /** [DB] Add costing line (ingredient XOR batchRecipe). [INVAL] Item + group caches. */
    MenuItemIngredientLine addCostingLine(Long restaurantId, Long menuItemId, AddCostingLineRequest req);
    /** [DB] Update line qty. [INVAL] Same. */
    MenuItemIngredientLine updateCostingLine(Long restaurantId, Long menuItemId, Long lineId, BigDecimal qty);
    /** [DB] Remove line. [INVAL] Same. */
    void removeCostingLine(Long restaurantId, Long menuItemId, Long lineId);
    /** [DB] Reorder lines. */
    void reorderCostingLines(Long restaurantId, Long menuItemId, List<LineReorderRequest> reorders);
    /**
     * [CACHE] Cost summary for all items in group.
     * Hit: restaurant:{id}:costgroup:{id}:cost-summary  TTL 1hr.
     * Miss: [COMP] getCost() per item → aggregate → store.
     */
    List<MenuItemCostDto> getCostGroupSummary(Long restaurantId, Long costGroupId);
    /**
     * [COMP] Target price for a desired FC% — NOT persisted.
     * Returns targetPrice = totalCost / targetFoodCostPct.
     */
    BigDecimal calculateTargetPrice(Long restaurantId, Long menuItemId, BigDecimal targetFoodCostPct);
    /** [DB] Store image key + increment version. Returns CDN URL. */
    String uploadImage(Long restaurantId, Long menuItemId, MultipartFile image);
    /** [DB] Move to different cost group. [INVAL] Old + new group summaries. */
    void moveToCostGroup(Long restaurantId, Long menuItemId, Long newCostGroupId);
    /** [DB] Soft-delete. Blocked if has OrderLines in current period. */
    void deactivate(Long restaurantId, Long menuItemId);
    /** Internal — called by IngredientPriceChangedEvent listener. [INVAL] Affected item caches. */
    void invalidateCostCacheForIngredient(Long restaurantId, Long ingredientId);
}

// ════════════════════════════════════════════════════════════════
// 8. MENU COST GROUP SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class MenuCostGroupService {
    /** [DB] Create group. */
    MenuCostGroup create(Long restaurantId, CreateCostGroupRequest req);
    /** [DB] All groups for restaurant. */
    List<MenuCostGroupDto> listAll(Long restaurantId);
    /** [DB] Update name/order. [INVAL] Cost summary cache. */
    MenuCostGroup update(Long restaurantId, Long costGroupId, UpdateCostGroupRequest req);
    /** [DB] Bulk reorder groups. */
    void reorder(Long restaurantId, List<GroupReorderRequest> reorders);
    /** [DB] Deactivate. Blocked if active menu items exist in group. */
    void deactivate(Long restaurantId, Long costGroupId);
}

// ════════════════════════════════════════════════════════════════
// 9. BUILD CHART SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class BuildChartService {
    /** [DB] Create or replace build chart for a menu item (1:1). */
    RecipeBuildChart createOrReplace(Long restaurantId, Long menuItemId, CreateBuildChartRequest req);
    /** [DB] Chart + all lines for a menu item. Null if none exists yet. */
    BuildChartDetailDto getByMenuItem(Long restaurantId, Long menuItemId);
    /** [DB] Update chart header (station, plating spec). */
    RecipeBuildChart updateHeader(Long restaurantId, Long buildChartId, UpdateBuildChartRequest req);
    /** [DB] Add line. Validates portionUnit/portionNote and servingUtensil/utensilNote exclusivity. */
    BuildChartLine addLine(Long restaurantId, Long buildChartId, AddBuildChartLineRequest req);
    /** [DB] Update line. */
    BuildChartLine updateLine(Long restaurantId, Long buildChartId, Long lineId, UpdateBuildChartLineRequest req);
    /** [DB] Remove line. */
    void removeLine(Long restaurantId, Long buildChartId, Long lineId);
    /** [DB] Reorder lines. */
    void reorderLines(Long restaurantId, Long buildChartId, List<LineReorderRequest> reorders);
    /** [DB] All charts for a station — "Print All for Station" source. */
    List<BuildChartSummaryDto> getByStation(Long restaurantId, KitchenStationType station);
}

// ════════════════════════════════════════════════════════════════
// 10. OPERATIONS MANUAL SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class OperationsManualService {
    /** [DB] Create entry. batchRecipeId takes priority over content when set. */
    OperationsManualEntry create(Long restaurantId, CreateManualEntryRequest req);
    /** [DB] Entry + linked recipe steps if batchRecipe is set. */
    ManualEntryDetailDto getDetail(Long restaurantId, Long entryId);
    /** [DB] All entries grouped by station, sorted by displayOrder. */
    List<ManualEntrySummaryDto> list(Long restaurantId, KitchenStationType station);
    /** [DB] Update entry. */
    OperationsManualEntry update(Long restaurantId, Long entryId, UpdateManualEntryRequest req);
    /** [DB] Reorder within station. */
    void reorder(Long restaurantId, List<EntryReorderRequest> reorders);
    /** [DB] Hard delete — manuals are not audited. */
    void delete(Long restaurantId, Long entryId);
    /** [DB] All entries formatted for full print — grouped by station, with recipe steps. */
    PrintManualDto buildPrintManual(Long restaurantId);
}

// ════════════════════════════════════════════════════════════════
// 11. MENU ENGINEERING SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class MenuEngineeringService {
    /** [DB] Create DRAFT period. */
    MenuEngineeringPeriod createPeriod(Long restaurantId, CreateEngPeriodRequest req);
    /** [DB] All periods, most recent first. */
    List<EngPeriodSummaryDto> listPeriods(Long restaurantId);
    /**
     * Core analysis pipeline:
     * [DB] All active MenuItems in cost group.
     * [DB] SUM(orderLine.qty) + SUM(priceAtOrder × qty) per item in date range.
     * [COMP] itemCost via MenuItemCostService.getCost() (Redis).
     * [COMP] grossProfit, salesMixPct, totalCost, totalRevenue, totalProfit per item.
     * [COMP] popularityThreshold, weightedAvgGP across all items.
     * [COMP] gpCategory, mixCategory, classification per item.
     * [DB] Write MenuEngineeringResult rows. Update period status → FINALISED.
     * [CACHE] Store results + summary in Redis (permanent TTL).
     */
    void runAnalysis(Long restaurantId, Long periodId);
    /**
     * [CACHE] Full result set.
     * Hit: restaurant:{id}:menu-engineering:period:{id}:results  permanent.
     * Miss: [DB] fetch rows + [COMP] all derived fields → store.
     */
    List<MenuEngResultDto> getResults(Long restaurantId, Long periodId);
    /**
     * [CACHE] Aggregate summary.
     * Hit: restaurant:{id}:menu-engineering:period:{id}:summary  permanent.
     * Miss: [COMP] from results → store.
     */
    EngPeriodSummaryDto getSummary(Long restaurantId, Long periodId);
    /**
     * Delete existing results. [INVAL] Period results + summary.
     * Calls runAnalysis() with updated parameters.
     */
    void reRunAnalysis(Long restaurantId, Long periodId, ReRunEngRequest req);
    /**
     * [CACHE] Live qty sold today per item in cost group.
     * Hit: restaurant:{id}:menu-engineering:live:{costGroupId}  TTL 5min.
     * Miss: [DB] SUM(orderLine.qty) GROUP BY menuItem WHERE today + NOT VOIDED → store.
     */
    List<LiveSalesCountDto> getLiveSalesCounts(Long restaurantId, Long costGroupId);
    /**
     * [COMP] What-if simulation — NOT persisted, NOT cached.
     * Re-runs all classifications with priceOverrides applied.
     * Returns transient WhatIfResultDto with before/after classification per item.
     */
    WhatIfResultDto simulateWhatIf(Long restaurantId, Long periodId, List<WhatIfOverride> overrides);
    /**
     * [DB] Compare two FINALISED periods.
     * Shows per-item classification changes + aggregate metric deltas.
     */
    PeriodComparisonDto comparePeriods(Long restaurantId, Long periodId1, Long periodId2);
}

// ════════════════════════════════════════════════════════════════
// 12. DINING TABLE SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class DiningTableService {
    /** [DB] Create table. Validates tableNumber uniqueness. */
    DiningTable create(Long restaurantId, CreateDiningTableRequest req);
    /** [DB] Active tables, optionally filtered by section. */
    List<DiningTableDto> listActive(Long restaurantId, TableSection section);
    /** [DB] Update tableNumber, capacity, section. */
    DiningTable update(Long restaurantId, Long tableId, UpdateDiningTableRequest req);
    /** [DB] Deactivate. Blocked if table has OPEN session. */
    void deactivate(Long restaurantId, Long tableId);
    /**
     * [CACHE] Floor status — all tables with session state.
     * Hit: restaurant:{id}:sessions:live  event-driven, no TTL.
     * Miss: [DB] tables + OPEN sessions → build floor map → store.
     */
    FloorStatusDto getFloorStatus(Long restaurantId);
}

// ════════════════════════════════════════════════════════════════
// 13. TABLE SESSION SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class TableSessionService {
    /**
     * [DB] Open session. Blocked if table has existing OPEN session.
     * [INVAL] restaurant:{id}:sessions:live, restaurant:{id}:kpis:today.
     */
    TableSession open(Long restaurantId, Long tableId, OpenSessionRequest req);
    /**
     * [DB] Update guest count on OPEN session.
     * [INVAL] restaurant:{id}:kpis:today.
     */
    TableSession updateGuestCount(Long restaurantId, Long sessionId, Integer guestCount);
    /**
     * [DB] Close session. status → CLOSED, sets closedAt.
     * [INVAL] sessions:live, kpis:today, kpis:week:{weekStart},
     *         kpis:turn-times:{dayOfWeek}:{section}.
     * [EVENT] SessionClosedEvent → KpiService recomputes.
     */
    TableSession close(Long restaurantId, Long sessionId, Long closedByUserId);
    /**
     * [DB] Void session. Blocked if any non-VOID orders.
     * [INVAL] Same as close().
     */
    void voidSession(Long restaurantId, Long sessionId);
    /**
     * [DB] Session + all orders + lines.
     * [COMP] orderTotal, sessionTotal, checkAverage, durationMinutes.
     */
    SessionDetailDto getDetail(Long restaurantId, Long sessionId);
    /** [DB] Session list for date range with summary totals. */
    List<SessionSummaryDto> list(Long restaurantId, LocalDate from, LocalDate to);
    /**
     * [CACHE] Guest heatmap — 30-min slots for a week.
     * POS mode: Hit: restaurant:{id}:kpis:guest-heatmap:week:{weekStart}  TTL 1hr.
     *           Miss: [DB] GROUP BY FLOOR(minute/30) on openedAt → store.
     * Manual fallback: delegates to GuestCountService.getWeeklyGrid().
     */
    GuestHeatmapDto getGuestHeatmap(Long restaurantId, LocalDate weekStart);
    /**
     * [CACHE] 3-week rolling average heatmap.
     * Hit: restaurant:{id}:kpis:guest-heatmap:rolling3w:{weekStart}  TTL 1hr.
     * Miss: [COMP] average getGuestHeatmap() across 3 weeks → store.
     */
    GuestHeatmapDto getRollingAverageHeatmap(Long restaurantId, LocalDate weekStart, int weeks);
}

// ════════════════════════════════════════════════════════════════
// 14. ORDER SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class OrderService {
    /** [DB] Create OPEN order on an OPEN session. */
    Order createOrder(Long restaurantId, Long sessionId, Long createdByUserId);
    /**
     * [DB] Add line. Snapshots priceAtOrder = MenuItem.menuPrice NOW.
     * [INVAL] kpis:today, menu-engineering:live:{costGroupId},
     *         top-sellers:today, sales:daily:{date}:by-category.
     */
    OrderLine addLine(Long restaurantId, Long orderId, Long menuItemId, Integer quantity);
    /** [DB] Update qty. [INVAL] Same as addLine(). */
    OrderLine updateLineQuantity(Long restaurantId, Long orderId, Long lineId, Integer quantity);
    /** [DB] Line status → VOIDED. [INVAL] Same as addLine(). */
    void voidLine(Long restaurantId, Long orderId, Long lineId);
    /** [DB] Line status → COMPED. [INVAL] Same as addLine(). */
    void compLine(Long restaurantId, Long orderId, Long lineId);
    /** [DB] Order status → FIRED. Operational only, no financial impact. */
    void fireOrder(Long restaurantId, Long orderId);
    /**
     * [DB] Order status → CLOSED.
     * [INVAL] kpis:today, kpis:week:{weekStart}, kpis:food-cost-pct:today.
     * [EVENT] OrderClosedEvent → KpiService, PrimeCostService.
     */
    void closeOrder(Long restaurantId, Long orderId);
    /** [DB] Void entire order + all lines. [INVAL] Same as closeOrder(). */
    void voidOrder(Long restaurantId, Long orderId);
    /**
     * [DB] Order + all lines.
     * [COMP] lineTotal per ORDERED/COMPED line, orderTotal, compedTotal.
     */
    OrderDetailDto getDetail(Long restaurantId, Long orderId);
    /** [DB] All orders for a session. */
    List<OrderSummaryDto> listBySession(Long restaurantId, Long sessionId);
}

// ════════════════════════════════════════════════════════════════
// 15. GUEST COUNT SERVICE  (manual fallback — no POS)
// ════════════════════════════════════════════════════════════════
@Service
public class GuestCountService {
    /**
     * [DB] Upsert one time slot.
     * [INVAL] guest-heatmap:week:{weekStart}, guest-heatmap:rolling3w:{weekStart}.
     */
    GuestCountEntry upsertSlot(Long restaurantId, UpsertSlotRequest req);
    /** [DB] Batch upsert full week in one transaction. [INVAL] Same. */
    void batchUpsert(Long restaurantId, LocalDate weekStart, List<UpsertSlotRequest> slots);
    /**
     * [DB] All entries for week as a grid.
     * [COMP] weeklyTotal, weeklyAverage, dailyTotals per slot.
     */
    WeeklyGuestGridDto getWeeklyGrid(Long restaurantId, LocalDate weekStart);
    /**
     * [CACHE] 3-week rolling average heatmap (manual data).
     * Hit: restaurant:{id}:kpis:guest-heatmap:rolling3w:{weekStart}  TTL 1hr.
     * Miss: [DB] AVG(countMon…) GROUP BY timeSlot for 3 weeks → store.
     */
    GuestHeatmapDto getRollingAverageHeatmap(Long restaurantId, LocalDate weekStart, int weeks);
}

// ════════════════════════════════════════════════════════════════
// 16. UNIT CONVERSION SERVICE  (pure math — no DB, no Redis)
// ════════════════════════════════════════════════════════════════
@Service
public class UnitConversionService {
    /**
     * [COMP] Convert between RecipeUnits.
     * Delegates to ConversionFunctions.convertRecipeUnit().
     */
    BigDecimal convert(BigDecimal qty, RecipeUnit from, RecipeUnit to, BigDecimal ozWeightPerCup);
    /**
     * [COMP] Ingredient cost calculator — costPerFlOz and costPerWtOz.
     * Delegates to calcCostPerFlOz(), calcCostPerWtOz().
     */
    ConversionCalculatorResultDto calculateIngredientCosts(ConversionCalculatorRequest req);
}

// ════════════════════════════════════════════════════════════════
// 17. EMPLOYEE / LABOR SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class LaborService {
    /** [DB] Create employee master record. */
    Employee createEmployee(Long restaurantId, CreateEmployeeRequest req);
    /** [DB] All employees, optionally filtered by type. */
    List<EmployeeDto> listEmployees(Long restaurantId, EmployeeType type);
    /** [DB] Update employee (name, rate, salary). */
    Employee updateEmployee(Long restaurantId, Long employeeId, UpdateEmployeeRequest req);
    /** [DB] Soft-delete employee. */
    void deactivateEmployee(Long restaurantId, Long employeeId);

    /** [DB] Create or update daily hours record for a week. */
    EmployeeLaborRecord upsertWeeklyHours(Long restaurantId, Long employeeId,
                                          LocalDate weekStart, WeeklyHoursRequest req);
    /**
     * [DB] All labor records for a week.
     * [COMP] Per employee: totalHours, daily costs with overtime (>40hr = 1.5×), totalCost.
     * [COMP] Week aggregates: totalHourlyLabor, totalManagementLabor, benefitsCost.
     */
    LaborWeekSummaryDto getWeeklySummary(Long restaurantId, LocalDate weekStart);

    /**
     * [COMP] Sales per labor hour — per day and per week.
     * salesPerHour = grossSales(day) / totalHours(day).
     * Gross sales from KpiService / OrderLine.
     */
    SalesPerLaborHourDto getSalesPerLaborHour(Long restaurantId, LocalDate weekStart);

    /**
     * [COMP] Labor cost per cover — per day and week.
     * laborCostPerCover = totalLaborCost(day) / totalCovers(day).
     */
    LaborCostPerCoverDto getLaborCostPerCover(Long restaurantId, LocalDate weekStart);

    // ── Scheduling (Scheduled vs Actual) ────────────────────
    /** [DB] Create or update a scheduled shift. */
    ScheduledShift upsertShift(Long restaurantId, UpsertShiftRequest req);
    /** [DB] All scheduled shifts for a date range. */
    List<ScheduledShiftDto> listShifts(Long restaurantId, LocalDate from, LocalDate to);
    /** [DB] Delete a scheduled shift. */
    void deleteShift(Long restaurantId, Long shiftId);
    /**
     * [DB] Scheduled shifts for the week.
     * [COMP] scheduledHours = endTime − startTime per shift.
     * [COMP] scheduledCost = scheduledHours × employee.hourlyRate.
     */
    ScheduleSummaryDto getScheduleSummary(Long restaurantId, LocalDate weekStart);
    /**
     * [COMP] Scheduled vs Actual variance.
     * scheduledLabor from ScheduledShift.
     * actualLabor from EmployeeLaborRecord.
     * variance = actual − scheduled.
     */
    ScheduleVsActualDto compareScheduleVsActual(Long restaurantId, LocalDate weekStart);
}

// ════════════════════════════════════════════════════════════════
// 18. PRIME COST SERVICE  ← THE NEXT LEVEL
// ════════════════════════════════════════════════════════════════
@Service
public class PrimeCostService {

    /**
     * [CACHE] Live prime cost % — updated every 5 minutes during service.
     *
     * Formula:
     *   livePrimeCostPct = (theoreticalCosToDate + postedPurchasesThisWeek + laborAccrualToDate)
     *                      / grossSalesToDate
     *
     * theoreticalCosToDate = SUM(orderLine.qty × menuItem.totalCost) WHERE this week, NOT VOIDED
     * postedPurchasesThisWeek = SUM(invoiceLine.amount) WHERE POSTED, this week
     * laborAccrualToDate = prorated from LaborService.getWeeklySummary() days elapsed
     * grossSalesToDate = SUM(orderLine.priceAtOrder × qty) WHERE CLOSED, this week
     *
     * Hit: restaurant:{id}:prime-cost:live  TTL 5min.
     * Miss: [DB] compute all four components → [COMP] → store.
     * Endpoint: GET /api/prime-cost/live
     */
    LivePrimeCostDto getLivePrimeCost(Long restaurantId);

    /**
     * [COMP] Theoretical COGS for any date range.
     * = SUM(orderLine.qty × menuItem.totalCost) WHERE orderedAt IN range AND NOT VOIDED
     * menuItem.totalCost from MenuItemCostService.getCost() — Redis-backed.
     * Endpoint: GET /api/prime-cost/theoretical-cos?from=&to=
     */
    BigDecimal computeTheoreticalCos(Long restaurantId, LocalDate from, LocalDate to);

    /**
     * [DB] Actual COGS for a period.
     * = begInventory + purchases − endInventory
     * Sources: InventoryPeriod (beg/end) + PurchaseInvoice (POSTED in range).
     * Endpoint: GET /api/prime-cost/actual-cos?from=&to=
     */
    BigDecimal computeActualCos(Long restaurantId, LocalDate from, LocalDate to);

    /**
     * [COMP] Shrinkage / Yield Variance.
     * = actualCos − theoreticalCos
     * Positive = more was consumed than recipes call for (waste, theft, portioning error).
     * Endpoint: GET /api/prime-cost/shrinkage?from=&to=
     */
    ShrinkageDto computeShrinkage(Long restaurantId, LocalDate from, LocalDate to);

    /**
     * [DB] + [COMP] Full weekly prime cost report (for the Prime Cost Worksheet screen).
     * Pulls actuals from all subsystems, computes all KPIs.
     * If a saved PrimeCostReport exists for weekStart → returns it (FINALISED snapshot).
     * Otherwise builds on-the-fly from live data → returns DRAFT.
     * Endpoint: GET /api/prime-cost/weekly?weekStart=2024-01-01
     */
    PrimeCostReportDto getWeeklyReport(Long restaurantId, LocalDate weekStart);

    /**
     * [DB] Finalise and save the week's prime cost report.
     * Writes a PrimeCostReport row (frozen snapshot).
     * [EVENT] PrimeCostReportFinalisedEvent.
     * Endpoint: POST /api/prime-cost/weekly/{weekStart}/finalise
     */
    PrimeCostReport finaliseWeeklyReport(Long restaurantId, LocalDate weekStart);

    /**
     * [CACHE] Prime cost trend — N weeks rolling history.
     * Hit: restaurant:{id}:prime-cost:trend:{weeks}  TTL 1hr.
     * Miss: [DB] last N finalised PrimeCostReport rows OR on-the-fly compute → store.
     * Endpoint: GET /api/prime-cost/trend?weeks=8
     */
    List<PrimeCostTrendPointDto> getPrimeCostTrend(Long restaurantId, int weeks);

    /**
     * [DB] + [COMP] Actual vs Budget report for a week.
     * Compares PrimeCostReport actuals against WeeklyBudget targets.
     * Returns per-line-item variance (favorable / unfavorable) with $.
     * Endpoint: GET /api/prime-cost/budget-vs-actual?weekStart=2024-01-01
     */
    BudgetVsActualDto getBudgetVsActual(Long restaurantId, LocalDate weekStart);

    /**
     * [DB] + [COMP] Variance Attribution — WHY did prime cost change vs prior week.
     *
     * Explains variance into four buckets:
     *  1. Price variance:   ingredient price changes × qty sold
     *                       Source: IngredientPriceHistory × OrderLine
     *  2. Volume mix shift: change in sales mix toward higher/lower cost items
     *                       Source: MenuEngineeringResult comparison across periods
     *  3. Portion variance: actual COGS − theoretical COGS = shrinkage gap
     *                       Source: computeShrinkage() for current vs prior week
     *  4. Labor variance:   actual labor − scheduled labor
     *                       Source: LaborService.compareScheduleVsActual()
     *
     * Endpoint: GET /api/prime-cost/variance-attribution?weekStart=2024-01-01
     */
    VarianceAttributionDto getVarianceAttribution(Long restaurantId, LocalDate weekStart);

    /**
     * [COMP] Mid-week prime cost forecast.
     * Projects where prime cost will land by end of week based on:
     *   - Current run rate (actual sales + costs so far)
     *   - Remaining scheduled labor (from ScheduledShift)
     *   - Historical avg purchase run rate for this day-of-week
     *
     * NOT persisted. Used in dashboard alert banner.
     * Endpoint: GET /api/prime-cost/forecast?weekStart=2024-01-01
     */
    PrimeCostForecastDto getForecast(Long restaurantId, LocalDate weekStart);

    /**
     * [DB] Multi-location prime cost rollup (owner/corporate view).
     * Returns prime cost % per restaurant + combined aggregate.
     * Endpoint: GET /api/prime-cost/multi-location?weekStart=2024-01-01
     */
    MultiLocationPrimeCostDto getMultiLocationSummary(List<Long> restaurantIds, LocalDate weekStart);

    // ── Event listeners ─────────────────────────────────────
    /** Triggered by InvoicePostedEvent. Updates live prime cost cache. */
    void onInvoicePosted(InvoicePostedEvent event);
    /** Triggered by OrderClosedEvent. Updates live prime cost + theoretical COS. */
    void onOrderClosed(OrderClosedEvent event);
    /** Triggered by InventoryPeriodFinalisedEvent. Updates actual COS. */
    void onInventoryFinalised(InventoryPeriodFinalisedEvent event);
}

// ════════════════════════════════════════════════════════════════
// 19. KPI SERVICE  (pure read + cache — no DB writes)
// ════════════════════════════════════════════════════════════════
@Service
public class KpiService {
    /**
     * [CACHE] Today's live KPIs.
     * Hit: restaurant:{id}:kpis:today  TTL 5min.
     * Miss: [COMP from multiple sources]:
     *   coversToday      = SUM(session.guestCount) WHERE today, NOT VOID
     *   openSessionsNow  = COUNT(*) WHERE status = OPEN
     *   grossSalesToday  = SUM(orderLine.priceAtOrder × qty) WHERE ORDERED, today
     *   compedToday      = SUM(... ) WHERE COMPED, today
     *   checkAvgToday    = grossSalesToday / coversToday
     *   foodCostPctToday = SUM(menuItem.totalCost × qty) / grossSalesToday
     *   topSellerToday   = menuItem with highest qtySold today
     * → store.
     * Endpoint: GET /api/kpis/today
     */
    TodayKpiDto getTodayKpis(Long restaurantId);

    /**
     * [CACHE] Weekly KPIs.
     * Hit: restaurant:{id}:kpis:week:{weekStart}  TTL 5min current / permanent past.
     * Miss: [COMP] same as today but scoped to week → store.
     * Endpoint: GET /api/kpis/weekly?weekStart=2024-01-01
     */
    WeekKpiDto getWeekKpis(Long restaurantId, LocalDate weekStart);

    /**
     * [CACHE] Avg table turn times per section per day-of-week.
     * Hit: restaurant:{id}:kpis:turn-times:{dayOfWeek}:{section}  TTL 1hr.
     * Miss: [DB] AVG(closedAt − openedAt) GROUP BY section, DOW → store.
     * Endpoint: GET /api/kpis/turn-times
     */
    List<TurnTimeDto> getTableTurnTimes(Long restaurantId);

    /**
     * [CACHE] Top N sellers by quantity.
     * Hit: restaurant:{id}:top-sellers:{period}  TTL 5min today / 1hr week.
     * Miss: [DB] SUM(qty) GROUP BY menuItem ORDER BY SUM DESC → store.
     * Endpoint: GET /api/analytics/top-sellers?period=today&limit=10
     */
    List<SellerRankDto> getTopSellers(Long restaurantId, String period, int limit);

    /**
     * [CACHE] Slowest N sellers — LOSER candidates.
     * Hit: restaurant:{id}:slow-sellers:{period}  TTL 5min today / 1hr week.
     * Miss: same query ASC → store.
     * Endpoint: GET /api/analytics/slow-sellers?period=week&limit=10
     */
    List<SellerRankDto> getSlowSellers(Long restaurantId, String period, int limit);

    /**
     * [CACHE] Daily revenue by cost group.
     * Hit: restaurant:{id}:sales:daily:{date}:by-category  TTL 5min live / 24hr past.
     * Miss: [DB] SUM(priceAtOrder × qty) GROUP BY costGroup WHERE date → store.
     * Endpoint: GET /api/sales/daily?date=2024-01-15
     */
    DailySalesByCategoryDto getDailySalesByCategory(Long restaurantId, LocalDate date);

    /**
     * [CACHE] Live food cost %.
     * Hit: restaurant:{id}:kpis:food-cost-pct:today  TTL 5min.
     * Miss: [COMP] SUM(menuItem.totalCost × qty) / grossSalesToday → store.
     * Endpoint: GET /api/kpis/food-cost?period=today
     */
    FoodCostKpiDto getLiveFoodCostPct(Long restaurantId);

    /**
     * [DB] 8-week prime cost trend (delegates to PrimeCostService).
     * Not cached — infrequent, manager-level report.
     * Endpoint: GET /api/kpis/prime-cost-trend?weeks=8
     */
    List<PrimeCostTrendPointDto> getPrimeCostTrend(Long restaurantId, int weeks);

    /** Event listener — triggered by SessionClosed, OrderClosed, InvoicePosted.
        Proactively recomputes + re-caches restaurant:{id}:kpis:today. */
    void onDomainEvent(RestaurantDomainEvent event);
}

// ════════════════════════════════════════════════════════════════
// 20. WEEKLY BUDGET SERVICE
// ════════════════════════════════════════════════════════════════
@Service
public class WeeklyBudgetService {
    /** [DB] Create or update budget for a week. */
    WeeklyBudget upsert(Long restaurantId, LocalDate weekStart, UpsertBudgetRequest req);
    /**
     * [DB] Budget for a week.
     * [COMP] All $ amounts derived from totalSalesForecast × respective pct.
     */
    WeeklyBudgetDto get(Long restaurantId, LocalDate weekStart);
    /** [DB] Copy prior week's budget percentages as a starting point. */
    WeeklyBudget copyFromPriorWeek(Long restaurantId, LocalDate weekStart);
    /** [DB] Budget trend — N weeks for comparison. */
    List<WeeklyBudgetDto> listRecent(Long restaurantId, int weeks);
}