# Menu Engineering — Screen ↔ API Mapping

**All API paths are relative to:** `/api/v1/restaurants/{restaurantId}/menu-engineering`  
**Base URL constructed by:** `api/menuEngineering.api.ts` → `base(restaurantId)`  

---

## Quick Reference Table

| Screen ID | Screen File | Hook / API Function | HTTP Method | Full API Path | React Query Key |
|-----------|-------------|---------------------|-------------|---------------|-----------------|
| **ME.0** | `pages/EngineeringHubPage.tsx` | `usePeriods(restaurantId)` | `GET` | `/restaurants/{rId}/menu-engineering/analyses` | `["engineering", rId, "periods"]` |
| **ME.1** | `pages/PeriodSetupPage.tsx` | `useCreatePeriod(restaurantId)` → `createPeriod.mutateAsync(body)` | `POST` | `/restaurants/{rId}/menu-engineering/analyses` | mutation → invalidates `["engineering", rId, "periods"]` |
| **ME.1** | `pages/PeriodSetupPage.tsx` | `useRunAnalysis(restaurantId)` → `runAnalysisMut.mutateAsync(periodId)` | `POST` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/run` | mutation → invalidates `["engineering", rId, "period", pId]` + `["engineering", rId, "periods"]` |
| **ME.1** | `components/CreateAnalysisModal.tsx` | Same as ME.1 (reuses `useCreatePeriod` + `useRunAnalysis`) | — | — | — |
| **ME.2** | `pages/PeriodDetailPage.tsx` | `usePeriodDetail(restaurantId, periodId)` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}` | `["engineering", rId, "period", pId]` |
| **ME.2** | `pages/PeriodDetailPage.tsx` | `useResults(restaurantId, periodId)` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/results` | `["engineering", rId, "period", pId, "results"]` |
| **ME.2** | `pages/PeriodDetailPage.tsx` | `useSummary(restaurantId, periodId)` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/summary` | `["engineering", rId, "period", pId, "summary"]` |
| **ME.2** | `pages/PeriodDetailPage.tsx` | `useCategorySummary(restaurantId, periodId)` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/categories` | `["engineering", rId, "period", pId, "categories"]` |
| **ME.2** | `components/FinalisePeriodModal.tsx` | `useFinalisePeriod(restaurantId)` → `finaliseMutation.mutateAsync(periodId)` | `POST` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/finalise` | mutation → invalidates period + periods |
| **ME.4** | `components/QuadrantMatrix.tsx` | Uses `useResults` + `useSummary` (from ME.2 parent) | — | — | — |
| **ME.3** | `components/ResultsTable.tsx` | Uses `useResults` (from ME.2 parent, passed as prop) | — | — | — |
| **ME.5** | `components/CategorySummaryTable.tsx` | Uses `useCategorySummary` (from ME.2 parent, passed as prop) | — | — | — |
| **ME.6** | `pages/LiveSalesCounterPage.tsx` | `useLiveSales(restaurantId)` | `GET` | `/restaurants/{rId}/menu-engineering/live` | `["engineering", rId, "live"]` (refetchInterval: 60000) |
| **ME.7** | `pages/PeriodHistoryPage.tsx` | `usePeriods(restaurantId)` | `GET` | `/restaurants/{rId}/menu-engineering/analyses` | `["engineering", rId, "periods"]` |
| **ME.7** | `pages/PeriodHistoryPage.tsx` | `useDeletePeriod(restaurantId)` → `deleteMutation.mutateAsync(periodId)` | `DELETE` | `/restaurants/{rId}/menu-engineering/analyses/{pId}` | mutation → invalidates `["engineering", rId, "periods"]` |
| **ME.8** | `pages/WhatIfSimulatorPage.tsx` | `useResults(restaurantId, periodId)` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/results` | `["engineering", rId, "period", pId, "results"]` |
| **ME.8** | `pages/WhatIfSimulatorPage.tsx` | `useSummary(restaurantId, periodId)` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/summary` | `["engineering", rId, "period", pId, "summary"]` |
| **ME.8** | `pages/WhatIfSimulatorPage.tsx` | `useWhatIf(restaurantId, periodId, overrides)` | `GET` (query key includes overrides) | `/restaurants/{rId}/menu-engineering/analyses/{pId}/whatif` | `["engineering", rId, "period", pId, "whatif", overrides]` |
| **ME.8** | `components/ApplyChangesModal.tsx` | `useApplyWhatIf(restaurantId, periodId)` → `applyMutation.mutateAsync(overrides)` | `POST` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/apply-whatif` | mutation → invalidates results + summary + period |
| **ME.9** | `pages/PeriodComparisonPage.tsx` | `usePeriods(restaurantId)` | `GET` | `/restaurants/{rId}/menu-engineering/analyses` | `["engineering", rId, "periods"]` |
| **ME.9** | `pages/PeriodComparisonPage.tsx` | `useComparison(restaurantId, p1, p2)` | `GET` | `/restaurants/{rId}/menu-engineering/comparison?period1={p1}&period2={p2}` | `["engineering", rId, "comparison", p1, p2]` |
| **ME.10** | `components/ItemDrillDownSlideOver.tsx` | `useItemMetrics(restaurantId, menuItemId, periodId)` | `GET` | `/restaurants/{rId}/menu-engineering/items/{mId}/metrics?periodId={pId}` | `["engineering", rId, "item", mId, "metrics", pId]` |
| **ME.10** | `components/ItemDrillDownSlideOver.tsx` | `useRecommendations(restaurantId, periodId, menuItemId)` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/recommendations?menuItemId={mId}` | `["engineering", rId, "period", pId, "recs", mId]` |
| **ME.11** | `components/RecommendationPanel.tsx` | `useRecommendations(restaurantId, periodId, menuItemId)` | `GET` | same as ME.10 | same as ME.10 |
| **ME.11** | `components/RecommendationPanel.tsx` | `useUpdateRecommendationStatus(restaurantId, periodId)` → `updateStatus.mutateAsync({recommendationId, status})` | `PATCH` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/recommendations/{rId}` | mutation → invalidates recommendations |
| **ME.12** | `components/CreateAnalysisModal.tsx` | Same hooks as ME.1 (`useCreatePeriod` + `useRunAnalysis`) | — | — | — |
| **ME.13** | `components/ApplyChangesModal.tsx` | `useApplyWhatIf` (called by ME.8 parent) | — | — | — |
| **ME.14** | `components/HistoricalDeltaModal.tsx` | No direct API call (uses data from ME.9 `useComparison`) | — | — | — |
| **ME.15** | `components/FinalisePeriodModal.tsx` | `useFinalisePeriod` (called by ME.2/ME.7 parent) | — | — | — |

---

## Detailed Per-Screen Breakdown

---

### ME.0 — EngineeringHubPage

**File:** `pages/EngineeringHubPage.tsx`

| # | Hook | API Function | Method | Path | Trigger |
|---|------|-------------|--------|------|---------|
| 1 | `usePeriods(restaurantId)` | `listPeriods` | `GET` | `/restaurants/{rId}/menu-engineering/analyses` | On mount (auto) |

**User Actions → API Calls:**
- Click "New Analysis" nav card → navigates to ME.1 (no API call)
- Click "New Analysis" top button → opens `CreateAnalysisModal` (ME.12)
- Click "Latest Results" nav card → navigates to ME.2 (no API call here — ME.2 fetches its own data)
- Click "Live Sales" nav card → navigates to ME.6
- Click "Period History" nav card → navigates to ME.7
- Click "Compare Periods" nav card → navigates to ME.9
- Click "What-If Simulator" nav card → navigates to ME.8 (via ME.2)
- Click period row → navigates to ME.2 with `periodId`

---

### ME.1 — PeriodSetupPage

**File:** `pages/PeriodSetupPage.tsx`

| # | Hook | API Function | Method | Path | Trigger |
|---|------|-------------|--------|------|---------|
| 1 | `useCreatePeriod(restaurantId)` | `createPeriod` | `POST` | `/restaurants/{rId}/menu-engineering/analyses` | "Run Analysis" button click |
| 2 | `useRunAnalysis(restaurantId)` | `runAnalysis` | `POST` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/run` | Automatically after create succeeds |

