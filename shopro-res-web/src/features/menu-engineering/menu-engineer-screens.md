# Menu Engineering — Screen Architecture

**Source:** `docs/menu-engineering-srs.md`  
**Types:** `types/menuEngineering.types.ts`, `types/enums.types.ts`  
**API:** `api/menuEngineering.api.ts` (placeholder — needs implementation)  
**Hook:** `hooks/useMenuEngineering.ts` (placeholder — needs implementation)

---

## Classification Terminology Mapping

The SRS uses Stars/Puzzles/Plow Horses/Dogs. The backend uses Winner/Workhorse/Opportunity/Loser. UI will use the **SRS-facing labels** with the backend enum values:

| SRS Term      | Backend Enum (`MenuEngClassification`) | Quadrant | Color   | Icon     |
|---------------|---------------------------------------|----------|---------|----------|
| ⭐ Star       | `WINNER`                              | High GP + High Mix | `emerald` | `Star` |
| 🧩 Puzzle    | `OPPORTUNITY`                         | High GP + Low Mix  | `amber`  | `Puzzle` |
| 🐴 Plow Horse| `WORKHORSE`                           | Low GP + High Mix  | `cyan`   | `Tractor` (or `Horse`) |
| 🐶 Dog       | `LOSER`                               | Low GP + Low Mix   | `rose`   | `Dog` |

---

## Screens Overview

```
ME.0  EngineeringHubPage          (/engineering)
ME.1  PeriodSetupPage             (/engineering/new)
ME.2  PeriodDetailPage            (/engineering/periods/:periodId)
ME.3  ResultsTablePage            (/engineering/periods/:periodId)
ME.4  QuadrantMatrixPage          (/engineering/periods/:periodId/quadrant)
ME.5  CategorySummaryPage         (/engineering/periods/:periodId/categories)
ME.6  LiveSalesCounterPage        (/engineering/live)
ME.7  PeriodHistoryPage           (/engineering/history)
ME.8  WhatIfSimulatorPage         (/engineering/periods/:periodId/whatif)
ME.9  PeriodComparisonPage        (/engineering/compare)
ME.10 ItemDrillDownSlideOver      (overlay, not a route)
ME.11 RecommendationPanel          (overlay, not a route)
ME.12 CreateAnalysisModal         (overlay, not a route)
ME.13 ApplyChangesModal           (overlay, not a route)
ME.14 HistoricalDeltaModal        (overlay, not a route)
ME.15 FinalisePeriodModal         (overlay, not a route)
```

---

## Shared Component Reuse Plan

| Screen | Shared Component | Used As |
|--------|-----------------|---------|
| ME.0 | `DefaultLayout` | Hub page shell (KPI strip + nav cards) |
| ME.0 | `KpiCard` (shared/cards) | Summary KPIs (total periods, avg CM, etc.) |
| ME.0 | `NavCard` (shared/cards) | Navigation into sub-screens |
| ME.1 | `SubScreenHeader` | Page header with back button |
| ME.1 | `Card`, `Input`, `Select`, `Button` (ui/) | Setup form |
| ME.1 | `DateRangePicker` (ui/) | Period date range picker |
| ME.1 | `StepRail` (ui/) | Multi-step setup wizard |
| ME.2 | `SubScreenHeader` | Page header |
| ME.2 | `Tabs` (Radix/ui/) | Tab bar: Overview / Matrix / Table / Categories |
| ME.2 | `KpiCard` | Period-level KPIs strip |
| ME.2 | `KpiChartCard` | Category distribution donut rendered as bar chart |
| ME.3 | `SubScreenHeader` | Page header |
| ME.3 | `ResponsiveDataList` | Sortable/searchable/filterable results table |
| ME.3 | `StatusBadge` | Classification badge per item |
| ME.3 | `Badge` (ui/) | High/Low GP & Mix badges |
| ME.4 | `SubScreenHeader` | Page header |
| ME.4 | `KpiChartCard` (reused as scatter via custom) | Quadrant scatter plot |
| ME.4 | `Tooltip` (ui/) | Hover info on quadrant dots |
| ME.5 | `SubScreenHeader` | Page header |
| ME.5 | `ResponsiveDataList` | Category-level summary table |
| ME.5 | `ProgressBar` (ui/) | Visual food cost % bar per category |
| ME.6 | `SubScreenHeader` | Page header |
| ME.6 | `LiveKpiBanner` | Live sales banner strip |
| ME.6 | `ResponsiveDataList` | Real-time running sales table |
| ME.7 | `SubScreenHeader` | Page header |
| ME.7 | `ResponsiveDataList` | Period history list |
| ME.7 | `StatusBadge` | DRAFT / FINALISED badge |
| ME.8 | `SubScreenHeader` | Page header |
| ME.8 | `InlineEdit` (ui/) | Price override cells |
| ME.8 | `KpiChartCard` | Before/after comparison charts |
| ME.9 | `SubScreenHeader` | Page header |
| ME.9 | `Select` (ui/) | Period 1 & Period 2 pickers |
| ME.9 | `ResponsiveDataList` | Side-by-side comparison table |
| ME.10 | `SlideOver` (ui/) | Right-side slide-over panel |
| ME.10 | `KpiCard` | Item-level metric cards |
| ME.10 | `TrendSparkline` | Sales trend mini chart |
| ME.11 | `SlideOver` | Recommendation detail panel |
| ME.11 | `Badge`, `Button` | Priority + action |
| ME.12 | `Modal` (ui/) | Create new analysis dialog |
| ME.12 | `Input`, `Select`, `DateRangePicker` | Form fields |
| ME.13 | `ConfirmModal` (shared/) | Apply What-If changes confirmation |
| ME.14 | `Modal` (ui/) | Classification migration viewer |
| ME.15 | `ConfirmModal` (shared/) | Finalise period with warning |

---

## Screen Details

---

### ME.0 — EngineeringHubPage

**Route:** `/engineering`  
**Data:** `useMenuEngineering().usePeriods()` → `MenuEngineeringPeriod[]`  
**Layout:** `DefaultLayout` (title, subtitle, icon, kpiCards, navCards)

#### KPI Strip (top)
4 × `KpiCard` in a row:

| # | Title | Value Source | Icon | Delta |
|---|-------|-------------|------|-------|
| 1 | Total Analyses | `periods.length` | `BarChart3` | — |
| 2 | Avg CM | latest completed period's `weightedAvgGrossProfit` | `DollarSign` | ↑/↓ vs previous |
| 3 | Stars | latest's `winnerCount` | `Star` | — |
| 4 | Food Cost % | latest's `totalCost / totalRevenue * 100` | `UtensilsCrossed` | ↑/↓ vs threshold |

#### Nav Cards (grid)
6 × `NavCard`:

