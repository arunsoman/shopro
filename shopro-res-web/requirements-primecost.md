# Prime Cost Feature — Requirements Document

> **Source**: `src/features/prime-cost/` (v2 router-based screens)
> **Status**: Synthesized from codebase scan — all visual elements, data fields, and click interactions documented.
> **Date**: 2026-04-17

---

## Navigation Architecture

```
PrimeCostHubPage (/prime-cost)
├── Live Dashboard  → LiveDashboardPage (/prime-cost/live-dashboard)
├── Weekly Worksheet → WeeklyWorksheetPage (/prime-cost/weekly-worksheet)
├── Budget vs Actual → BudgetVsActualPage (/prime-cost/budget-vs-actual)
├── Variance Attribution → VarianceAttributionPage (/prime-cost/variance-attribution)
├── 8-Week Trend     → TrendChartPage (/prime-cost/trend-chart)
└── Labor & Schedule → LaborSchedulePage (/prime-cost/labor-schedule)

LaborSchedulePage
└── Multi-Location   → MultiLocationPage (/prime-cost/multi-location)
```

---

## Screen: PrimeCostHubPage

**Route**: `/prime-cost`
**Purpose**: Hub landing page — entry point for all prime cost analytics. Shows at-a-glance KPIs and navigation to sub-reports.
**Router**: `createBrowserRouter` v2 — accessed via React Router.

---

### Visual Elements

| # | Element | Type | Data Displayed | Source |
|---|---------|------|----------------|--------|
| 1 | **Header bar** | Layout | Restaurant name (from `useRestaurantId()`), nav breadcrumb "Prime Cost" | `HubHeader` component |
| 2 | **Live KPI cards** | 4× `KpiCard` | Prime Cost %, Food %, Labor %, GP% — current week live values | `useLivePrimeCost` hook |
| 3 | **Last sync timestamp** | Text badge | e.g. "Synced 2 min ago" | `useLivePrimeCost` hook |
| 4 | **Period selector** | Button group | "This Week" / "Last Week" / custom range | Local state in page |
| 5 | **Navigation cards** | 6× `NavCard` | Icon, label, description for each sub-screen | Static `NAV_ITEMS` array |
| 6 | **Loading skeletons** | Shimmer | 4 KPI cards + 6 nav cards in skeleton state | `loading={isLoading}` prop |

---

### KPI Card Details

Each `KpiCard` receives:

| Prop | Value |
|------|-------|
| `title` | "Prime Cost" / "Food %" / "Labor %" / "GP %" |
| `value` | Formatted percentage from `useLivePrimeCost` |
| `delta` | Week-over-week change (e.g. "+2.1pp") |
| `deltaDir` | `'up'` (bad for PC/Food/Labor) / `'down'` (bad for GP) |
| `icon` | `DollarSign` / `Pizza` / `Users` / `TrendingUp` from Lucide |
| `isLive` | `true` — pulsing green dot in top-right corner |
| `onClick` | `undefined` — not clickable on hub |

---

### NavCard Details

6 navigation cards on hub, each navigates via `navigate()`:

| # | Label | Icon | Color | Route | Description |
|---|-------|------|-------|-------|-------------|
| 1 | Live Dashboard | `LayoutDashboard` | blue | `/prime-cost/live-dashboard` | Real-time KPI snapshot |
| 2 | Weekly Worksheet | `FileSpreadsheet` | green | `/prime-cost/weekly-worksheet` | Day-by-day breakdown |
| 3 | Budget vs Actual | `Scale` | purple | `/prime-cost/budget-vs-actual` | Budget vs realized |
| 4 | Variance Attribution | `GitBranch` | amber | `/prime-cost/variance-attribution` | What drove the variance |
| 5 | 8-Week Trend | `TrendingUp` | cyan | `/prime-cost/trend-chart` | Historical trend analysis |
| 6 | Labor & Schedule | `Clock` | rose | `/prime-cost/labor-schedule` | Staffing & labor cost |

---

### Click Interactions