**Request Body (createPeriod):**
```json
{
  "restaurantId": 1,
  "costGroupId": null,        // optional, null = all groups
  "periodBeginDate": "2025-01-01",
  "periodEndDate": "2025-03-31",
  "popularityFactor": 0.80    // optional, defaults to 0.80
}
```

---

### ME.2 — PeriodDetailPage

**File:** `pages/PeriodDetailPage.tsx`

| # | Hook | API Function | Method | Path | Trigger |
|---|------|-------------|--------|------|---------|
| 1 | `usePeriodDetail(restaurantId, periodId)` | `getPeriod` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}` | On mount |
| 2 | `useResults(restaurantId, periodId)` | `getResults` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/results` | On mount |
| 3 | `useSummary(restaurantId, periodId)` | `getSummary` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/summary` | On mount |
| 4 | `useCategorySummary(restaurantId, periodId)` | `getCategorySummary` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/categories` | On tab switch to Categories |
| 5 | `useFinalisePeriod(restaurantId)` | `finalisePeriod` | `POST` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/finalise` | "Finalise" button click → modal confirm |

---

### ME.6 — LiveSalesCounterPage

**File:** `pages/LiveSalesCounterPage.tsx`

| # | Hook | API Function | Method | Path | Trigger |
|---|------|-------------|--------|------|---------|
| 1 | `useLiveSales(restaurantId)` | `getLiveSales` | `GET` | `/restaurants/{rId}/menu-engineering/live` | On mount, auto-refetch every 60s |

---

### ME.7 — PeriodHistoryPage

**File:** `pages/PeriodHistoryPage.tsx`

| # | Hook | API Function | Method | Path | Trigger |
|---|------|-------------|--------|------|---------|
| 1 | `usePeriods(restaurantId)` | `listPeriods` | `GET` | `/restaurants/{rId}/menu-engineering/analyses` | On mount |
| 2 | `useDeletePeriod(restaurantId)` | `deletePeriod` | `DELETE` | `/restaurants/{rId}/menu-engineering/analyses/{pId}` | Row menu → "Delete" → confirm modal |

---

### ME.8 — WhatIfSimulatorPage

**File:** `pages/WhatIfSimulatorPage.tsx`

| # | Hook | API Function | Method | Path | Trigger |
|---|------|-------------|--------|------|---------|
| 1 | `useResults(restaurantId, periodId)` | `getResults` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/results` | On mount |
| 2 | `useSummary(restaurantId, periodId)` | `getSummary` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/summary` | On mount |
| 3 | `useWhatIf(restaurantId, periodId, overrides)` | `runWhatIf` | `POST` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/whatif` | Auto-fetches when `overrides.length > 0` |
| 4 | `useApplyWhatIf(restaurantId, periodId)` | `applyWhatIf` | `POST` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/apply-whatif` | "Apply Changes" button → modal confirm |

**Request Body (runWhatIf / applyWhatIf):**
```json
{
  "overrides": [
    { "menuItemId": 42, "newSellPrice": 14.99 },
    { "menuItemId": 17, "newSellPrice": 22.00 }
  ]
}
```

---

### ME.9 — PeriodComparisonPage

**File:** `pages/PeriodComparisonPage.tsx`

| # | Hook | API Function | Method | Path | Trigger |
|---|------|-------------|--------|------|---------|
| 1 | `usePeriods(restaurantId)` | `listPeriods` | `GET` | `/restaurants/{rId}/menu-engineering/analyses` | On mount (populates period selectors) |
| 2 | `useComparison(restaurantId, p1, p2)` | `getComparison` | `GET` | `/restaurants/{rId}/menu-engineering/comparison?period1={p1}&period2={p2}` | When both period selectors are filled |

---

### ME.10 — ItemDrillDownSlideOver

**File:** `components/ItemDrillDownSlideOver.tsx`

| # | Hook | API Function | Method | Path | Trigger |
|---|------|-------------|--------|------|---------|
| 1 | `useItemMetrics(restaurantId, menuItemId, periodId)` | `getItemMetrics` | `GET` | `/restaurants/{rId}/menu-engineering/items/{mId}/metrics?periodId={pId}` | On slide-over open |
| 2 | `useRecommendations(restaurantId, periodId, menuItemId)` | `getRecommendations` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/recommendations?menuItemId={mId}` | On slide-over open |

