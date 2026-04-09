# UI SCREEN INVENTORY
# Restaurant Management Platform — All Subsystems
# Format per screen:
#   SCREEN ID | Screen Name | Type | Primary Data | Services Consumed | User Actions → Service Method
# ============================================================

# ─────────────────────────────────────────────────────────────
# ██  SS0 — SHELL / GLOBAL
# ─────────────────────────────────────────────────────────────

## SS0.1 — Login / Auth
Type: Full page
Data displayed: None
Services: AuthService (external / Spring Security)
Actions:
  - Submit credentials → AuthService.login()
  - Forgot password → AuthService.resetPassword()

## SS0.2 — Dashboard (Main Hub)
Type: Full page — live, auto-refreshes every 60s
Data displayed:
  - Gross Sales Today (live)
  - Covers Today (live)
  - Check Average Today (live)
  - Food Cost % Today (live)
  - Open Sessions Now (live)
  - Top Seller Today
  - Low Stock Alert count badge
  - Pending Invoice count badge
  - 8-week Prime Cost Trend sparkline
Services:
  - KpiService.getTodayKpis()                → grossSalesToday, coversToday, checkAvgToday, openSessionsNow, topSellerToday
  - KpiService.getLiveFoodCostPct()           → foodCostPctToday
  - IngredientService.getLowStockAlerts()     → lowStockCount (badge only)
  - PurchaseInvoiceService.list(status=DRAFT) → draftInvoiceCount (badge only)
  - KpiService.getPrimeCostTrend(weeks=8)     → sparkline data
Actions:
  - Click any KPI card → navigate to relevant detail screen
  - Click low stock badge → navigate to SS1.8
  - Click invoice badge → navigate to SS2.1

## SS0.3 — Global Search
Type: Slide-over (480px right)
Data displayed: Live search results across Ingredient, MenuItem, Supplier, BatchRecipe
Services:
  - IngredientService.search(fragment)
  - MenuItemCostService (via cost group list, no dedicated search yet)
  - SupplierService.search(fragment)
  - BatchRecipeService (name search via listActive filtered)
Actions:
  - Type → debounced search across all services
  - Click result → navigate to relevant detail screen

## SS0.4 — Notifications Panel
Type: Slide-over (480px right)
Data displayed:
  - Low stock alerts (ingredient name, current vs par level)
  - DRAFT invoices older than 3 days
  - Menu engineering periods in DRAFT not yet run
  - Open sessions > 3 hours old
Services:
  - IngredientService.getLowStockAlerts()
  - PurchaseInvoiceService.list(status=DRAFT)
  - MenuEngineeringService.listPeriods() filtered by DRAFT
  - TableSessionService.list() filtered by OPEN + duration > 3hr
Actions:
  - Click notification → navigate to relevant screen
  - Dismiss → marks notification read (local state only)

## SS0.5 — Settings
Type: Full page, tabbed
Tabs: Restaurant Profile | Table Layout | Cost Groups | Supplier List | User Management
Services: RestaurantService, DiningTableService, MenuCostGroupService, SupplierService
Actions per tab: See respective subsystem screens


# ─────────────────────────────────────────────────────────────
# ██  SS1 — INVENTORY MANAGEMENT
# Hub screen → 4 child sections
# ─────────────────────────────────────────────────────────────

## SS1.0 — Inventory Hub
Type: Hub (4 nav cards + 3 KPI stat cards)
KPI cards:
  - Total Food Inventory Value (latest FINALISED FOOD period)
  - Total Bar Inventory Value (latest FINALISED BAR period)
  - Items Below Par Level (count)
Services:
  - InventoryService.getLatest(FOOD)       → foodInventoryValue
  - InventoryService.getLatest(BAR)        → barInventoryValue
  - IngredientService.getLowStockAlerts()  → belowParCount
Actions:
  - Click "Ingredient Master" card → SS1.1
  - Click "Count Entry" card → SS1.4
  - Click "Period History" card → SS1.6
  - Click "Low Stock Alerts" card → SS1.8

## SS1.1 — Ingredient Master List
Type: Full page — searchable, filterable table
Columns: Item Code | Description | Category | Purchase Unit | Price | Recipe Unit | RU/PU | Yield% | Inventory Unit | Par Level | Status
Filters: InventoryType (FOOD/BAR) | Category | Active/Inactive
Services:
  - IngredientService.list(restaurantId, type, category)  → ingredient rows
  - IngredientService.getCosts(ingredientId)              → ruCost, iuCost per row (Redis-backed)