| # | Title | Description | Icon | Badge | On Click |
|---|-------|-------------|------|-------|----------|
| 1 | New Analysis | Start a fresh analysis cycle | `PlusCircle` | — | → navigates to `ME.1 PeriodSetupPage` (`/engineering/new`) |
| 2 | Latest Results | View most recent analysis | `BarChart3` | period status | → if no completed period: `StubPage`; else navigates to `ME.2 PeriodDetailPage` with latest `periodId` (`/engineering/periods/:id`) |
| 3 | Live Sales | Real-time running food cost tracker | `Activity` | "LIVE" (green) | → navigates to `ME.6 LiveSalesCounterPage` (`/engineering/live`) |
| 4 | Period History | Browse all past periods | `Clock` | count | → navigates to `ME.7 PeriodHistoryPage` (`/engineering/history`) |
| 5 | Compare Periods | Side-by-side classification migration | `GitCompare` | — | → navigates to `ME.9 PeriodComparisonPage` (`/engineering/compare`) |
| 6 | What-If Simulator | Simulate price changes & see impact | `FlaskConical` | — | → navigates to `ME.8 WhatIfSimulatorPage` (requires latest periodId) |

#### Recent Periods List (bottom section, children of DefaultLayout)
`ResponsiveDataList<MenuEngineeringPeriod>` showing the 5 most recent periods.

**Columns:**
| Header | Accessor | Cell |
|--------|----------|------|
| Period | `periodBeginDate` – `periodEndDate` | formatted date range |
| Cost Group | `costGroupName` | text or "All" |
| Items | `itemCount` | number |
| ⭐ Stars | `winnerCount` | emerald badge |
| 🧩 Puzzles | `opportunityCount` | amber badge |
| 🐴 Plow Horses | `workhorseCount` | cyan badge |
| 🐶 Dogs | `loserCount` | rose badge |
| Status | `status` | `StatusBadge` (DRAFT=default, FINALISED=success) |

**Row Click:** → navigates to `ME.2 PeriodDetailPage` (`/engineering/periods/:periodId`)

**Create Button (top-right of DefaultLayout):** label = "New Analysis" → navigates to `ME.1 PeriodSetupPage` (`/engineering/new`)

---

### ME.1 — PeriodSetupPage

**Route:** `/engineering/new`  
**Data:** Creates `MenuEngineeringPeriod` via `POST /api/v1/restaurants/{id}/menu-engineering/analyses`  
**Layout:** `SubScreenHeader` (title: "New Analysis", icon: `PlusCircle`, onBack → ME.0)

#### Steps (`StepRail`, 3 steps)

**Step 1: Define Period**
| Field | Component | Type | Validation | Source |
|-------|-----------|------|------------|--------|
| Cost Group | `Select` | optional, "All Groups" default | — | from `useCostGroups()` |
| Start Date | `DateRangePicker` start | required | ≥ 7 days before end date | user input |
| End Date | `DateRangePicker` end | required | ≤ 12 months after start | user input |
| Popularity Factor | `Input` (number) | default 0.80 | 0.5–1.0 | `CreatePeriodRequest.popularityFactor` |

**Step 2: Configure**
| Field | Component | Type | Validation |
|-------|-----------|------|------------|
| Auto-exclude voids | `Switch` | default ON | — |
| Auto-exclude comps | `Switch` | default ON | — |
| Auto-exclude refunds | `Switch` | default ON | — |
| Food cost alert threshold % | `Input` (number) | default 40 | 10–80 |

**Step 3: Review & Run**
| Field | Component | Type |
|-------|-----------|------|
| Summary card | `Card` | read-only summary of steps 1–2 |
| Run Analysis | `Button` (primary) | triggers API POST |

**Button: "Run Analysis" on Click:**
1. Calls `createPeriod({ restaurantId, costGroupId, periodBeginDate, periodEndDate, popularityFactor })`
2. On success: calls `runAnalysis(periodId)` to transition status DRAFT → processing
3. Navigates to `ME.2 PeriodDetailPage` with the new `periodId`

**Button: "Cancel" on Click:** → `useAppStore().back()` → returns to ME.0

---

### ME.2 — PeriodDetailPage

**Route:** `/engineering/periods/:periodId`  
**Data:** `useMenuEngineering().usePeriodDetail(periodId)` → `MenuEngineeringPeriod` + `PeriodSummaryDto`  
**Layout:** `SubScreenHeader` (title: "Analysis: {date range}", icon: `BarChart3`, onBack → ME.0)

This is the **master detail page** with tabs. Contains a `Tabs` component with 4 panels.

#### Period Header Bar (above tabs)
`KpiCard` strip — 4 cards:

| # | Title | Value | Delta |
|---|-------|-------|-------|
| 1 | Total Revenue | `periodSummary.totalRevenue` | formatted $ |
| 2 | Avg CM | `periodSummary.weightedAvgGrossProfit` | — |
| 3 | Food Cost % | `totalCost / totalRevenue * 100` | ↑/↓ vs threshold |
| 4 | Items Analyzed | `periodSummary.totalQuantitySold` units / `period.itemCount` items | — |

If status = `DRAFT`: Show a `Button` "Finalise" (amber/warning variant) → opens `ME.15 FinalisePeriodModal`.  
If status = `FINALISED`: Show a locked `Badge` "Finalised".

#### Tab 1: Overview (default)
Default landing when entering ME.2. Contains:
- **Category Distribution** — horizontal stacked bar or `KpiChartCard` (bar chart) showing Winner/Workhorse/Opportunity/Loser counts
- **Top 5 Stars** — mini `DataList` showing top 5 by `itemGrossProfit` desc (name, CM, qty sold)
- **Alert Items** — mini `DataList` showing items with `foodCostPct > 40%` (name, FC%, classification badge)

Each row **on click** → opens `ME.10 ItemDrillDownSlideOver` for that `menuItemId`.

#### Tab 2: Matrix → see ME.4
Renders `QuadrantMatrixPage` as inline content (not a separate route when coming via tab).

#### Tab 3: Results → see ME.3
Renders `ResultsTablePage` as inline content.

#### Tab 4: Categories → see ME.5
Renders `CategorySummaryPage` as inline content.

**Tab Change Behavior:**
- Tab 2 (Matrix): Also updates URL to `/engineering/periods/:periodId/quadrant` via `history.replaceState`
- Tab 3 (Results): `/engineering/periods/:periodId`
- Tab 4 (Categories): `/engineering/periods/:periodId/categories`

---

### ME.3 — ResultsTablePage

**Route:** `/engineering/periods/:periodId` (Tab 3 in ME.2)  
**Data:** `useMenuEngineering().useResults(periodId)` → `MenuEngineeringResult[]`  
**Layout:** Rendered inside ME.2 tab

#### Toolbar
| Control | Component | On Change |
|---------|-----------|-----------|
| Filter by Classification | `Select` (WINNER / WORKHORSE / OPPORTUNITY / LOSER / ALL) | Filters `results` by `classification` |
| Filter by Cost Group | `Select` | Filters by cost group name |
| Sort by | `Select` (Name / CM Desc / FC% Asc / Qty Sold Desc) | Re-sorts the data |
| What-If | `Button` (ghost, icon: `FlaskConical`) | → navigates to `ME.8 WhatIfSimulatorPage` |
| Export | `Button` (ghost, icon: `Download`) | Downloads CSV of current filtered view |