| Trigger | Action | Result |
|---------|--------|--------|
| Click any `NavCard` | `navigate(card.route)` | React Router navigates to sub-page; URL updates |
| Click browser back | `react-router` popstate | Returns to hub or previous route |
| Direct URL `/prime-cost/live-dashboard` | Route match | Directly renders LiveDashboardPage (no hub state needed) |

---

## Screen: LiveDashboardPage

**Route**: `/prime-cost/live-dashboard`
**Purpose**: Real-time snapshot of today's / this week's prime cost KPIs. Auto-refreshing.
**Layout**: `SubScreenHeader` + scrollable card grid below.

---

### Visual Elements

| # | Element | Type | Data Displayed |
|---|---------|------|----------------|
| 1 | **Back button** | Ghost icon button | `ArrowLeft` — triggers `navigate(-1)` |
| 2 | **Sub-header** | `SubScreenHeader` | Title: "Live Dashboard", subtitle: "Prime Cost" |
| 3 | **Refresh indicator** | `isLive` badge | Pulsing green dot + "LIVE" label when auto-refresh active |
| 4 | **KPI cards grid** | 4× `KpiCard` | Prime Cost %, Food %, Labor %, GP% |
| 5 | **Trend sparkline** | Recharts `<LineChart>` | 7-day rolling prime cost trend |
| 6 | **Sales breakdown** | Bar or pie | Food vs Bev mix |
| 7 | **Top variance items** | List | Biggest +ve / -ve contributors |
| 8 | **Loading skeletons** | Shimmer | All cards show skeleton while data loads |

---

### Data Hooks Used

| Hook | Returns |
|------|---------|
| `useLivePrimeCost()` | `primeCostPct`, `foodPct`, `laborPct`, `gpPct`, `salesTotal`, `lastSynced` |
| `useForecast()` | Forecast vs budget comparison |
| `usePrimeCostTrend()` | Historical data for sparkline chart |

---

## Screen: WeeklyWorksheetPage

**Route**: `/prime-cost/weekly-worksheet`
**Purpose**: Day-by-day breakdown of a selected week. Shows sales, COGS, labor hours and cost per day.
**Layout**: `SubScreenHeader` + week selector + scrollable table.

---

### Visual Elements

| # | Element | Type | Data Displayed |
|---|---------|------|----------------|
| 1 | **Back button** | Ghost icon button | Returns to hub |
| 2 | **Sub-header** | `SubScreenHeader` | Title: "Weekly Worksheet", subtitle: "Prime Cost" |
| 3 | **Week selector** | Prev/Next chevron buttons | Shows Mon–Sun date range |
| 4 | **Week range label** | Text | e.g. "Week 15 · Mar 31 – Apr 6" |
| 5 | **Location filter** | Dropdown or chip | Filter by location if multi-location |
| 6 | **Summary totals row** | Sticky header row | Week totals: Sales, Food Cost, Labor, Prime Cost |
| 7 | **Daily rows** | Table rows × 7 | One row per day (Mon–Sun) |
| 8 | **Day cell** | Text | Day name + date |
| 9 | **Sales cell** | Money | Total sales for that day |
| 10 | **Food Cost cell** | Money + % | COGS amount + as % of sales |
| 11 | **Labor cell** | Money + % | Labor cost + as % of sales |
| 12 | **Prime Cost cell** | Money + % | Combined food + labor % |
| 13 | **GP cell** | Money + % | Gross profit |
| 14 | **Weather / notes** | Text | Optional contextual note per day |
| 15 | **Total row** | Bold row | Sum of all daily columns |

> ⚠️ **Known Issue**: Sales mix breakdown (Food/Bev/Other %) is currently **hardcoded** in the component as `80/3/6/6/4/1` — should be pulled from POS sales data.

---

## Screen: BudgetVsActualPage

**Route**: `/prime-cost/budget-vs-actual`
**Purpose**: Compare weekly budget against actual realized figures.
**Layout**: `SubScreenHeader` + comparison table + variance columns.

---

### Visual Elements