Actions:
  - Search box → IngredientService.search(fragment)
  - Click row → navigate to SS1.2 (ingredient detail)
  - "+ New Ingredient" button → open SS1.3 (create form, slide-over)
  - Toggle active filter → IngredientService.list() with filter
  - Export button → download CSV of current filtered list

## SS1.2 — Ingredient Detail
Type: Full page
Sections:
  - Header: description, itemCode, category, inventoryType, active toggle
  - Purchase Unit section: purchaseUnit, casePackSize, purchaseUnitPrice
  - Recipe Unit section: recipeUnit, ruPerPu, yieldPct → shows computed ruCost
  - Inventory Unit section: inventoryUnit, iuPerPu → shows computed iuCost
  - Density section (optional): packedBy, ozWeightPerCup
  - Par Level: parLevel field
  - Image: upload area + current image preview
  - Used In: list of BatchRecipes and MenuItems that use this ingredient
Services:
  - IngredientService.getById()       → all fields
  - IngredientService.getCosts()      → ruCost, iuCost (Redis, shown as computed)
  - BatchRecipeService.listActive()   → filtered to show which recipes use this ingredient
Actions:
  - Edit any field → IngredientService.update()
  - Upload image → IngredientService.uploadImage()
  - Deactivate → IngredientService.deactivate() (blocked if used in recipes, shows warning)
  - Click recipe in "Used In" list → navigate to SS3.2

## SS1.3 — New Ingredient Form (Slide-over 480px)
Type: Slide-over
Fields: description, category (dropdown enum), inventoryType (toggle FOOD/BAR),
        purchaseUnit (dropdown enum), casePackSize (text), purchaseUnitPrice,
        recipeUnit (dropdown enum), ruPerPu, yieldPct,
        inventoryUnit (dropdown enum), iuPerPu,
        packedBy (toggle, optional), ozWeightPerCup (optional),
        parLevel (optional)
Live preview: shows computed ruCost and iuCost as user types
Services:
  - UnitConversionService.calculateIngredientCosts()  → live ruCost/iuCost preview
  - IngredientService.create()                        → on save
Actions:
  - Save → IngredientService.create()
  - Cancel → dismiss slide-over

## SS1.4 — Inventory Count Entry
Type: Full page — inline editable table, paginated by category
Header: Period date (read-only), InventoryType toggle (FOOD/BAR), Status badge
Table columns: Item Code | Description | Category | Count (editable) | IU | Computed Extension
Category subtotals row at end of each category group
Grand total row at bottom
Services:
  - InventoryService.getCurrentPeriod()         → period header + status
  - InventoryService.getPeriodDetail()          → all line items with computed extensions
  - IngredientService.getCosts()                → iuCost per line (Redis-backed)
  - InventoryService.updateCount()              → on blur of each count field
  - InventoryService.batchUpdateCounts()        → on "Save All" button
Actions:
  - Edit count field → InventoryService.updateCount() on blur
  - "Save All" → InventoryService.batchUpdateCounts()
  - "Finalise Period" button → InventoryService.finalisePeriod() (shows confirmation modal)
  - "New Period" button (if no OPEN period) → InventoryService.openPeriod()
  - Filter by category → client-side filter on loaded data

## SS1.5 — Period Detail (read-only view of a finalised period)
Type: Full page
Header: period date, type, finalised at, total value
Table: same columns as SS1.4 but read-only
Category breakdown summary panel (right sidebar or below table)
Services:
  - InventoryService.getPeriodDetail()   → all fields + computed extensions + category breakdown
Actions:
  - Export to CSV/PDF
  - "Compare with Previous" → opens SS1.7

## SS1.6 — Period History List
Type: Full page — table
Columns: Period Date | Type | Status | Total Value | Finalised At | Actions
Services:
  - InventoryService.listPeriods(type)   → all periods for FOOD or BAR
Actions:
  - Toggle FOOD/BAR → reload with different type
  - Click row → navigate to SS1.5
  - "New Period" → InventoryService.openPeriod()

## SS1.7 — Period Comparison
Type: Full page — side-by-side or delta view
Shows: per-ingredient count delta, value delta; per-category delta; total value delta
Services:
  - InventoryService.comparePeriods(periodId1, periodId2)   → delta data
Actions:
  - Period selectors (date pickers) → reload comparison
  - Export delta report

## SS1.8 — Low Stock Alerts
Type: Full page — table
Columns: Item Code | Description | Category | Par Level | Current Count | Shortage | Last Period Date
Services:
  - IngredientService.getLowStockAlerts()   → all below-par items
Actions:
  - Click item → navigate to SS1.2 (ingredient detail)
  - Click "Update Par Level" → inline edit → IngredientService.update()