#### Data Table (`ResponsiveDataList<MenuEngineeringResult>`)

**Columns:**
| Header | Accessor | Cell | Sortable |
|--------|----------|------|----------|
| PLU | `pluNumber` | monospace text | yes |
| Item | `itemNameSnapshot` | bold text | yes |
| Sell Price | `sellPrice` | `$XX.XX` | yes |
| Plate Cost | `itemCost` | `$XX.XX` | yes |
| CM ($) | `itemGrossProfit` | `$XX.XX` | yes |
| FC% | `itemCost / sellPrice * 100` | `XX.X%` + color (green <30%, amber 30-40%, red >40%) | yes |
| Qty Sold | `quantitySold` | number | yes |
| Sales Mix | `salesMixPct` | `XX.X%` | yes |
| Classification | `classification` | `StatusBadge` (WINNER=success, WORKHORSE=cyan, OPPORTUNITY=warning, LOSER=danger) | yes |

**Row on Click:** → opens `ME.10 ItemDrillDownSlideOver` for that `menuItemId`

---

### ME.4 — QuadrantMatrixPage

**Route:** `/engineering/periods/:periodId/quadrant` (Tab 2 in ME.2)  
**Data:** `useMenuEngineering().useResults(periodId)` → `MenuEngineeringResult[]`  
**Layout:** Rendered inside ME.2 tab

#### Quadrant Scatter Plot
A custom Recharts `ScatterChart` (not the placeholder `ScatterPlot.tsx` — build fresh):

- **X-axis:** `salesMixPct` (Popularity) — left=Low, right=High
- **Y-axis:** `itemGrossProfit` (CM) — bottom=Low, top=High
- **Quadrant lines:** 
  - Horizontal at `weightedAvgGrossProfit` (dashed line)
  - Vertical at `popularityThreshold` (dashed line)
- **Quadrant labels** (corner badges):
  - Top-right: ⭐ Stars (`emerald`)
  - Top-left: 🧩 Puzzles (`amber`)
  - Bottom-right: 🐴 Plow Horses (`cyan`)
  - Bottom-left: 🐶 Dogs (`rose`)
- **Dots:** Each menu item is a `<Scatter>` dot, colored by classification
- **Dot size (radius):** Proportional to `totalProfit` (larger = more profit contribution)
- **Dot on Hover:** `Tooltip` showing item name, CM, salesMixPct, classification
- **Dot on Click:** → opens `ME.10 ItemDrillDownSlideOver` for that `menuItemId`

#### Filter bar above chart
| Control | Component | On Change |
|---------|-----------|-----------|
| Filter by Classification | `Select` (ALL / WINNER / WORKHORSE / OPPORTUNITY / LOSER) | Show/hides dots for that classification |
| Filter by Cost Group | `Select` | Filters items by cost group |
| Show Labels | `Switch` | Toggles item name labels on dots |

#### Quadrant Summary Strip (below chart)
4 × `KpiCard`:
| # | Title | Value | Color | Icon |
|---|-------|-------|-------|------|
| 1 | Stars | `winnerCount` items | emerald | `Star` |
| 2 | Puzzles | `opportunityCount` items | amber | `Puzzle` |
| 3 | Plow Horses | `workhorseCount` items | cyan | `Tractor` |
| 4 | Dogs | `loserCount` items | rose | `Dog` |

**Each KpiCard on Click:** → Applies filter for that classification in the scatter plot AND in `ME.3 ResultsTablePage` (syncs via shared state)

---

### ME.5 — CategorySummaryPage

**Route:** `/engineering/periods/:periodId/categories` (Tab 4 in ME.2)  
**Data:** `useMenuEngineering().useCategorySummary(periodId)` → `CategorySummaryDto[]`  
**Layout:** Rendered inside ME.2 tab

#### Data Table (`ResponsiveDataList<CategorySummaryDto>`)

**Columns:**
| Header | Accessor | Cell | Sortable |
|--------|----------|------|----------|
| Cost Group | `costGroupName` | bold text | yes |
| Items | `itemCount` | number | yes |
| Avg FC% | `avgFoodCostPct` | `XX.X%` + `ProgressBar` colored by threshold | yes |
| Revenue | `totalRevenue` | `$XX,XXX` | yes |
| Profit | `totalProfit` | `$XX,XXX` | yes |
| ⭐ | `winnerCount` | emerald badge | yes |
| 🧩 | `opportunityCount` | amber badge | yes |
| 🐴 | `workhorseCount` | cyan badge | yes |
| 🐶 | `loserCount` | rose badge | yes |

**Row on Click:** → navigates to `ME.3 ResultsTablePage` pre-filtered to that `costGroupId`

---

### ME.6 — LiveSalesCounterPage

**Route:** `/engineering/live`  
**Data:** `useMenuEngineering().useLiveSales(restaurantId)` → `LiveSalesCountDto[]` (polling every 60s via `usePolling`)  
**Layout:** `SubScreenHeader` (title: "Live Sales Counter", icon: `Activity`, onBack → ME.0)

#### Live KPI Banner (`LiveKpiBanner` component — needs real implementation)
Shows current shift real-time metrics:
| Metric | Source |
|--------|--------|
| Total Revenue Today | `sum(revenueToday)` |
| Total Covers | sum of quantitySoldToday |
| Running FC% | aggregated `runningFoodCostPct` |
| Last Updated | `lastUpdated` timestamp |

#### Data Table (`ResponsiveDataList<LiveSalesCountDto>`)

**Columns:**
| Header | Accessor | Cell |
|--------|----------|------|
| Item | `itemName` | bold text |
| Cost Group | `costGroupName` | muted text |
| Qty Sold Today | `quantitySoldToday` | number |
| Revenue | `revenueToday` | `$XX.XX` |
| FC% | `runningFoodCostPct` | `XX.X%` + color (green/amber/red) |

**Row on Click:** → opens `ME.10 ItemDrillDownSlideOver`  
**Auto-Refresh:** Data polls every 60 seconds; a "LIVE" badge pulses in the header.

**Button: "Export" on Click:** Downloads current live snapshot as CSV.

---

### ME.7 — PeriodHistoryPage

**Route:** `/engineering/history`  
**Data:** `useMenuEngineering().usePeriods(restaurantId)` → `MenuEngineeringPeriod[]`  
**Layout:** `SubScreenHeader` (title: "Period History", icon: `Clock`, onBack → ME.0)

#### Filter Bar
| Control | Component | On Change |
|---------|-----------|-----------|
| Filter by Status | `Select` (ALL / DRAFT / FINALISED) | Filters `periods` by `status` |
| Filter by Cost Group | `Select` | Filters by cost group |
| Search | search input (built into `ResponsiveDataList`) | Text search on `costGroupName` + date range |

#### Data Table (`ResponsiveDataList<MenuEngineeringPeriod>`)