| # | Element | Type | Data Displayed |
|---|---------|------|----------------|
| 1 | **Back button** | Icon | Returns to hub |
| 2 | **Sub-header** | `SubScreenHeader` | Title: "Budget vs Actual", subtitle: "Prime Cost" |
| 3 | **Period selector** | Button group | "This Week" / "Last Week" / custom |
| 4 | **Location selector** | Dropdown | Per-location or all locations |
| 5 | **Comparison table** | HTML table | Columns: Metric, Budget, Actual, Variance (amount), Variance (%) |
| 6 | **Budget column** | Money | Planned amount |
| 7 | **Actual column** | Money | Realized amount |
| 8 | **Variance amount** | Money (colored) | Actual − Budget (red if over budget) |
| 9 | **Variance %** | Pct | Variance as % of budget |
| 10 | **Favorable indicator** | Color/icon | Green = good (e.g. lower costs), Red = bad |
| 11 | **Row groups** | Section headers | Sales, Food Cost, Labor, Prime Cost |
| 12 | **Total row** | Bold | Summary variance |
| 13 | **Loading skeletons** | Shimmer | Table rows |

---

### Comparison Metrics

| Metric | Budget Source | Actual Source |
|--------|--------------|---------------|
| Total Sales | `budget.sales` | `pos.sales` |
| Food Cost $ | `budget.cogs` | `pos.cogs` |
| Food Cost % | derived | derived |
| Labor $ | `budget.labor` | `pos.labor` |
| Labor % | derived | derived |
| Prime Cost $ | `budget.cogs + budget.labor` | `pos.cogs + pos.labor` |
| Prime Cost % | derived | derived |
| GP $ | `budget.sales - budget.cogs - budget.labor` | `pos.sales - pos.cogs - pos.labor` |
| GP % | derived | derived |

---

## Screen: VarianceAttributionPage

**Route**: `/prime-cost/variance-attribution`
**Purpose**: Break down *why* the prime cost deviated from budget — isolating the contribution of each cost driver.
**Layout**: `SubScreenHeader` + donut chart + variance bucket list.

---

### Visual Elements

| # | Element | Type | Data Displayed |
|---|---------|------|----------------|
| 1 | **Back button** | Icon | Returns to hub |
| 2 | **Sub-header** | `SubScreenHeader` | Title: "Variance Attribution", subtitle: "Prime Cost" |
| 3 | **Period selector** | Button group | Week/period filter |
| 4 | **Location filter** | Dropdown | Per-location breakdown |
| 5 | **Total variance headline** | Large number | Total PC variance $ and % |
| 6 | **Donut chart** | Recharts `<PieChart>` | Shows share of variance by driver (food, labor) |
| 7 | **Variance bucket list** | Scrollable list | Each cost driver contributes X% to total variance |
| 8 | **Bucket row** | Row | Driver name, $ amount, %, bar width |
| 9 | **Favorable / Unfavorable** | Color badge | Green (saved) vs red (overspent) |
| 10 | **Stacked bar** | Horizontal bar | Visual breakdown of variance composition |
| 11 | **Contribution %** | Label | Each bucket's % share of total variance |

---

### Variance Calculation Logic

```
Total Variance = Actual Prime Cost % − Budget Prime Cost %
Driver Contribution = (Actual Driver % − Budget Driver %) × Sales Mix Weight
```

Attribution buckets typically:
- **Sales Mix Shift**: Moving sales from high-margin to low-margin items
- **Food Cost Variance**: Price vs usage breakdown
- **Labor Variance**: Rate vs hours breakdown
- **Pricing Variance**: Menu price changes effect
- **Volume Variance**: Higher/lower guest counts

---

## Screen: TrendChartPage

**Route**: `/prime-cost/trend-chart`
**Purpose**: 8-week historical view of prime cost and its components. Spots patterns, seasonality.
**Layout**: `SubScreenHeader` + Recharts line chart + legend.

---

### Visual Elements