# ─────────────────────────────────────────────────────────────
# ██  SS2 — PURCHASING & INVOICE MANAGEMENT
# ─────────────────────────────────────────────────────────────

## SS2.0 — Purchasing Hub
Type: Hub (4 nav cards + 3 KPI stat cards)
KPI cards:
  - Total Purchases This Week ($)
  - Largest Supplier This Week (name + $)
  - Pending Drafts (count)
Services:
  - PurchaseInvoiceService.getWeeklySummary(weekStart=thisWeek)  → totalPurchases, supplierBreakdown
  - PurchaseInvoiceService.list(status=DRAFT)                    → draftCount
Actions:
  - Click "Invoice Log" → SS2.1
  - Click "New Invoice" → SS2.2
  - Click "Supplier Directory" → SS2.6
  - Click "Reports" → SS2.4

## SS2.1 — Invoice Log
Type: Full page — filterable, sortable table
Columns: Invoice # | Supplier | Date | Total Amount | Food | Bev | Other | Status | Proof
Proof column: green "✓" when 0, red "✗ $x.xx" when non-zero
Filters: date range | supplier | status (DRAFT/POSTED/VOID)
Services:
  - PurchaseInvoiceService.list(from, to, supplierId)       → invoice rows
  - PurchaseInvoiceService.getDetail(invoiceId)             → proof per row (computed)
Actions:
  - Click row → navigate to SS2.2 (invoice entry, or read-only if POSTED)
  - "+ New Invoice" → navigate to SS2.2 in create mode
  - Filter controls → reload list
  - "Post" action on DRAFT row → PurchaseInvoiceService.post()
  - "Void" action on POSTED row → PurchaseInvoiceService.voidInvoice()

## SS2.2 — Invoice Entry / Detail
Type: Full page
Header section (editable if DRAFT):
  Supplier (autocomplete) | Invoice Date | Invoice Number | Invoice Amount (CM total)
Category lines table (editable if DRAFT):
  Category | Amount | % of Total (computed)
Footer:
  Proof = Invoice Amount − Sum of Lines  (green if 0, red + pulsing if not)
  Status badge
Services:
  - SupplierService.search()                          → autocomplete
  - PurchaseInvoiceService.createDraft()              → on first save
  - PurchaseInvoiceService.upsertLine(category, amt)  → on each category line change
  - PurchaseInvoiceService.removeLine()               → on line delete
  - PurchaseInvoiceService.post()                     → "Post Invoice" button
  - PurchaseInvoiceService.voidInvoice()              → "Void" button (POSTED only)
Actions:
  - Change supplier field → SupplierService.search() autocomplete
  - Change invoice amount → recalculate proof display
  - Add/edit category line → PurchaseInvoiceService.upsertLine()
  - Remove category line → PurchaseInvoiceService.removeLine()
  - "Save Draft" → PurchaseInvoiceService.createDraft() or auto-save on change
  - "Post Invoice" (blocked if proof ≠ 0) → PurchaseInvoiceService.post()
  - "+ Add Supplier" link mid-flow → opens SS2.6 create slide-over, returns supplier

## SS2.3 — Weekly Purchase Summary
Type: Full page
Date range selector (defaults to current week Mon–Sun)
KPI cards: Total Food | Total Beverage | Total Other | Grand Total
Category breakdown table: Category | $ Amount | % of Total
Supplier breakdown table: Supplier | $ Amount | Invoice Count
Services:
  - PurchaseInvoiceService.getWeeklySummary(weekStart)      → category totals (Redis)
  - PurchaseInvoiceService.getSpendBySupplier(from, to)     → supplier breakdown
Actions:
  - Change week selector → reload both summaries
  - Click supplier row → filter SS2.1 by that supplier

## SS2.4 — Purchase Trend Chart
Type: Full page
Line chart: N weeks of total purchases by category
Category filter toggles (Food / Bev / Other / All)
Services:
  - PurchaseInvoiceService.getCategoryTrend(category, weeks=8)   → trend data points
Actions:
  - Toggle category → reload chart series
  - Change weeks (slider: 4/8/12/26) → reload

## SS2.5 — Proof / Variance Alerts
Type: Full page — table of invoices where proof ≠ 0
Columns: Invoice # | Supplier | Date | Invoice Amount | Sum of Lines | Variance
Services:
  - PurchaseInvoiceService.list(status=DRAFT)           → filter to those with proof ≠ 0
  - PurchaseInvoiceService.getDetail(invoiceId)         → proof per invoice
Actions:
  - Click invoice → navigate to SS2.2 to fix

## SS2.6 — Supplier Directory
Type: Full page — table
Columns: Name | Contact | Phone | Email | Account # | Active
Services:
  - SupplierService.listAll()