**Columns:**
| Header | Accessor | Cell | Sortable |
|--------|----------|------|----------|
| Period | `periodBeginDate` – `periodEndDate` | formatted date range | yes |
| Cost Group | `costGroupName` | text or "All" | yes |
| Items | `itemCount` | number | yes |
| Pop. Factor | `popularityFactor` | `0.XX` | yes |
| ⭐ | `winnerCount` | emerald number | yes |
| 🧩 | `opportunityCount` | amber number | yes |
| 🐴 | `workhorseCount` | cyan number | yes |
| 🐶 | `loserCount` | rose number | yes |
| Status | `status` | `StatusBadge` | yes |

**Row on Click:** → navigates to `ME.2 PeriodDetailPage` with that `periodId`

**Row Action (⬮ menu, right side):** `DropdownMenu` with:
- "View Detail" → navigates to ME.2
- "Compare with…" → opens `ME.9 PeriodComparisonPage` pre-selecting this as Period 1
- "Finalise" (DRAFT only) → opens `ME.15 FinalisePeriodModal`
- "Delete" (DRAFT only, danger) → opens `ConfirmModal` (shared) → on confirm: `DELETE /api/v1/.../analyses/:id` → refetch list

---

### ME.8 — WhatIfSimulatorPage

**Route:** `/engineering/periods/:periodId/whatif`  
**Data:** Current period results + `useMenuEngineering().useWhatIf(periodId, overrides)` → `WhatIfResultDto`  
**Layout:** `SubScreenHeader` (title: "What-If Simulator", icon: `FlaskConical`, onBack → ME.2)

#### Override Panel (left sidebar or top section)
A list of menu items from the current period with **editable sell prices**:

| Field | Component | Behavior |
|-------|-----------|----------|
| Item name | text (read-only) | — |
| Current Price | text (read-only) | `$XX.XX` |
| New Price | `InlineEdit` (from ui/) | On blur/enter → updates local `overrides[]` state → triggers `useWhatIf` recalc |

**"Add Override" Button:** Opens `Autocomplete` popover to search & pick a menu item, then adds a row.

**"Reset All" Button:** Clears all overrides → `overrides = []` → results revert to original.

#### Results Panel (right / bottom)
Two `KpiChartCard` charts side by side:

| Left Chart | Right Chart |
|-----------|------------|
| **Before** — current FC% distribution | **After** — recalculated FC% with overrides |
| `chartType="bar"`, color=`slate` | `chartType="bar"`, color=`primary` |

#### Impact Summary Strip
4 × `KpiCard`:
| # | Title | Value | Calculation |
|---|-------|-------|-------------|
| 1 | Overall FC% Before | `overallFcPctBefore`% | from `WhatIfResultDto` |
| 2 | Overall FC% After | `overallFcPctAfter`% | from `WhatIfResultDto` |
| 3 | FC% Delta | `fcPctDelta`% | green if negative (better), rose if positive |
| 4 | Items Changed | count of `classificationChanged=true` | from results |

#### Classification Change Table (`ResponsiveDataList<WhatIfResultItem>`)
Filtered to only items where `classificationChanged === true`:

| Header | Cell |
|--------|------|
| Item | `itemName` |
| Original | `StatusBadge` of `originalClassification` |
| → New | `StatusBadge` of `newClassification` (with arrow) |
| CM Before | `originalGrossProfit` |
| CM After | `newGrossProfit` |
| Δ CM | `gpDelta` (+ green, - red) |

**Button: "Apply Changes" (primary, appears only if overrides exist):**  
→ opens `ME.13 ApplyChangesModal`

---

### ME.9 — PeriodComparisonPage

**Route:** `/engineering/compare`  
**Data:** `useMenuEngineering().useComparison(period1Id, period2Id)` → `ComparisonDto`  
**Layout:** `SubScreenHeader` (title: "Compare Periods", icon: `GitCompare`, onBack → ME.0)

#### Period Selector Bar
| Control | Component | On Change |
|---------|-----------|-----------|
| Period 1 | `Select` (list of all periods) | Sets `period1Id`; triggers `useComparison` refetch |
| Period 2 | `Select` (list of all periods) | Sets `period2Id`; triggers `useComparison` refetch |

Both selects disabled until both are chosen. When both set → fetch & display comparison.

#### Revenue Summary Strip
2 × `KpiCard`:
| # | Title | Value |
|---|-------|-------|
| 1 | Revenue P1 | `totalRevenueP1` |
| 2 | Revenue P2 | `totalRevenueP2` |
Plus a delta `KpiCard`: Revenue Delta = `revenueDelta`.

#### Classification Migration Table (`ResponsiveDataList<ComparisonItemRow>`)

**Columns:**
| Header | Cell |
|--------|------|
| Item | `itemName` |
| PLU | `pluNumber` |
| Classification P1 | `StatusBadge(classificationPeriod1)` |
| Classification P2 | `StatusBadge(classificationPeriod2)` |
| Changed? | check icon (`Check`) if `changed`, dash if not |
| CM P1 | `grossProfitP1` |
| CM P2 | `grossProfitP2` |
| Mix% P1 | `salesMixPctP1` |
| Mix% P2 | `salesMixPctP2` |

**Filter by "Movers Only" `Switch`:** When ON, table only shows rows where `changed === true`.

**Row on Click:** → opens `ME.10 ItemDrillDownSlideOver` for that `menuItemId` (shows data from both periods)

**Button: "View Delta Summary" on Click:** → opens `ME.14 HistoricalDeltaModal` showing aggregated migration flows (Stars→Dogs count, etc.)

---

### ME.10 — ItemDrillDownSlideOver

**Route:** None (overlay)  
**Data:** `useMenuEngineering().useItemMetrics(menuItemId, periodId)` + the parent results row data  
**Component:** `SlideOver` (side="right", sm:max-w-lg)

#### Header
| Element | Content |
|---------|---------|
| Title | `itemNameSnapshot` |
| Subtitle | `pluNumber` / `costGroupName` |
| Classification | Large `StatusBadge` (color-coded) |

#### KPI Cards (2×2 grid)
| # | Title | Value |
|---|-------|-------|
| 1 | Selling Price | `sellPrice` |
| 2 | Plate Cost | `itemCost` |
| 3 | CM | `itemGrossProfit` |
| 4 | FC% | `itemCost / sellPrice * 100` |

#### Sales Trend
`KpiChartCard` (chartType="area", title="Sales Trend") — shows weekly qty sold if available, otherwise single data point.

#### Food Cost Breakdown
If data available from recipe module: mini ingredient cost table (ingredient, qty, cost, % of total). Otherwise: placeholder text "Connect recipes for ingredient-level breakdown."

#### Recommendation Section
| Element | Content |
|---------|---------|
| Heading | "Strategic Recommendation" |
| Type Badge | `Badge` — e.g. RETAIN / REPRICE / REPLATE / RETHINK (based on classification) |
| Description | SRS-mapped text per classification (see §3.5 of SRS) |
| Button: "View All Recommendations" | → opens `ME.11 RecommendationPanel` |

#### Classification History (if comparison data exists)
Mini text: "Previously: [old class] → Now: [new class]" with arrow and date.