| # | Element | Type | Data Displayed |
|---|---------|------|----------------|
| 1 | **Back button** | Icon | Returns to hub |
| 2 | **Sub-header** | `SubScreenHeader` | Title: "8-Week Trend", subtitle: "Prime Cost" |
| 3 | **Chart type toggle** | Button group | "Line" / "Bar" / "Area" |
| 4 | **Metric toggles** | Checkbox group | Toggle: Prime Cost %, Food %, Labor % |
| 5 | **Line/Area chart** | Recharts `<LineChart>` or `<AreaChart>` | 8 data points (weeks) × selected metrics |
| 6 | **X-axis** | Labels | Week labels (e.g. "W12", "W13"...) |
| 7 | **Y-axis** | % scale | 0–100% range, auto-scaled to data |
| 8 | **Hover tooltip** | Custom tooltip | Shows all metric values for that week |
| 9 | **Legend** | Bottom labels | One per toggled metric |
| 10 | **Benchmark line** | Dashed horizontal | Budget / target prime cost % |
| 11 | **Min/Max annotations** | Text | Highest and lowest week labels |
| 12 | **Download CSV** | Button | Exports 8-week data as CSV |

---

### Data Source

```typescript
usePrimeCostTrend(weeks: 8) → Array<{
  week: string;        // "W12", "W13"...
  startDate: string;   // ISO date
  endDate: string;
  primeCostPct: number;
  foodPct: number;
  laborPct: number;
  gpPct: number;
  sales: number;
}>
```

---

## Screen: LaborSchedulePage

**Route**: `/prime-cost/labor-schedule`
**Purpose**: Staffing analysis — scheduled hours vs actual hours, labor cost %, schedule efficiency.
**Layout**: `SubScreenHeader` + schedule table + labor KPI cards.

---

### Visual Elements

| # | Element | Type | Data Displayed |
|---|---------|------|----------------|
| 1 | **Back button** | Icon | Returns to hub |
| 2 | **Sub-header** | `SubScreenHeader` | Title: "Labor & Schedule", subtitle: "Prime Cost" |
| 3 | **Period selector** | Button group | This Week / Last Week / custom |
| 4 | **Location filter** | Dropdown | Per-location |
| 5 | **Labor KPI cards** | 3× `KpiCard` | Labor Cost %, Scheduled Hours, OT Hours |
| 6 | **Schedule vs Actual table** | Table | Columns: Role/Employee, Scheduled Hrs, Actual Hrs, Variance |
| 7 | **Scheduled hours column** | Number | Planned hours from scheduling system |
| 8 | **Actual hours column** | Number | Clocked hours from POS/clock-in |
| 9 | **Variance column** | Number + color | Actual − Scheduled (red = over) |
| 10 | **Daily hours grid** | Grid | 7 days × shift breakdown |
| 11 | **Overtime highlight** | Badge | Red badge on rows with >40 hrs |
| 12 | **Total row** | Bold | Sum of all columns |
| 13 | **Multi-Location button** | `NavCard`-style button | "View All Locations" → navigates to MultiLocationPage |

---

### Click Interactions

| Trigger | Action | Result |
|---------|--------|--------|
| Click "View All Locations" | `navigate('/prime-cost/multi-location')` | Renders MultiLocationPage |
| Click back | `navigate(-1)` | Returns to LaborSchedulePage or hub |

---

## Screen: MultiLocationPage

**Route**: `/prime-cost/multi-location`
**Purpose**: Aggregate and per-location prime cost breakdown. Compares performance across all locations.
**Layout**: `SubScreenHeader` + summary KPIs + location table.

---

### Visual Elements

| # | Element | Type | Data Displayed |
|---|---------|------|----------------|
| 1 | **Back button** | Icon | `navigate(-1)` → LaborSchedulePage |
| 2 | **Sub-header** | `SubScreenHeader` | Title: "Multi-Location", subtitle: "Labor & Schedule" |
| 3 | **Period selector** | Button group | This Week / Last Week |
| 4 | **Aggregate KPI cards** | 4× `KpiCard` | Total/avg across all locations |
| 5 | **Location rollup table** | Table | One row per location |
| 6 | **Location name column** | Text | Restaurant location name |
| 7 | **Sales column** | Money | Total sales per location |
| 8 | **Food % column** | Pct | Food cost % per location |
| 9 | **Labor % column** | Pct | Labor cost % per location |
| 10 | **Prime Cost % column** | Pct (colored) | Combined % per location |
| 11 | **GP % column** | Pct | Gross profit % per location |
| 12 | **Variance column** | Pct | vs budget per location |
| 13 | **Sort controls** | Clickable headers | Sort by any column ascending/descending |
| 14 | **Row hover highlight** | Hover state | Subtle bg highlight |
| 15 | **Best/Worst indicators** | Icon/badges | Highlight top and bottom performers |