Actions:
  - Click row → inline expand or slide-over edit
  - "+ New Supplier" → slide-over create form → SupplierService.create()
  - Deactivate → SupplierService.deactivate()
  - Edit → SupplierService.update()


# ─────────────────────────────────────────────────────────────
# ██  SS3 — RECIPE & MENU COSTING
# ─────────────────────────────────────────────────────────────

## SS3.0 — Recipe & Menu Costing Hub
Type: Hub (4 nav cards + 3 KPI stat cards)
KPI cards:
  - Avg Food Cost % across all active menu items
  - Recipe Coverage % (items with a full cost card / total items)
  - Theoretical GP (sum of grossProfit × expected volume)
Services:
  - MenuItemCostService.getCostGroupSummary() for all groups  → avgFoodCostPct, coverage
  - KpiService.getLiveFoodCostPct()                           → theoretical GP approximation
Actions:
  - Click "Recipe Management" → SS3.1
  - Click "Menu Item Costing" → SS3.4
  - Click "Build Charts" → SS3.7
  - Click "Operations Manuals" → SS3.9

## SS3.1 — Batch Recipe List
Type: Full page — card grid or table
Columns/Cards: Name | Station | Shelf Life | Yield | Cost/Yield Unit | Active
Services:
  - BatchRecipeService.listActive()          → recipe summaries
  - BatchRecipeService.getCost(recipeId)     → costPerYieldUnit per card (Redis)
Actions:
  - Click card/row → SS3.2 (recipe detail)
  - "+ New Recipe" → opens SS3.3 (recipe editor, full page wizard)
  - Filter by station (dropdown) → client-side filter
  - Deactivate → BatchRecipeService.deactivate()

## SS3.2 — Batch Recipe Detail (read mode)
Type: Full page
Header: name, station, shelf life, tools, position notes, yield qty + unit
Ingredient lines table: Line# | Description | Qty (RU) | RU Unit | RU Cost | Extension
Running total cost (bottom of table)
Procedure steps section: numbered list
Cost summary panel: Total Batch Cost | Cost per Yield Unit
Services:
  - BatchRecipeService.getDetail()     → header + lines + steps (lines have live costs)
  - BatchRecipeService.getCost()       → Redis-backed cost summary panel
Actions:
  - "Edit Recipe" → switch to SS3.3 (edit mode)
  - "Scale Recipe" → opens scale calculator modal → BatchRecipeService.scaleRecipe()
  - "Print" → print-friendly view

## SS3.3 — Batch Recipe Editor (Create / Edit — 4-step wizard)
Type: Full page, step progress indicator at top

  Step 1 — Details
  Fields: name, station (dropdown KitchenStationType), shelfLife (dropdown), 
          toolsEquipment (textarea), positionNotes (textarea)

  Step 2 — Ingredients
  Inline editable table:
    Line# | Ingredient (autocomplete) | Qty (RU) | RU Unit (auto from ingredient) | RU Cost (auto) | Extension (auto)
  Running total cost updates live
  "+ Add Ingredient" row at bottom
  Services per interaction:
    - IngredientService.search()                      → autocomplete
    - IngredientService.getCosts()                    → ruCost auto-populate (Redis)
    - BatchRecipeService.addIngredientLine()           → on confirm add
    - BatchRecipeService.updateIngredientLine()        → on qty change
    - BatchRecipeService.removeIngredientLine()        → on delete row
    - BatchRecipeService.reorderIngredientLines()      → drag-to-reorder

  Step 3 — Yield
  Fields: yieldQuantity (number), yieldUnit (dropdown RecipeUnit)
  Computed display: Cost per Yield Unit = totalCost / yieldQuantity
  Services:
    - BatchRecipeService.updateHeader() for yield fields

  Step 4 — Procedure
  Drag-reorderable numbered list of instruction steps
  Services:
    - BatchRecipeService.addStep()
    - BatchRecipeService.updateStep()
    - BatchRecipeService.removeStep()
    - BatchRecipeService.reorderSteps()

Actions global to wizard:
  - "Next" / "Back" → step navigation
  - "Save Draft" (any step) → saves current step data
  - "Cancel" → shows exit guard modal (Save Draft / Discard)
  - Final "Save & Close" → BatchRecipeService.updateHeader() + navigate to SS3.2

## SS3.4 — Cost Group List (Menu Item Costing hub)
Type: Full page — list of cost groups, each expandable
Each group shows: name, item count, avg food cost %
Services:
  - MenuCostGroupService.listAll()                          → groups
  - MenuItemCostService.getCostGroupSummary(costGroupId)    → per-group summary (Redis)