**Button: Close (X) on Click:** → closes SlideOver  
**Button: "Open in Recipes" (ghost) on Click:** → navigates to recipe detail for thismenuItem's linked recipe (`/recipes/batch/:recipeId`) — only if recipe link exists

---

### ME.11 — RecommendationPanel

**Route:** None (overlay)  
**Data:** Full recommendation list for the item/period (from API: `/analyses/{id}/recommendations`)  
**Component:** `SlideOver` (side="right")

#### Header
Title: "Recommendations for {itemName}"

#### Recommendation List (`DataList`)
Each item is a `DataList` item:

| Element | Content |
|---------|---------|
| Priority Badge | `Badge` — HIGH (rose) / MEDIUM (amber) / LOW (slate) |
| Title | `recommendation.title` |
| Description | `recommendation.description` |
| Estimated Impact | `+$X,XXX/year` |
| Status | `StatusBadge` — PENDING (default) / IN_PROGRESS (info) / COMPLETED (success) / DISMISSED (muted) |
| Assigned To | text if present |
| Due Date | date if present |

#### Actions per recommendation
| Button | On Click |
|--------|---------|
| "Mark In Progress" | `PATCH /recommendations/:id` → status=IN_PROGRESS → refetch |
| "Mark Complete" | `PATCH /recommendations/:id` → status=COMPLETED → refetch |
| "Dismiss" | `PATCH /recommendations/:id` → status=DISMISSED → refetch |

**Button: Close (X):** → closes panel

---

### ME.12 — CreateAnalysisModal

**Route:** None (overlay)  
**Component:** `Modal` (from ui/)  
**Trigger:** Shown from ME.0 hub "Quick Create" button  
*(This is a shortened version of ME.1 for quick-access — only the date range + cost group, no step wizard)*

| Field | Component |
|-------|-----------|
| Cost Group | `Select` |
| Date Range | `DateRangePicker` |
| Pop Factor | `Input` (number, default 0.80) |

**Button: "Create & Run" on Click:** → same as ME.1 Step 3's "Run Analysis" button logic. On success → close modal → navigate to ME.2.

**Button: "Cancel" on Click:** → closes modal.

---

### ME.13 — ApplyChangesModal

**Route:** None (overlay)  
**Component:** `ConfirmModal` (shared/) — variant="warning"  
**Trigger:** ME.8 "Apply Changes" button

**Title:** "Apply What-If Changes?"  
**Description:** "This will update the selling prices of {N} items. Classification changes: {M} items moved quadrants. This action cannot be undone."  
**Confirm Label:** "Apply Changes"  
**On Confirm:** 
1. Calls `POST /api/v1/.../analyses/:periodId/apply-whatif` with overrides
2. On success → close modal → navigate to ME.2 (refreshed with new data)
3. On error → show toast error

**On Cancel:** → closes modal, no action

---

### ME.14 — HistoricalDeltaModal

**Route:** None (overlay)  
**Component:** `Modal` (from ui/)  
**Trigger:** ME.9 "View Delta Summary" button

**Title:** "Classification Migration Summary"

#### Content
A **sankey-style flow** or simple grid showing migration counts:

| From \ To | ⭐ Star | 🧩 Puzzle | 🐴 Plow Horse | 🐶 Dog |
|-----------|---------|----------|---------------|--------|
| ⭐ Star   | —       | N        | N             | N      |
| 🧩 Puzzle | N       | —        | N             | N      |
| 🐴 Plow Horse | N  | N        | —             | N      |
| 🐶 Dog   | N       | N        | N             | —      |

Computed from `ComparisonDto.rows` — counting classification transitions.

**Key Insight Badges:**
- "↑ Promoted" — count of items that moved to a better quadrant
- "↓ Demoted" — count of items that moved to a worse quadrant
- "→ Stable" — count of items that stayed the same

**Button: "Close" on Click:** → closes modal

---

### ME.15 — FinalisePeriodModal

**Route:** None (overlay)  
**Component:** `ConfirmModal` (shared/) — variant="danger"  
**Trigger:** ME.2 "Finalise" button or ME.7 row action "Finalise"

**Title:** "Finalise Analysis Period?"  
**Description:** "Finalising locks all data snapshots for this period. No further edits to sell prices, costs, or classifications will be allowed. This action is irreversible."  
**Confirm Label:** "Finalise"  
**On Confirm:**
1. Calls `POST /api/v1/.../analyses/:periodId/finalise`
2. On success → `status` becomes `FINALISED` → refetch period → close modal → show success toast
3. On error → show error toast

**On Cancel:** → closes modal, no action

---

## Navigation Flow Diagram

```
ME.0 EngineeringHub
  ├── [+ New Analysis] ──→ ME.1 PeriodSetup ──→ (creates) ──→ ME.2 PeriodDetail
  ├── [Latest Results] ──→ ME.2 PeriodDetail (latest periodId)
  ├── [Live Sales] ──────→ ME.6 LiveSalesCounter
  ├── [Period History] ──→ ME.7 PeriodHistory ──→ (row click) ──→ ME.2
  ├── [Compare] ─────────→ ME.9 PeriodComparison
  └── [What-If] ─────────→ ME.8 WhatIfSimulator (needs periodId)

ME.2 PeriodDetail (/:periodId)
  ├── Tab: Overview ──── (summary + alerts)
  ├── Tab: Matrix ────── (ME.4 QuadrantMatrix) ──dot click──→ ME.10 SlideOver
  ├── Tab: Results ───── (ME.3 ResultsTable) ──row click──→ ME.10 SlideOver
  ├── Tab: Categories ── (ME.5 CategorySummary) ──row click──→ ME.3 (filtered)
  ├── [Finalise] ───────→ ME.15 FinalisePeriodModal
  └── [What-If] ────────→ ME.8 WhatIfSimulator

ME.10 ItemDrillDownSlideOver
  └── [View Recommendations] ──→ ME.11 RecommendationPanel

ME.8 WhatIfSimulator
  └── [Apply Changes] ──→ ME.13 ApplyChangesModal ──→ ME.2

ME.9 PeriodComparison
  └── [View Delta Summary] ──→ ME.14 HistoricalDeltaModal
```

---

## State Architecture

### React Query Keys

```ts
export const engineeringKeys = {
  all:          (restaurantId: number) => ['engineering', restaurantId] as const,
  periods:      (restaurantId: number) => [...engineeringKeys.all(restaurantId), 'periods'] as const,
  period:       (restaurantId: number, periodId: number) => [...engineeringKeys.all(restaurantId), 'period', periodId] as const,
  results:      (restaurantId: number, periodId: number) => [...engineeringKeys.period(restaurantId, periodId), 'results'] as const,
  summary:      (restaurantId: number, periodId: number) => [...engineeringKeys.period(restaurantId, periodId), 'summary'] as const,
  categories:   (restaurantId: number, periodId: number) => [...engineeringKeys.period(restaurantId, periodId), 'categories'] as const,
  liveSales:    (restaurantId: number) => [...engineeringKeys.all(restaurantId), 'live'] as const,
  whatIf:       (restaurantId: number, periodId: number) => [...engineeringKeys.period(restaurantId, periodId), 'whatif'] as const,
  comparison:   (restaurantId: number, p1: number, p2: number) => [...engineeringKeys.all(restaurantId), 'comparison', p1, p2] as const,
  recommendations: (restaurantId: number, periodId: number, itemId: number) => [...engineeringKeys.period(restaurantId, periodId), 'recs', itemId] as const,
};
```