---

### Data Source

```typescript
// useMultiLocationPrimeCost(locationIds: string[], week: string)
→ Array<{
    locationId: string;
    locationName: string;
    sales: number;
    foodCostPct: number;
    laborCostPct: number;
    primeCostPct: number;
    gpPct: number;
    varianceVsBudget: number;
  }>
```

---

## Shared Components Used

### KpiCard (`@/components/shared/cards/KpiCard`)
- Displays: title, formatted value, delta with direction arrow, optional icon
- States: default, loading (skeleton), with `onClick` (hover/active effects), `isLive` (pulsing dot)
- Colors: deltaDir `'up'` → emerald for favorable, `'down'` → rose for unfavorable, `'flat'` → muted

### NavCard (`@/components/shared/cards/NavCard`)
- Displays: icon with colored bg, label, description, optional count badge
- States: default, hover (scale + shadow), loading (skeleton)
- Count badge: rose pill in top-right for alerts/flags

### HubHeader (`@/components/shared/headers/HubHeader`)
- Displays: optional back arrow, icon + subtitle, large title
- States: default, `loading` (title/subtitle become shimmer skeletons)
- Used by: PrimeCostHubPage

### SubScreenHeader (`@/components/shared/headers/SubScreenHeader`)
- Displays: optional back button, subtitle + title, optional action buttons
- Sticky with backdrop blur
- Used by: all 7 sub-pages

### VarianceDonut (`@/features/prime-cost/components/VarianceDonut`)
- Recharts `<PieChart>` donut showing variance split by driver
- Center label: total variance $
- Legend below with driver names

---

## Data Hooks Summary

| Hook | Location | Returns |
|------|----------|---------|
| `useLivePrimeCost()` | Feature hook | Current week's live KPIs |
| `useForecast()` | Feature hook | Budget vs forecast comparison |
| `usePrimeCostTrend(weeks)` | Feature hook | Historical weekly trend data |
| `useWeeklyWorksheet(week, locationId)` | Feature hook | Daily breakdown for a week |
| `useBudgetVsActual(week, locationId)` | Feature hook | Budget vs actual comparison |
| `useVarianceAttribution(week, locationId)` | Feature hook | Variance driver breakdown |
| `useLaborSchedule(week, locationId)` | Feature hook | Schedule vs actual hours |
| `useMultiLocationPrimeCost(week)` | Feature hook | Per-location aggregate data |
| `useRestaurantId()` | `RestaurantProvider` | Current restaurant UUID |

---

## API Endpoints (Expected)

| Endpoint | Method | Query Params | Returns |
|----------|--------|-------------|---------|
| `/api/restaurants/{id}/prime-cost/live` | GET | `week` | Live KPI snapshot |
| `/api/restaurants/{id}/prime-cost/weekly` | GET | `week`, `locationId` | Daily worksheet |
| `/api/restaurants/{id}/prime-cost/budget` | GET | `week`, `locationId` | Budget vs actual |
| `/api/restaurants/{id}/prime-cost/variance` | GET | `week`, `locationId` | Variance attribution |
| `/api/restaurants/{id}/prime-cost/trend` | GET | `weeks` (default 8) | Historical trend |
| `/api/restaurants/{id}/prime-cost/labor` | GET | `week`, `locationId` | Labor schedule |
| `/api/restaurants/{id}/prime-cost/multi-location` | GET | `week` | All locations aggregate |

---

## 🚨 CRITICAL — Sales Mix Not Found in POS Data

**This gap was confirmed by code analysis on 2026-04-17.**

### The Problem
`WeeklyWorksheet.tsx` (lines 109–115) hardcodes the revenue category split as:

```tsx
// HARD CODED — WRONG FOR ANY REAL RESTAURANT
<Product Sales (Food)>       actualD={data.grossSales * 0.80}  actualPct={0.80}
<Support Beverage>           actualD={data.grossSales * 0.03}  actualPct={0.03}
<Refined Spirits>            actualD={data.grossSales * 0.06}  actualPct={0.06}
<Brewed Selections>          actualD={data.grossSales * 0.06}  actualPct={0.06}
<Cellar Operations>          actualD={data.grossSales * 0.04}  actualPct={0.04}
<Ancillary Revenue>          actualD={data.grossSales * 0.01}  actualPct={0.01}
```