Actions:
  - Click group → expand to show item list (SS3.5 inline)
  - "+ New Cost Group" → MenuCostGroupService.create() (inline name input)
  - Reorder groups → MenuCostGroupService.reorder()
  - Click "Initialize New Cost Group" (primary CTA) → same as above

## SS3.5 — Menu Item List (within a Cost Group)
Type: Expandable within SS3.4, or full page
Columns: Name | Menu Price | Total Cost | Food Cost % | Gross Profit | PLU | Image | Actions
FC% colored: green <28%, amber 28–35%, red >35%
Services:
  - MenuItemCostService.getCostGroupSummary(costGroupId)    → all items with costs (Redis)
Actions:
  - Click row → navigate to SS3.6 (menu item cost card)
  - "+ New Item" → open SS3.6 in create mode
  - Deactivate → MenuItemCostService.deactivate()

## SS3.6 — Menu Item Cost Card (Detail / Edit)
Type: Full page
Header: name, menuPrice, plateCost, targetFoodCostPct, pluNumber, image upload
Ingredient lines table (same structure as recipe editor):
  Line# | Source (Ingredient or Batch Recipe) | Qty (RU) | RU Cost | Extension
Cost summary panel:
  Total Ingredient Cost | Plate Cost | Total Cost | Menu Price | GP$ | FC% | Target Price
Target Price Calculator: enter desired FC% → shows target price
Services:
  - MenuItemCostService.getDetail()                         → header + lines + computed costs
  - MenuItemCostService.getCost()                           → cost summary (Redis)
  - IngredientService.search()                              → autocomplete for ingredient lines
  - BatchRecipeService.listActive()                         → picker for batch recipe lines
  - BatchRecipeService.getCost()                            → ruCost for batch recipe lines (Redis)
  - MenuItemCostService.addCostingLine()
  - MenuItemCostService.updateCostingLine()
  - MenuItemCostService.removeCostingLine()
  - MenuItemCostService.updateHeader()                      → on price/name change
  - MenuItemCostService.calculateTargetPrice()              → target price calculator
  - MenuItemCostService.uploadImage()                       → image upload
Actions:
  - Edit menu price → MenuItemCostService.updateHeader() → cost summary refreshes
  - Edit any line → MenuItemCostService.updateCostingLine()
  - Add line → ingredient/recipe picker slide-over → MenuItemCostService.addCostingLine()
  - Delete line → MenuItemCostService.removeCostingLine()
  - Drag to reorder → MenuItemCostService.reorderCostingLines()
  - Enter target FC% → MenuItemCostService.calculateTargetPrice() (no persist)
  - Upload image → MenuItemCostService.uploadImage()
  - "Move to Group" → MenuItemCostService.moveToCostGroup()

## SS3.7 — Build Chart List
Type: Full page — table, filterable by station
Columns: Menu Item | Station | Plating Spec | Line Count | Last Updated
Services:
  - BuildChartService.getByStation()    → charts per station
Actions:
  - Filter by station → BuildChartService.getByStation(station)
  - Click row → SS3.8 (build chart editor)
  - "Print All for Station" → print-friendly all cards for that station

## SS3.8 — Build Chart Editor
Type: Full page
Header: menu item name (read-only link to SS3.6), station, plating spec
Lines table (drag-reorderable):
  Line# | Label | Ingredient (optional link) | Portion Qty | Portion Unit | Serving Utensil | Cross-Station Note
Services:
  - BuildChartService.getByMenuItem()       → chart + lines
  - IngredientService.search()              → autocomplete for ingredient link
  - BuildChartService.updateHeader()
  - BuildChartService.addLine()
  - BuildChartService.updateLine()
  - BuildChartService.removeLine()
  - BuildChartService.reorderLines()
Actions:
  - Edit any field → respective BuildChartService method
  - Drag to reorder → BuildChartService.reorderLines()
  - "Print Card" → print-friendly single card view → SS3.8-print
  - "+ Add Line" → new row appended

## SS3.8-print — Build Chart Print View
Type: Print-optimized page (no nav, large font)
Displays: station, menu item name, plating spec, all lines formatted as a card
Services: BuildChartService.getByMenuItem()
Actions: Browser print

## SS3.9 — Operations Manual List
Type: Full page, grouped by station
Each section: station header, entries list (drag-reorderable within station)
Services:
  - OperationsManualService.list()       → all entries grouped
Actions:
  - Click entry → SS3.10 (entry editor)
  - "+ New Entry" → OperationsManualService.create() via slide-over
  - Drag to reorder within station → OperationsManualService.reorder()
  - "Print All Manuals" → OperationsManualService.buildPrintManual() → browser print