---

### ME.11 — RecommendationPanel

**File:** `components/RecommendationPanel.tsx`

| # | Hook | API Function | Method | Path | Trigger |
|---|------|-------------|--------|------|---------|
| 1 | `useRecommendations(restaurantId, periodId, menuItemId)` | `getRecommendations` | `GET` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/recommendations?menuItemId={mId}` | On panel open |
| 2 | `useUpdateRecommendationStatus(restaurantId, periodId)` | `updateRecommendationStatus` | `PATCH` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/recommendations/{rId}` | "Start" / "Done" / "Dismiss" button click |

**Request Body (updateRecommendationStatus):**
```json
{ "status": "IN_PROGRESS" | "COMPLETED" | "DISMISSED" }
```

---

### ME.12 — CreateAnalysisModal

**File:** `components/CreateAnalysisModal.tsx`

| # | Hook | API Function | Method | Path | Trigger |
|---|------|-------------|--------|------|---------|
| 1 | `useCreatePeriod(restaurantId)` | `createPeriod` | `POST` | `/restaurants/{rId}/menu-engineering/analyses` | "Create & Run" button |
| 2 | `useRunAnalysis(restaurantId)` | `runAnalysis` | `POST` | `/restaurants/{rId}/menu-engineering/analyses/{pId}/run` | Auto after create succeeds |