### React Query Hooks (in `hooks/useMenuEngineering.ts`)

```ts
usePeriods(restaurantId)                    → useQuery → MenuEngineeringPeriod[]
usePeriodDetail(periodId)                   → useQuery → MenuEngineeringPeriod + PeriodSummaryDto
useResults(periodId)                        → useQuery → MenuEngineeringResult[]
useCategorySummary(periodId)                → useQuery → CategorySummaryDto[]
useLiveSales(restaurantId)                  → useQuery (refetchInterval: 60000) → LiveSalesCountDto[]
useComparison(period1Id, period2Id)          → useQuery → ComparisonDto
useWhatIf(periodId, overrides)              → useQuery (enabled: overrides.length > 0) → WhatIfResultDto
useRecommendations(periodId, menuItemId)    → useQuery → Recommendation[]

useCreatePeriod()                            → useMutation → creates + triggers runAnalysis
useFinalisePeriod()                          → useMutation → finalises period
useUpdateRecommendationStatus()              → useMutation → PATCH recommendation status
useApplyWhatIf(periodId)                     → useMutation → applies what-if overrides
useDeletePeriod()                            → useMutation → deletes DRAFT period
```

---

## File Structure (to be created)

```
src/features/menu-engineering/
├── menu-engineer-screens.md              ← YOU ARE HERE
├── index.tsx                             ← barrel export
│
├── pages/
│   ├── EngineeringHubPage.tsx            ← ME.0
│   ├── PeriodSetupPage.tsx               ← ME.1
│   ├── PeriodDetailPage.tsx              ← ME.2 (master tab container)
│   ├── LiveSalesCounterPage.tsx          ← ME.6
│   ├── PeriodHistoryPage.tsx             ← ME.7
│   ├── WhatIfSimulatorPage.tsx           ← ME.8
│   └── PeriodComparisonPage.tsx          ← ME.9
│
├── components/
│   ├── QuadrantMatrix.tsx               ← ME.4 scatter chart (inline in ME.2 tab)
│   ├── ResultsTable.tsx                  ← ME.3 table (inline in ME.2 tab)
│   ├── CategorySummaryTable.tsx          ← ME.5 table (inline in ME.2 tab)
│   ├── ClassificationBadge.tsx           ← Reusable badge (WINNER/WORKHORSE/OPPORTUNITY/LOSER)
│   ├── PeriodOverviewPanel.tsx           ← ME.2 Tab 1 content
│   ├── ItemDrillDownSlideOver.tsx        ← ME.10 overlay
│   ├── RecommendationPanel.tsx           ← ME.11 overlay
│   ├── CreateAnalysisModal.tsx           ← ME.12 overlay
│   ├── ApplyChangesModal.tsx             ← ME.13 overlay
│   ├── HistoricalDeltaModal.tsx          ← ME.14 overlay
│   ├── FinalisePeriodModal.tsx           ← ME.15 overlay
│   ├── OverrideEditorTable.tsx           ← ME.8 override editor with InlineEdit
│   ├── ComparisonGrid.tsx                ← ME.9 comparison table
│   └── QuadrantKpiStrip.tsx              ← Strip of 4 KPI cards under matrix
│
└── hooks/
    └── useMenuEngineering.ts             ← All React Query hooks + mutations
```

---

## Complete Click Event Reference

### ME.0 EngineeringHubPage
| Element | Event | Action |
|---------|-------|--------|
| NavCard "New Analysis" | click | Navigate to `/engineering/new` |
| NavCard "Latest Results" | click | Navigate to `/engineering/periods/:latestPeriodId` |
| NavCard "Live Sales" | click | Navigate to `/engineering/live` |
| NavCard "Period History" | click | Navigate to `/engineering/history` |
| NavCard "Compare Periods" | click | Navigate to `/engineering/compare` |
| NavCard "What-If Simulator" | click | Navigate to `/engineering/periods/:latestPeriodId/whatif` |
| Recent period row | click | Navigate to `/engineering/periods/:periodId` |
| "New Analysis" button (top-right) | click | Navigate to `/engineering/new` |
| KpiCard any | click | Scroll to recent periods list |

### ME.1 PeriodSetupPage
| Element | Event | Action |
|---------|-------|--------|
| StepRail step 1/2/3 | click | Navigate between form steps |
| DateRangePicker change | change | Update local form state |
| Cost Group select change | change | Update local form state |
| Pop Factor input change | change | Update local form state (validate 0.5–1.0) |
| "Run Analysis" button | click | POST createPeriod → POST runAnalysis → Navigate to ME.2 with new periodId |
| "Cancel" button | click | `useAppStore().back()` → returns to ME.0 |
| Switch toggle (exclude voids/comps/refunds) | toggle | Update local form state |

### ME.2 PeriodDetailPage
| Element | Event | Action |
|---------|-------|--------|
| Tab "Overview" | click | Show overview panel, update URL to `/periods/:id` |
| Tab "Matrix" | click | Show quadrant chart, update URL to `/periods/:id/quadrant` |
| Tab "Results" | click | Show results table, update URL to `/periods/:id` |
| Tab "Categories" | click | Show category table, update URL to `/periods/:id/categories` |
| "Finalise" button (DRAFT only) | click | Open ME.15 FinalisePeriodModal |
| Overview: Top 5 Stars row | click | Open ME.10 ItemDrillDownSlideOver |
| Overview: Alert item row | click | Open ME.10 ItemDrillDownSlideOver |
| Back button | click | Navigate to `/engineering` (ME.0) |

### ME.3 ResultsTablePage
| Element | Event | Action |
|---------|-------|--------|
| Filter by Classification select | change | Filter `results` array |
| Filter by Cost Group select | change | Filter `results` array |
| Sort by select | change | Re-sort `results` array |
| Column header | click | Toggle sort ascending/descending for that column |
| Table row | click | Open ME.10 ItemDrillDownSlideOver for that menuItemId |
| "What-If" button | click | Navigate to `/engineering/periods/:periodId/whatif` |
| "Export" button | click | Generate & download CSV of filtered results |

### ME.4 QuadrantMatrixPage
| Element | Event | Action |
|---------|-------|--------|
| Filter Classification select | change | Show/hide scatter dots by classification |
| Filter Cost Group select | change | Show/hide scatter dots by cost group |
| "Show Labels" switch | toggle | Show/hide item name text labels on dots |
| Scatter dot hover | hover | Show Tooltip (name, CM, mix%, classification) |
| Scatter dot click | click | Open ME.10 ItemDrillDownSlideOver for that menuItemId |
| KpiCard "Stars" | click | Filter scatter + ME.3 table to WINNER only |
| KpiCard "Puzzles" | click | Filter scatter + ME.3 table to OPPORTUNITY only |
| KpiCard "Plow Horses" | click | Filter scatter + ME.3 table to WORKHORSE only |
| KpiCard "Dogs" | click | Filter scatter + ME.3 table to LOSER only |