## SS3.10 — Operations Manual Entry Editor
Type: Full page or slide-over (480px) depending on content length
Fields: title, station (dropdown), displayOrder
Toggle: "Link to Recipe" / "Free-form content"
  If linked: BatchRecipe picker → shows recipe steps read-only below
  If free-form: rich text content area
Services:
  - BatchRecipeService.listActive()          → recipe picker
  - OperationsManualService.getDetail()      → entry + linked recipe steps
  - OperationsManualService.update()         → on save
Actions:
  - Toggle link mode → switch between recipe display and content editor
  - Save → OperationsManualService.update()
  - Delete → OperationsManualService.delete()

## SS3.11 — Unit Conversion Calculator
Type: Slide-over (480px right) or modal
Two modes toggled:
  Mode A — Unit Converter: From unit | quantity → To unit → result (live)
  Mode B — Ingredient Cost Calculator: purchaseUnit, packedBy, price, totalOz or totalFlOz, ozWeightPerCup → costPerFlOz, costPerWtOz
Services:
  - UnitConversionService.convert()                        → Mode A live result
  - UnitConversionService.calculateIngredientCosts()       → Mode B result
Actions:
  - All inputs → live compute, no save needed
  - "Copy Result" → clipboard


# ─────────────────────────────────────────────────────────────
# ██  SS4 — MENU ENGINEERING
# ─────────────────────────────────────────────────────────────

## SS4.0 — Menu Engineering Hub
Type: Hub (4 nav cards + 4 KPI stat cards)
KPI cards:
  - Winners count (latest FINALISED period)
  - Workhorses count
  - Opportunities count
  - Losers count
Services:
  - MenuEngineeringService.listPeriods()          → latest FINALISED period id
  - MenuEngineeringService.getSummary(periodId)   → classification counts (Redis)
Actions:
  - Click "Run New Analysis" → SS4.1 (period setup)
  - Click "Period History" → SS4.6
  - Click "Live Sales Counter" → SS4.7
  - Click "What-If Simulator" → SS4.8

## SS4.1 — Period Setup (Create Analysis Run)
Type: Full page or wide modal
Fields: periodBeginDate, periodEndDate, costGroup (nullable = all groups), popularityFactor (default 0.80)
Preview panel: shows how many OrderLines exist for the chosen date range
Services:
  - MenuEngineeringService.createPeriod()     → on "Run Analysis" click
  - MenuEngineeringService.runAnalysis()      → immediately after createPeriod()
  - OrderService / OrderLine count (preview)  → quick count query
Actions:
  - Set date range → preview panel updates
  - Set cost group (optional)
  - Adjust popularity factor slider
  - "Run Analysis" → createPeriod() + runAnalysis() → navigate to SS4.2

## SS4.2 — Results Table (one period)
Type: Full page — sortable table
Columns: PLU | Item Name | # Sold | Sell Price | Item Cost | GP$ | Sales Mix% | FC% | Classification badge
Classification badge: WINNER=green | WORKHORSE=blue | OPPORTUNITY=amber | LOSER=red
Sort: by any column
Filter: by classification
Services:
  - MenuEngineeringService.getResults(periodId)    → full result set (Redis)
Actions:
  - Sort/filter → client-side on loaded data
  - Click row → SS4.3 (item drilldown)
  - "Quadrant Matrix" button → SS4.4
  - "Compare Periods" button → SS4.9
  - "Re-run Analysis" → MenuEngineeringService.reRunAnalysis()
  - Export to CSV

## SS4.3 — Item Drilldown
Type: Slide-over (480px right)
Shows: all MenuEngineeringResult fields for one item, plus:
  - Sales trend sparkline (qty sold per day in the period)
  - Link to menu item cost card (SS3.6)
  - Classification reasoning: "GP $X vs avg $Y → HIGH; Mix X% vs threshold Y% → LOW"
Services:
  - MenuEngineeringService.getResults()      → single item from cached results
  - OrderService/OrderLine daily counts      → sparkline data (DB query)
Actions:
  - "Go to Cost Card" → navigate to SS3.6
  - "Apply Price Change" → update menuPrice in MenuItemCostService.updateHeader(), 
                           then re-run what-if (or prompt to re-run full analysis)

## SS4.4 — Quadrant Matrix (2×2 visual)
Type: Full page — scatter plot (GP$ on Y axis, Sales Mix% on X axis)
Each dot = one menu item, colored by classification
Crosshair lines at weightedAvgGP and popularityThreshold
Hover on dot → shows item name, GP$, Mix%
Services:
  - MenuEngineeringService.getResults(periodId)    → coordinates + classification (Redis)