This means the **Revenue Distribution section of the Weekly Worksheet always shows fake numbers** — every restaurant gets the same 80/3/6/6/4/1 split regardless of their actual sales mix.

### What POS Actually Has (But Is Not Being Used)

`DailySalesEntry` in `primeCost.types.ts` has **exactly the right fields**:

```typescript
interface DailySalesEntry {
  foodSales: number;
  softBevSales: number;
  liquorSales: number;
  bottleBeerSales: number;
  draftBeerSales: number;
  wineSales: number;
  merchSales: number;
  // ...
}
```

And the `WeeklyBudget` type already defines the **target percentages** for each:
```typescript
foodSalesPct: number;       // e.g. 0.75
softBevSalesPct: number;    // e.g. 0.05
liquorSalesPct: number;    // e.g. 0.10
bottleBeerSalesPct: number;
draftBeerSalesPct: number;
wineSalesPct: number;
```

The `budget?.foodSalesPct` etc. IS passed to the Budget column of the worksheet — so the Budget side is fine. The **Actual column** is what's broken.

### Root Cause
`WeeklyPrimeCostReport` type (returned by `GET /weekly?weekStart=`) does **not include a `categorySalesBreakdown` field** — the backend aggregates COGS and labor but not the sales category split. The component works around this by hardcoding percentages of `grossSales`.

### Fix Required — Two Parts

#### Part 1: Backend (`WeeklyPrimeCostReport` + Service)
The `WeeklyPrimeCostReport` type needs a new field:
```typescript
categorySalesBreakdown: {
  foodSales: number;
  softBevSales: number;
  liquorSales: number;
  bottleBeerSales: number;
  draftBeerSales: number;
  wineSales: number;
  merchSales: number;
}
```
Populated by aggregating `DailySalesEntry` rows for the week (source: `"POS"` rows only).

#### Part 2: Frontend (`WeeklyWorksheet.tsx`)
Replace hardcoded rows with real data:
```tsx
// BEFORE (broken)
<DataRow label="Product Sales (Food)"
  actualD={data.grossSales * 0.80} actualPct={0.80}
  budgetD={budget.totalSalesForecast * budget.foodSalesPct}
  budgetPct={budget.foodSalesPct}
/>

// AFTER (correct)
<DataRow label="Product Sales (Food)"
  actualD={data.categorySalesBreakdown?.foodSales ?? data.grossSales * (budget?.foodSalesPct ?? 0.80)}
  actualPct={data.categorySalesBreakdown
    ? data.categorySalesBreakdown.foodSales / data.grossSales
    : (budget?.foodSalesPct ?? 0.80)}
  budgetD={budget.totalSalesForecast * budget.foodSalesPct}
  budgetPct={budget.foodSalesPct}
/>
```
With graceful fallback: if backend hasn't been updated yet, use `budget.foodSalesPct` as the fallback ratio.

---

## Known Gaps & Issues

| # | Issue | Severity | Status | Notes |
|---|-------|---------|--------|-------|
| 1 | **Sales mix hardcoded in WeeklyWorksheet** | **CRITICAL** | 🚨 Confirmed — POS data exists but not wired | `DailySalesEntry` has all 6 category fields; backend needs to aggregate into `WeeklyPrimeCostReport` |
| 2 | No error state in hub | **Medium** | Open | Should show `ErrorState` if `useLivePrimeCost` throws |
| 3 | Multi-location route not in routes.ts | **Low** | Open | Exists at `/prime-cost/multi-location` but not in route manifest |
| 4 | No data export on most pages | **Low** | Open | Only TrendChartPage has CSV export |
| 5 | Refresh interval not configurable | **Low** | Open | Live dashboard polls every 5min — interval should be user-configurable |
| 6 | Budget period alignment | **Medium** | Open | Budget may be weekly but POS data may be daily — need alignment |

---

*End of requirements-primecost.md*