### ME.5 CategorySummaryPage
| Element | Event | Action |
|---------|-------|--------|
| Table row | click | Navigate to ME.3 with `?costGroupId=X` filter pre-applied |
| Column header | click | Toggle sort ascending/descending for that column |

### ME.6 LiveSalesCounterPage
| Element | Event | Action |
|---------|-------|--------|
| Table row | click | Open ME.10 ItemDrillDownSlideOver |
| "Export" button | click | Download CSV snapshot |
| Back button | click | Navigate to `/engineering` (ME.0) |

### ME.7 PeriodHistoryPage
| Element | Event | Action |
|---------|-------|--------|
| Filter Status select | change | Filter period list by status |
| Filter Cost Group select | change | Filter period list by cost group |
| Search input | change | Filter period list by text search |
| Table row | click | Navigate to `/engineering/periods/:periodId` (ME.2) |
| Row ⬮ menu "View Detail" | click | Navigate to ME.2 |
| Row ⬮ menu "Compare with…" | click | Navigate to ME.9 with this period pre-selected as P1 |
| Row ⬮ menu "Finalise" | click | Open ME.15 FinalisePeriodModal |
| Row ⬮ menu "Delete" | click | Open shared `ConfirmModal` (danger), on confirm → DELETE → refetch |
| Back button | click | Navigate to `/engineering` (ME.0) |

### ME.8 WhatIfSimulatorPage
| Element | Event | Action |
|---------|-------|--------|
| InlineEdit (new price) | blur/enter | Update `overrides[]` state → trigger `useWhatIf` recalc |
| "Add Override" button | click | Open Autocomplete popover → pick item → add row to override list |
| "Reset All" button | click | Clear all `overrides[]` → results revert to original |
| "Apply Changes" button | click | Open ME.13 ApplyChangesModal |
| Classification change table row | click | Open ME.10 ItemDrillDownSlideOver |
| Back button | click | Navigate to ME.2 (parent period) |

### ME.9 PeriodComparisonPage
| Element | Event | Action |
|---------|-------|--------|
| Period 1 select | change | Set p1 ID, trigger comparison refetch |
| Period 2 select | change | Set p2 ID, trigger comparison refetch |
| "Movers Only" switch | toggle | Filter table to only changed-classification rows |
| Table row | click | Open ME.10 ItemDrillDownSlideOver (both-period view) |
| "View Delta Summary" button | click | Open ME.14 HistoricalDeltaModal |
| Back button | click | Navigate to `/engineering` (ME.0) |

### ME.10 ItemDrillDownSlideOver
| Element | Event | Action |
|---------|-------|--------|
| Close (X) button | click | Close SlideOver |
| "View All Recommendations" button | click | Open ME.11 RecommendationPanel |
| "Open in Recipes" ghost button | click | Navigate to `/recipes/batch/:recipeId` (if recipe link exists) |

### ME.11 RecommendationPanel
| Element | Event | Action |
|---------|-------|--------|
| "Mark In Progress" button | click | PATCH recommendation status → IN_PROGRESS → refetch |
| "Mark Complete" button | click | PATCH recommendation status → COMPLETED → refetch |
| "Dismiss" button | click | PATCH recommendation status → DISMISSED → refetch |
| Close (X) button | click | Close SlideOver |

### ME.12 CreateAnalysisModal
| Element | Event | Action |
|---------|-------|--------|
| "Create & Run" button | click | POST createPeriod → POST runAnalysis → close modal → navigate to ME.2 |
| "Cancel" button | click | Close modal |

### ME.13 ApplyChangesModal
| Element | Event | Action |
|---------|-------|--------|
| "Apply Changes" (confirm) button | click | POST apply-whatif → close modal → navigate to ME.2 → success toast |
| "Cancel" button | click | Close modal |

### ME.14 HistoricalDeltaModal
| Element | Event | Action |
|---------|-------|--------|
| "Close" button | click | Close modal |
| Migration grid cell (non-diagonal) | click | Filter ME.9 comparison table to show only items with that specific transition |

### ME.15 FinalisePeriodModal
| Element | Event | Action |
|---------|-------|--------|
| "Finalise" (confirm) button | click | POST finalise → close modal → refetch period → success toast |
| "Cancel" button | click | Close modal |

---

## API Endpoints Required (from SRS §5.2)

| Method | Endpoint | Used By |
|--------|----------|---------|
| GET | `/restaurants/{id}/menu-engineering/analyses` | ME.0, ME.7 |
| POST | `/restaurants/{id}/menu-engineering/analyses` | ME.1, ME.12 |
| GET | `/restaurants/{id}/menu-engineering/analyses/{id}` | ME.2 |
| POST | `/restaurants/{id}/menu-engineering/analyses/{id}/run` | ME.1, ME.12 |
| POST | `/restaurants/{id}/menu-engineering/analyses/{id}/finalise` | ME.15 |
| DELETE | `/restaurants/{id}/menu-engineering/analyses/{id}` | ME.7 |
| GET | `/restaurants/{id}/menu-engineering/analyses/{id}/matrix` | ME.4 |
| GET | `/restaurants/{id}/menu-engineering/analyses/{id}/results` | ME.3 |
| GET | `/restaurants/{id}/menu-engineering/analyses/{id}/summary` | ME.2 |
| GET | `/restaurants/{id}/menu-engineering/analyses/{id}/categories` | ME.5 |
| GET | `/restaurants/{id}/menu-engineering/analyses/{id}/recommendations` | ME.11 |
| PATCH | `/restaurants/{id}/menu-engineering/recommendations/{id}` | ME.11 |
| GET | `/restaurants/{id}/menu-engineering/items/{id}/metrics` | ME.10 |
| POST | `/restaurants/{id}/menu-engineering/analyses/{id}/whatif` | ME.8 |
| POST | `/restaurants/{id}/menu-engineering/analyses/{id}/apply-whatif` | ME.13 |
| GET | `/restaurants/{id}/menu-engineering/comparison?p1=X&p2=Y` | ME.9 |
| GET | `/restaurants/{id}/menu-engineering/live` | ME.6 |
| POST | `/restaurants/{id}/menu-engineering/export` | ME.3, ME.6 |

---

## Additional Features (Backend Implemented, Not Yet in UI)

The backend provides additional features that are not yet exposed in the frontend screens. These can be added in future iterations.

### Category 1: Advanced Analytics