Actions:
  - Hover dot → tooltip
  - Click dot → open SS4.3 (item drilldown) as slide-over

## SS4.5 — Category Summary
Type: Full page — table, one row per cost group
Columns: Cost Group | Item Count | Avg FC% | Total Revenue | Total Profit | Winner/Workhorse/Opportunity/Loser counts
Services:
  - MenuEngineeringService.getSummary(periodId)    → category-level aggregation (Redis)
Actions:
  - Click row → filter SS4.2 results to that cost group

## SS4.6 — Period History / Comparison
Type: Full page — list of all periods, with comparison selector
Period list: Period dates | Cost Group | Popularity Factor | Status | Item Count | Total Revenue
Comparison: select any 2 FINALISED periods → side-by-side delta view
Services:
  - MenuEngineeringService.listPeriods()                        → all periods
  - MenuEngineeringService.comparePeriods(periodId1, periodId2) → delta view data
Actions:
  - Select 2 periods → MenuEngineeringService.comparePeriods()
  - Click single period → navigate to SS4.2

## SS4.7 — Live Sales Counter (real-time)
Type: Full page — live table, auto-refreshes every 5 min
Columns: Menu Item | Cost Group | Qty Sold Today | Revenue Today | Running FC%
Sorted by qty sold desc
Services:
  - MenuEngineeringService.getLiveSalesCounts(costGroupId)   → live counts (Redis, 5min TTL)
  - KpiService.getLiveFoodCostPct()                          → running FC% header KPI
Actions:
  - Cost group filter → reload for that group
  - Manual refresh button

## SS4.8 — What-If Simulator
Type: Full page (based on a FINALISED period)
Left panel: table of items with editable Sell Price column
Right panel: updated quadrant matrix + classification changes highlighted
Shows: per-item before/after classification, overall FC% impact
Services:
  - MenuEngineeringService.getResults(periodId)           → base data (Redis)
  - MenuEngineeringService.simulateWhatIf(periodId, overrides)  → transient result
Actions:
  - Edit sell price on any row → simulateWhatIf() called with debounce
  - "Apply Changes" → MenuItemCostService.updateHeader() for each changed item
  - "Reset" → reload original prices

## SS4.9 — Period Comparison (2-up)
Type: Full page — two columns, one per period
Shows per item: classification Period 1 | classification Period 2 | change arrow
Summary: items that moved classification + aggregate metric deltas
Services:
  - MenuEngineeringService.comparePeriods(periodId1, periodId2)  → comparison data
Actions:
  - Change period selectors → reload comparison
  - Click item row → open SS4.3 for that item


# ─────────────────────────────────────────────────────────────
# ██  SS5 — POS / FLOOR OPERATIONS
# ─────────────────────────────────────────────────────────────

## SS5.0 — Floor Map (Live)
Type: Full page — live, event-driven (no polling needed)
Shows: all dining tables, color-coded by status:
  GREEN  = AVAILABLE
  AMBER  = OPEN < 1 hr
  RED    = OPEN > 1 hr (long session)
  GREY   = INACTIVE
Each occupied table shows: table number, guest count, session duration, order count
Services:
  - DiningTableService.getFloorStatus()         → all tables + live session state (Redis)
Actions:
  - Click AVAILABLE table → opens SS5.1 (open session modal)
  - Click OPEN table → opens SS5.2 (session detail)
  - "Refresh" button (for non-websocket fallback)

## SS5.1 — Open Session (Modal)
Type: Modal (400px centered)
Fields: table (pre-selected from floor map), guestCount
Services:
  - TableSessionService.open(tableId, guestCount)
Actions:
  - Submit → TableSessionService.open() → close modal, floor map updates

## SS5.2 — Session Detail / Order Screen
Type: Full page (or large slide-over)
Header: table number, guest count (editable), session duration, session total
Orders list: each order shows status + line items
Current open order: menu item list with quantities
Cost group tabs to browse menu items
Add item: item picker (searchable by PLU or name)
Services:
  - TableSessionService.getDetail()      → session + all orders + lines
  - OrderService.createOrder()           → open new order for this session
  - MenuCostGroupService.listAll()       → cost group tabs
  - MenuItemCostService.getCostGroupSummary()  → items per tab for picker
  - OrderService.addLine()               → add item to open order
  - OrderService.updateLineQuantity()    → change qty
  - OrderService.voidLine()              → void one line
  - OrderService.compLine()              → comp one line
  - OrderService.fireOrder()             → fire to kitchen
  - OrderService.closeOrder()            → close order
  - TableSessionService.close()          → close session (all orders must be CLOSED)
  - TableSessionService.updateGuestCount() → if guest count changes