---

### ME.13 — ApplyChangesModal

**File:** `components/ApplyChangesModal.tsx`

No direct API call — parent (`WhatIfSimulatorPage`) passes `onConfirm` which calls `useApplyWhatIf`.

---

### ME.14 — HistoricalDeltaModal

**File:** `components/HistoricalDeltaModal.tsx`

No direct API call — consumes `ComparisonDto` data passed as prop from `PeriodComparisonPage`.

---

### ME.15 — FinalisePeriodModal

**File:** `components/FinalisePeriodModal.tsx`

No direct API call — parent (`PeriodDetailPage` or `PeriodHistoryPage`) passes `onConfirm` which calls `useFinalisePeriod`.

---

## Unused API Functions (defined in `api/menuEngineering.api.ts` but not yet called from any screen)

| API Function | Method | Path | Note |
|-------------|--------|------|------|
| `getMatrix` | `GET` | `/analyses/{pId}/matrix` | Currently ME.2/ME.4 uses `getResults` for scatter data — matrix endpoint available if backend provides aggregated quadrant data |
| `exportResults` | `GET` | `/analyses/{pId}/export?format=csv` | Not yet wired to UI "Export" button in ME.3 |

---

## React Query Key Map

```
engineeringKeys.all(restaurantId)                                   →  ["engineering", restaurantId]
engineeringKeys.periods(restaurantId)                               →  ["engineering", restaurantId, "periods"]
engineeringKeys.period(restaurantId, periodId)                      →  ["engineering", restaurantId, "period", periodId]
engineeringKeys.results(restaurantId, periodId)                    →  ["engineering", restaurantId, "period", periodId, "results"]
engineeringKeys.summary(restaurantId, periodId)                    →  ["engineering", restaurantId, "period", periodId, "summary"]
engineeringKeys.categories(restaurantId, periodId)                 →  ["engineering", restaurantId, "period", periodId, "categories"]
engineeringKeys.live(restaurantId)                                  →  ["engineering", restaurantId, "live"]
engineeringKeys.whatIf(restaurantId, periodId)                      →  ["engineering", restaurantId, "period", periodId, "whatif"]
engineeringKeys.comparison(restaurantId, p1, p2)                     →  ["engineering", restaurantId, "comparison", p1, p2]
engineeringKeys.recommendations(restaurantId, periodId, itemId?)     →  ["engineering", restaurantId, "period", periodId, "recs", itemId]
engineeringKeys.itemMetrics(restaurantId, itemId, periodId)         →  ["engineering", restaurantId, "item", itemId, "metrics", periodId]
```