| Feature | Endpoint | Description | Suggested Screen |
|---------|----------|-------------|------------------|
| Food Cost Comparison | `GET /periods/{id}/analysis/food-cost-comparison` | Theoretical vs Actual Food Cost | New "Cost Control" tab in ME.2 |
| Price Elasticity | `GET /periods/{id}/analysis/price-elasticity` | Revenue optimization recommendations | New "Pricing" panel in ME.8 |
| Market Basket | `GET /periods/{id}/analysis/market-basket` | Item co-occurrence analysis | New "Bundles" tab in ME.2 |
| Server Performance | `GET /periods/{id}/analysis/server-performance` | Staff performance correlation | New "Staff Insights" page |
| Demand Forecast | `GET /periods/{id}/analysis/demand-forecast` | Future demand predictions | New "Forecasting" page |

### Category 2: Export & Integration

| Feature | Endpoint | Description | Suggested Screen |
|---------|----------|-------------|------------------|
| JSON Export | `GET /export/data?format=json` | Full data as JSON | Connect to Export button in ME.3 |
| CSV Export | `GET /export/data?format=csv` | Downloadable CSV | Connect to Export button in ME.3 |
| Quick Export | `GET /export/quick` | Pre-built export URLs | Add to ME.0 hub |

### Category 3: Menu Design Recommendations

| Feature | Endpoint | Description | Suggested Screen |
|---------|----------|-------------|------------------|
| Menu Design Recs | `GET /periods/{id}/recommendations/menu-design` | Specialized menu optimization | New "Menu Design" tab in ME.11 |
| Generate Menu Recs | `POST /periods/{id}/recommendations/menu-design/generate` | Auto-generate menu recs | Add to ME.1 workflow |

### Category 4: Classification-Based Recommendations

| Feature | Endpoint | Description | Suggested Screen |
|---------|----------|-------------|------------------|
| By Classification | `GET /recommendations/classification/{classification}` | Filter by WINNER/WORKHORSE/etc | Add filter to ME.11 |
| By Priority | `GET /recommendations/priority/{priority}` | Filter by HIGH/MEDIUM/LOW | Add filter to ME.11 |
| By Status | `GET /recommendations/status/{status}` | Filter by PENDING/IN_PROGRESS/etc | Add filter to ME.11 |
| Overdue Recs | `GET /recommendations/overdue` | Get overdue recommendations | Add alerts widget to ME.0 |

### Category 5: Recommendation Actions

| Feature | Endpoint | Description | Suggested Screen |
|---------|----------|-------------|------------------|
| Submit | `POST /recommendations/{id}/submit` | Submit for approval | Add to ME.11 actions |
| Approve | `POST /recommendations/{id}/approve` | Approve recommendation | Add approval workflow |
| Reject | `POST /recommendations/{id}/reject` | Reject recommendation | Add rejection workflow |
| Assign | `POST /recommendations/{id}/assign` | Assign to team member | Add assignment dropdown |
| Comment | `POST /recommendations/{id}/comment` | Add comment thread | Add collaboration panel |

### Category 6: Reviews & Reminders

| Feature | Endpoint | Description | Suggested Screen |
|---------|----------|-------------|------------------|
| Quarterly Reviews | `GET /reviews/quarterly` | Review schedule | New "Calendar" page |
| Reminders | `GET /reviews/reminders` | Upcoming reminders | Add to notification center |

### Category 7: Integration Endpoints

| Feature | Endpoint | Description | Suggested Screen |
|---------|----------|-------------|------------------|
| Inventory Status | `GET /integrations/inventory-status` | Inventory sync status | New "Integrations" settings page |
| Recipe Status | `GET /integrations/recipe-status` | Recipe sync status | New "Integrations" settings page |
| Notifications | `GET /integrations/notifications` | Integration notifications | Add to notification center |
| Webhook: Analysis | `POST /webhooks/analysis-completed` | Analysis completion event | Configuration only |
| Webhook: Classification | `POST /webhooks/classification-changed` | Classification change event | Configuration only |

### Category 8: Simulation

| Feature | Endpoint | Description | Suggested Screen |
|---------|----------|-------------|------------------|
| Generate Orders | `POST /simulate/orders` | Generate test orders | Add "Generate Test Data" to ME.1 |
| Period Simulation | `POST /periods/{id}/simulate` | Scenario planning | Add to ME.8 What-If |

### Category 9: Analysis Variations

| Feature | Endpoint | Description | Suggested Screen |
|---------|----------|-------------|------------------|
| Ad-hoc Analysis | `POST /analyze` | Run quick analysis | Add to ME.0 hub |
| By Category | `POST /analyze/by-category` | Category-specific | Add category filter to ME.1 |
| Multi-Period Compare | `GET /periods/compare` | Compare multiple periods | Enhance ME.9 |

### Category 10: Settings

| Feature | Endpoint | Description | Suggested Screen |
|---------|----------|-------------|------------------|
| All Settings | `GET /settings` | Get configuration | New "Settings" page |

---

## Implementation Priority Recommendations

### Phase 1: Quick Wins (1-2 sprints)
1. **Export Features** - Connect CSV/JSON export to existing Export buttons
2. **Price Elasticity** - Add pricing recommendations to What-If Simulator
3. **Market Basket** - Add bundle recommendations to Overview tab

### Phase 2: Value Add (2-3 sprints)
4. **Server Performance** - Add Staff Insights page
5. **Demand Forecast** - Add Forecasting page
6. **Approval Workflow** - Full recommendation lifecycle in ME.11
7. **Comments** - Add collaboration panel

### Phase 3: Enhancements (3-4 sprints)
8. **Integration Settings** - Webhook configuration page
9. **Quarterly Reviews** - Calendar view
10. **Menu Design** - Specialized recommendations tab
11. **Settings Page** - Full configuration UI

---

*Document Version: 1.1*  
*Last Updated: 2026-04-17*  
*Added: Additional Features Section (Backend Implemented, Not Yet in UI)*

---

## Design Tokens & SRS Mapping

All components must use the Shopro design tokens from `index.css`:

| SRS Concept | UI Color | CSS Var / Tailwind | Badge Style |
|-------------|----------|-------------------|-------------|
| Star (WINNER) | Emerald | `text-emerald-600 bg-emerald-500/10 border-emerald-500/20` | `StatusBadge` variant=WINNER |
| Puzzle (OPPORTUNITY) | Amber | `text-amber-600 bg-amber-500/10 border-amber-500/20` | `StatusBadge` variant=OPPORTUNITY |
| Plow Horse (WORKHORSE) | Cyan/Brand | `text-primary bg-primary-soft border-primary/20` | `StatusBadge` variant=WORKHORSE |
| Dog (LOSER) | Rose | `text-rose-600 bg-rose-500/10 border-rose-500/20` | `StatusBadge` variant=LOSER |
| Food Cost Alert (>40%) | Rose | `text-rose-600` | Inline in FC% cell |
| Food Cost OK (<30%) | Emerald | `text-emerald-600` | Inline in FC% cell |
| Food Cost Warning (30-40%) | Amber | `text-amber-600` | Inline in FC% cell |
| DRAFT status | Slate/Default | `StatusBadge` default | — |
| FINALISED status | Emerald | `StatusBadge` FINALISED | — |