Actions:
  - Select cost group tab → load items for that group
  - Search item (by name or PLU) → filter item list
  - Click item → OrderService.addLine(quantity=1)
  - +/- on line → OrderService.updateLineQuantity()
  - Void line → OrderService.voidLine()
  - Comp line → OrderService.compLine()
  - "Fire" → OrderService.fireOrder()
  - "Close Order" → OrderService.closeOrder()
  - "Close Session" → TableSessionService.close()
  - "Update Guest Count" → TableSessionService.updateGuestCount()

## SS5.3 — Session History
Type: Full page — table
Columns: Table | Date/Time Opened | Closed | Duration | Guest Count | Session Total | Check Avg | Status
Date range filter
Services:
  - TableSessionService.list(from, to)    → all sessions in range
Actions:
  - Click row → TableSessionService.getDetail() → read-only session view
  - Date range filter → reload

## SS5.4 — Guest Count Heatmap
Type: Full page
Toggle: "Live (from POS)" / "Manual Entry"
Grid: time slots (rows) × days (Mon–Sun) (columns)
Color intensity = guest count
3-week rolling average row at bottom
Services:
  POS mode:
    - TableSessionService.getGuestHeatmap(weekStart)              → current week heatmap (Redis)
    - TableSessionService.getRollingAverageHeatmap(weekStart, 3)  → 3-week avg (Redis)
  Manual mode:
    - GuestCountService.getWeeklyGrid(weekStart)                  → manual entry grid
    - GuestCountService.getRollingAverageHeatmap(weekStart, 3)    → manual 3-week avg (Redis)
Actions:
  POS mode: read-only, week navigator
  Manual mode:
    - Click/edit any cell → GuestCountService.upsertSlot()
    - "Save All" → GuestCountService.batchUpsert()
    - Week navigator

## SS5.5 — KPI Analytics
Type: Full page — tabbed analytics
Tab 1: Today Live
  - grossSalesToday, coversToday, checkAvgToday, openSessionsNow
  - Top sellers today (list)
  - Slow sellers today (list)
Tab 2: Weekly Summary
  - grossSalesWeek, coversWeek, checkAvgWeek
  - Revenue by cost group (bar chart)
  - Table turn times by section
Tab 3: Prime Cost Trend (8 weeks)
  - Line chart: grossSales, totalCOS, totalLabor, primeCost, primeCostPct per week
Services:
  Tab 1:
    - KpiService.getTodayKpis()
    - KpiService.getTopSellers(period=today, limit=10)
    - KpiService.getSlowSellers(period=today, limit=10)
  Tab 2:
    - KpiService.getWeekKpis(weekStart)
    - KpiService.getDailySalesByCategory(date) for each day of week
    - KpiService.getTableTurnTimes()
  Tab 3:
    - KpiService.getPrimeCostTrend(weeks=8)
Actions:
  - Week selector (Tab 2) → reload weekly data
  - Weeks slider (Tab 3) → KpiService.getPrimeCostTrend(weeks)
  - Click cost group in bar chart → filter to SS4.2 for that group


# ─────────────────────────────────────────────────────────────
# ██  SCREEN COUNT SUMMARY
# ─────────────────────────────────────────────────────────────

# SS0 Shell:         5 screens  (Login, Dashboard, Search, Notifications, Settings)
# SS1 Inventory:     9 screens  (Hub, Ingredient List, Detail, New Form, Count Entry, Period Detail, Period History, Comparison, Low Stock)
# SS2 Purchasing:    7 screens  (Hub, Invoice Log, Invoice Entry, Weekly Summary, Trend Chart, Proof Alerts, Supplier Directory)
# SS3 Recipe/Menu:  12 screens  (Hub, Recipe List, Recipe Detail, Recipe Editor, Cost Group List, Item List, Cost Card, Build Chart List, Build Chart Editor, Build Chart Print, Manual List, Manual Editor, Unit Conversion Calculator)
# SS4 Engineering:  10 screens  (Hub, Period Setup, Results Table, Item Drilldown, Quadrant Matrix, Category Summary, Period History, Live Counter, What-If, Comparison)
# SS5 POS/Floor:     6 screens  (Floor Map, Open Session, Session Detail, Session History, Guest Heatmap, KPI Analytics)
#
# TOTAL:            49 primary screens
#                  +  2 modal screens (Open Session, Exit Guard)
#                  +  2 slide-overs reused across subsystems (Global Search, Notifications)
#                  = ~53 distinct UI surfaces