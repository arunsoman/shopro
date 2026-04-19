# Menu Engineering — Backend API Contract Extraction

**Controller:** `EngineeringController.java`  
**Source:** All service methods + entity builders  

---

## 1. Endpoint → Method → Response Shape

### Group A: Core UI Endpoints (already wired, need contract fixes)

| # | Method | Path | BE Service Method | Response Shape |
|---|--------|------|-------------------|---------------|
| 1 | `GET` | `/analyses` | `periodService.getPeriods()` | `List<PeriodSummaryMap>` |
| 2 | `GET` | `/analyses/{periodId}` | `periodService.getPeriodSummary()` | `PeriodDetailMap` |
| 3 | `GET` | `/analyses/{periodId}/results` | `periodService.getPeriodResults()` | `List<MenuEngResult>` |
| 4 | `GET` | `/analyses/{periodId}/summary` | `periodService.getExecutiveSummary()` | `ExecutiveSummaryMap` |
| 5 | `GET` | `/analyses/{periodId}/categories` | `periodService.getCategoryDistribution()` | `List<CategoryDistributionMap>` |
| 6 | `GET` | `/analyses/{periodId}/recommendations` | `recommendationService.getRecommendationsForPeriod()` | `List<RecommendationEntity>` |
| 7 | `POST` | `/analyses/{periodId}/finalise` | `periodService.finalisePeriod()` | `{periodId, status, message}` |
| 8 | `GET` | `/live` | `periodService.getLiveSalesData()` | `LiveSalesSummaryMap` |
| 9 | `POST` | `/analyses/{periodId}/whatif` | `periodService.runWhatIfSimulation()` | `WhatIfSimulationMap` |
| 10 | `POST` | `/analyses/{periodId}/apply-whatif` | `periodService.applyWhatIfChanges()` | `{periodId, changesApplied, message}` |
| 11 | `GET` | `/comparison?period1=&period2=` | `periodService.comparePeriods()` | `ComparisonMap` |

---

### Group B: Period CRUD (needs wiring)

| # | Method | Path | Request Body | Response |
|---|--------|------|-------------|----------|
| 12 | `POST` | `/periods` | `{periodName, startDate, endDate}` | `MenuEngineeringPeriod` entity |
| 13 | `GET` | `/periods` | — | `List<PeriodSummaryMap>` (alias of #1) |
| 14 | `GET` | `/periods/{periodId}/results` | — | `List<MenuEngResult>` (alias of #3) |
| 15 | `GET` | `/periods/{periodId}/summary` | — | `PeriodDetailMap` (alias of #2) |
| 16 | `POST` | `/periods/{periodId}/run` | — | `MenuEngineeringPeriod` entity |
| 17 | `POST` | `/periods/{periodId}/simulate` | `{itemId: newQty, ...}` optional | `List<MenuEngResult>` |
| 18 | `POST` | `/periods/compare` | `{periodIds: [p1, p2]}` | `ComparisonMap` |

---

### Group C: Recommendation Workflow

| # | Method | Path | Request Body | Response |
|---|--------|------|-------------|----------|
| 19 | `GET` | `/recommendations` | — | `List<RecommendationEntity>` |
| 20 | `GET` | `/recommendations?status=` | — | filtered `List<RecommendationEntity>` |
| 21 | `GET` | `/recommendations/classification/{cls}` | — | `List<RecommendationEntity>` |
| 22 | `GET` | `/recommendations/status/{status}` | — | `List<RecommendationEntity>` |
| 23 | `GET` | `/recommendations/priority/{priority}` | — | `List<RecommendationEntity>` |
| 24 | `GET` | `/recommendations/overdue` | — | `List<RecommendationEntity>` |
| 25 | `GET` | `/recommendations/workflow/stats` | — | `WorkflowStatsMap` |
| 26 | `PATCH` | `/recommendations/{id}` | `{assignedTo?, dueDate?, comment?, status?}` | `RecommendationEntity` |
| 27 | `PATCH` | `/recommendations/{id}/status` | `{status: string}` | `RecommendationEntity` |
| 28 | `PATCH` | `/recommendations/{id}/assign` | `{assignedTo: string}` | `RecommendationEntity` |
| 29 | `PATCH` | `/recommendations/{id}/due-date` | `{dueDate: string}` | `RecommendationEntity` |
| 30 | `PATCH` | `/recommendations/{id}/comment` | `{comment: string}` | `RecommendationEntity` |
| 31 | `POST` | `/recommendations/{id}/submit` | — | `RecommendationEntity` |
| 32 | `POST` | `/recommendations/{id}/approve` | `{approvedBy, comment}` | `RecommendationEntity` |
| 33 | `POST` | `/recommendations/{id}/reject` | `{rejectedBy, reason}` | `RecommendationEntity` |

---

### Group D: Reporting & Analytics

| # | Method | Path | Response |
|---|--------|------|----------|
| 34 | `GET` | `/periods/{periodId}/summary/executive` | `ExecutiveSummaryMap` |
| 35 | `GET` | `/periods/{periodId}/visualization/matrix` | `MatrixVisualizationMap` |
| 36 | `GET` | `/periods/{periodId}/report/category-distribution` | `List<CategoryDistributionMap>` |
| 37 | `GET` | `/periods/{periodId}/report/top-performers?limit=10` | `List<TopPerformerMap>` |
| 38 | `GET` | `/periods/{periodId}/report/opportunities` | `List<OpportunityItemMap>` |
| 39 | `GET` | `/periods/{periodId}/export` | `ExportDataMap` |
| 40 | `GET` | `/periods/{periodId}/analysis/food-cost-comparison` | `FoodCostComparisonMap` |
| 41 | `GET` | `/periods/{periodId}/analysis/ingredient-cost-drivers` | `List<IngredientDriverMap>` |
| 42 | `GET` | `/periods/{periodId}/analysis/price-elasticity` | `List<PriceElasticityMap>` |
| 43 | `GET` | `/periods/{periodId}/analysis/market-basket` | `MarketBasketMap` |
| 44 | `GET` | `/periods/{periodId}/analysis/server-performance` | `ServerPerformanceMap` |
| 45 | `GET` | `/periods/{periodId}/analysis/demand-forecast` | `List<DemandForecastMap>` |

---

### Group E: Dashboard & Utilities

| # | Method | Path | Response |
|---|--------|------|----------|
| 46 | `GET` | `/dashboard` | `DashboardMap` |
| 47 | `GET` | `/matrix` | `MatrixVisualizationMap` |
| 48 | `GET` | `/recommendations/all?status=&classification=&priority=&limit=50` | `AllRecommendationsMap` |
| 49 | `GET` | `/items/{itemId}/metrics` | `ItemMetricsMap` |
| 50 | `GET` | `/export/quick?format=json` | `QuickExportMap` |
| 51 | `GET` | `/export/data?format=json` | `ExportDataMap` |
| 52 | `GET` | `/reviews/quarterly` | `QuarterlyScheduleMap` |
| 53 | `GET` | `/reviews/reminders` | `List<ReminderMap>` |
| 54 | `GET` | `/integrations/recipe-status` | `IntegrationStatusMap` |
| 55 | `GET` | `/integrations/inventory-status` | `IntegrationStatusMap` |
| 56 | `GET` | `/integrations/notifications` | `NotificationSettingsMap` |
| 57 | `GET` | `/webhooks/analysis-completed` | `WebhookConfigMap` |
| 58 | `GET` | `/webhooks/classification-changed` | `WebhookConfigMap` |
| 59 | `POST` | `/simulate/orders` | `{days, startDate, totalOrders, totalRevenue, message}` |
| 60 | `POST` | `/periods/{periodId}/recommendations/generate` | `List<RecommendationEntity>` |
| 61 | `POST` | `/periods/{periodId}/recommendations/menu-design` | `List<RecommendationEntity>` |
| 62 | `POST` | `/analyze/by-category` | `List<CategoryAnalysisResult>` |
| 63 | `POST` | `/analyze` | `{quantitiesSold: [], popularityFactor: 0.70}` → `List<MenuEngResult>` |

---

## 2. Response Type Definitions

---

### `MenuEngResult` — Core analysis row
```typescript
interface MenuEngResult {
  itemName: string;
  itemId: number;          // Long → number
  categoryId: number;       // Long → number
  categoryName: string;
  daypart: string;          // "BREAKFAST" | "LUNCH" | "DINNER" | "LATE_NIGHT" | "ALL"
  quantitySold: number;
  itemCost: number;         // BigDecimal → number
  sellPrice: number;        // BigDecimal → number
  contributionMargin: number; // BigDecimal → number  ← DIFFERENT from FE spec (uses "itemGrossProfit")
  foodCostPct: number;     // BigDecimal → number
  grossProfit: number;      // BigDecimal → number
  salesMixPct: number;      // BigDecimal → number
  classification: MenuEngClassification; // WINNER | WORKHORSE | OPPORTUNITY | LOSER
}
```

---

### `MenuEngineeringPeriod` — Period entity
```typescript
interface MenuEngineeringPeriod {
  id: number;
  restaurantId: number;
  periodName: string;       // ← DIFFERENT: FE uses "periodBeginDate/periodEndDate", BE uses "periodName + startDate/endDate"
  startDate: string;       // yyyy-MM-dd
  endDate: string;          // yyyy-MM-dd
  popularityFactor?: number; // NOT in BE entity directly (comes from settings)
  status: AnalysisStatus;   // DRAFT | COMPLETE | FINALIZED
  createdAt: string;        // ISO datetime
  runAt?: string;          // ISO datetime
  // NOTE: BE entity has NO winnerCount/workhorseCount/opportunityCount/loserCount/itemCount fields
  // FE spec adds these but BE computes them dynamically from resultsJson
  resultsJson?: string;     // NOT exposed directly — computed via getPeriodResults()
}
```

---

### `RecommendationEntity` — Recommendation record
```typescript
interface RecommendationEntity {
  id: string;              // UUID → string  ← DIFFERENT: FE uses number, BE uses UUID
  restaurantId: number;
  menuItemId: number;
  periodId: number;
  classification: MenuEngClassification;
  recommendationType: RecommendationType; // RETAIN | PROTECT | FEATURE | INCREASE_VISIBILITY | ENHANCE_DESCRIPTION | TRAIN_STAFF | REPRICE_UP | REDUCE_PORTION_COST | BUNDLE | INVESTIGATE | SEASONAL_ONLY | REMOVE | HIGHLIGHT
  priority: RecommendationPriority;        // HIGH | MEDIUM | LOW   ← NOT in FE spec
  status: RecommendationStatus;             // PENDING | IN_PROGRESS | COMPLETED | DISMISSED | PENDING_APPROVAL | APPROVED | REJECTED
  title: string;
  description: string;
  actionPlan?: string;     // ← NOT in FE spec
  projectedImpactRevenue?: number;
  projectedImpactProfit?: number;
  estimatedImplementationCost?: number;
  assignedTo?: string;
  dueDate?: string;        // ISO datetime
  comment?: string;        // newline-joined comments
  createdAt: string;       // ISO datetime
  updatedAt?: string;      // ISO datetime  ← NOT in FE spec
  completedAt?: string;    // ISO datetime
  approvedBy?: string;    // ← NOT in FE spec
  approvedAt?: string;    // ← NOT in FE spec
  approvalComment?: string; // ← NOT in FE spec
}
```

---

### `PeriodSummaryMap` — List of periods (GET /periods, GET /analyses)
```typescript
interface PeriodSummaryMap {
  id: number;
  periodName: string;
  startDate: string;        // yyyy-MM-dd
  endDate: string;          // yyyy-MM-dd
  status: string;           // "DRAFT" | "COMPLETE" | "FINALIZED"
  runAt: string | null;    // ISO datetime
  // NOTE: NO winnerCount/workhorseCount/opportunityCount/loserCount/itemCount in BE response
  // FE spec adds these — they must be derived from getPeriodResults() count
}
```

---

### `PeriodDetailMap` — Single period detail (GET /analyses/{id}, GET /periods/{id}/summary)
```typescript
interface PeriodDetailMap {
  periodId: number;
  totalSold: number;        // ← DIFFERENT: FE uses "totalQuantitySold"
  totalRevenue: number;     // BigDecimal
  totalCost: number;        // BigDecimal
  totalProfit: number;      // BigDecimal
  avgFoodCostPct: number;   // ← DIFFERENT: FE uses "weightedAvgGrossProfit"
  winnerCount: number;
  workhorseCount: number;
  opportunityCount: number;
  loserCount: number;
  // NOTE: no "popularityThreshold" in BE response
}
```

---

### `ExecutiveSummaryMap` — Executive summary (GET /analyses/{id}/summary, GET /periods/{id}/summary/executive)
```typescript
interface ExecutiveSummaryMap {
  periodId: number;
  periodName: string;
  reportDate: string;
  kpis: {
    totalItems: number;
    totalSold: number;
    totalRevenue: number;       // scale 2
    totalCost: number;         // scale 2
    totalProfit: number;       // scale 2
    avgFoodCostPct: number;    // scale 1
    avgContributionMargin: number; // scale 2
    avgSellPrice: number;      // scale 2
  };
  classificationBreakdown: {
    [key in MenuEngClassification]: {
      count: number;
      percentage: number;
    }
  };
  menuHealthScore: number;    // 0-100
  healthStatus: string;       // "EXCELLENT" | "GOOD" | "FAIR" | "NEEDS_ATTENTION"
}
```

---

### `LiveSalesSummaryMap` — Live sales (GET /live)
```typescript
interface LiveSalesSummaryMap {
  totalOrders: number;
  totalItems: number;
  totalRevenue: number;
  averageOrderValue: number;
  lastUpdated: string;        // ISO datetime
  // NOTE: BE does NOT return per-item breakdown. Item drill-down is not yet implemented.
  // FE spec has LiveSalesCountDto[] which is NOT what the backend returns.
}
```

---

### `WhatIfSimulationMap` — What-if simulation (POST /analyses/{id}/whatif)
```typescript
interface WhatIfSimulationMap {
  originalResults: MenuEngResult[];
  simulatedResults: MenuEngResult[];   // Currently same as original (placeholder)
  overridesApplied: number;
  message: string;
}
```

---

### `ComparisonMap` — Period comparison (GET /comparison, POST /periods/compare)
```typescript
interface ComparisonMap {
  comparison: PeriodDetailMap[];   // Array of 2 period summaries side by side
}
```

---

### `CategoryDistributionMap` — Category breakdown (GET /analyses/{id}/categories)
```typescript
interface CategoryDistributionMap {
  category: string;
  itemCount: number;
  totalSold: number;
  totalRevenue: number;         // scale 2
  totalProfit: number;         // scale 2
  avgMargin: number;            // scale 2
  classification: {
    WINNER: number;
    WORKHORSE: number;
    OPPORTUNITY: number;
    LOSER: number;
  };
  // NOTE: no "avgFoodCostPct" in BE response
}
```

---

### `MatrixVisualizationMap` — Quadrant matrix (GET /matrix, GET /periods/{id}/visualization/matrix)
```typescript
interface MatrixVisualizationMap {
  quadrants: {
    WINNER: MatrixItem[];
    WORKHORSE: MatrixItem[];
    OPPORTUNITY: MatrixItem[];
    LOSER: MatrixItem[];
  };
  totals: {
    [quadrant: string]: {
      count: number;
      totalRevenue: number;
      totalSold: number;
    };
  };
  axisLabels: { x: string; y: string; };
  // If no data: { error: "No data available" }
}

interface MatrixItem {
  itemId: number;
  itemName: string;
  quantitySold: number;
  revenue: number;
  contributionMargin: number;
  foodCostPct: number;
}
```

---

### `WorkflowStatsMap` — Workflow stats (GET /recommendations/workflow/stats)
```typescript
interface WorkflowStatsMap {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdueCount: number;
  pendingApprovalCount: number;
}
```

---

### `DashboardMap` — Main dashboard (GET /dashboard)
```typescript
interface DashboardMap {
  hasData: boolean;
  message?: string;
  periodId?: number;
  periodName?: string;
  kpis?: any;                    // from executive summary
  menuHealthScore?: number;
  healthStatus?: string;
  classificationBreakdown?: any;
  quickStats: {
    totalPeriods: number;
    lastAnalysisDate: string | null;
    totalRecommendations: number;
    recommendationsPending: number;
    recommendationsInProgress: number;
    recommendationsCompleted: number;
  };
  topOpportunities: OpportunityItemMap[];
  topPerformers: TopPerformerMap[];
  reminders: ReminderMap[];
}
```

---

### `TopPerformerMap` — Top performers (GET /periods/{id}/report/top-performers)
```typescript
interface TopPerformerMap {
  rank: number;                  // set by index (0-based in BE, FE may want 1-based)
  itemId: number;
  itemName: string;
  category: string;
  classification: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  contributionMargin: number;
  foodCostPct: number;
}
```

---

### `OpportunityItemMap` — Opportunity items (GET /periods/{id}/report/opportunities)
```typescript
interface OpportunityItemMap {
  itemId: number;
  itemName: string;
  category: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  contributionMargin: number;
  foodCostPct: number;
  potentialRevenueIncrease: number;
}
```

---

### `ItemMetricsMap` — Item drill-down (GET /items/{itemId}/metrics)
```typescript
interface ItemMetricsMap {
  itemId: number;
  itemName: string;
  category: string;
  sellPrice: number;
  itemCost: number;
  contributionMargin: number;
  foodCostPercentage: number;
  historicalAnalysis: {
    periodId: number;
    periodName: string;
    quantitySold: number;
    revenue: number;
    classification: string;
    contributionMargin: number;
    foodCostPct: number;
  }[];
  recommendations: RecommendationEntity[];
  recommendationCount: number;
}
```

---

### `AllRecommendationsMap` — All recommendations (GET /recommendations/all)
```typescript
interface AllRecommendationsMap {
  total: number;
  returned: number;
  limit: number;
  recommendations: RecommendationEntity[];
  summaryByStatus: Record<string, number>;
}
```

---

### `QuarterlyScheduleMap` — Quarterly reviews (GET /reviews/quarterly)
```typescript
interface QuarterlyScheduleMap {
  currentQuarter: string;       // "Q1 2026"
  quarters: {
    quarter: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    isPast: boolean;
  }[];
  lastAnalysisDate: string | null;
}
```

---

### `ReminderMap` — Reminders (GET /reviews/reminders)
```typescript
interface ReminderMap {
  type: string;                 // "QUARTERLY_ANALYSIS" | "OVERDUE_RECOMMENDATIONS" | "PENDING_APPROVALS"
  title: string;
  description: string;
  dueDate: string;
  priority: string;             // "HIGH" | "MEDIUM" | "CRITICAL"
  actionUrl?: string;
  count?: number;
}
```

---

### `CategoryAnalysisResult` — By-category analysis (POST /analyze/by-category)
```typescript
interface CategoryAnalysisResult {
  categoryId: number;
  categoryName: string;
  itemCount: number;
  totalQuantitySold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  avgFoodCostPct: number;
  avgContributionMargin: number;
  winnerCount: number;
  opportunityCount: number;
  workhorseCount: number;
  loserCount: number;
  items: MenuEngResult[];
}
```

---

### `FoodCostComparisonMap` — Food cost comparison (GET /periods/{id}/analysis/food-cost-comparison)
```typescript
interface FoodCostComparisonMap {
  periodId: number;
  items: {
    itemId: number;
    itemName: string;
    quantitySold: number;
    theoreticalCostPerUnit: number;
    actualCostPerUnit: number;
    costVariance: number;
    variancePercentage: number;
    totalVariance: number;
  }[];
  summary: {
    totalTheoreticalCost: number;
    totalActualCost: number;
    totalVariance: number;
    variancePercentage: number;
  };
}
```

---

### `PriceElasticityMap` — Price elasticity (GET /periods/{id}/analysis/price-elasticity)
```typescript
interface PriceElasticityMap {
  itemId: number;
  itemName: string;
  currentPrice: number;
  currentQuantity: number;
  currentRevenue: number;
  contributionMargin: number;
  priceIncrease5Percent: {
    newPrice: number;
    estimatedQuantity: number;
    estimatedRevenue: number;
    revenueChange: number;
  };
  priceIncrease10Percent: {
    newPrice: number;
    estimatedQuantity: number;
    estimatedRevenue: number;
    revenueChange: number;
  };
  recommendedPrice: number;
  recommendation: string;
}
```

---

### `MarketBasketMap` — Market basket (GET /periods/{id}/analysis/market-basket)
```typescript
interface MarketBasketMap {
  periodId: number;
  totalOrders: number;
  uniqueItems: number;
  topItemPairs: {
    item1Id: number;
    item1Name: string;
    item2Id: number;
    item2Name: string;
    coOccurrenceCount: number;
    support: number;
    confidence: number;
  }[];
  bundleRecommendations: {
    item1: string;
    item2: string;
    suggestedBundleName: string;
    rationale: string;
  }[];
}
```

---

### `ServerPerformanceMap` — Server performance (GET /periods/{id}/analysis/server-performance)
```typescript
interface ServerPerformanceMap {
  periodId: number;
  totalOrders: number;
  totalRevenue: number;
  serverRankings: {
    server: string;
    orderCount: number;
    totalRevenue: number;
    averageTicket: number;
    averageItemsPerOrder: number;
    percentageOfTotalOrders: number;
  }[];
}
```

---

### `DemandForecastMap` — Demand forecast (GET /periods/{id}/analysis/demand-forecast)
```typescript
interface DemandForecastMap {
  itemId: number;
  itemName: string;
  category: string;
  currentPeriodSales: number;
  daysAnalyzed: number;
  dailyAverage: number;
  demandTrend: string;        // "HIGH_DEMAND" | "MODERATE_DEMAND" | "LOW_DEMAND"
  projectedNextPeriodQty: number;
  projectedNextPeriodRevenue: number;
  stockRecommendation: string;
}
```

---

### `IngredientDriverMap` — Ingredient cost drivers (GET /periods/{id}/analysis/ingredient-cost-drivers)
```typescript
interface IngredientDriverMap {
  itemId: number;
  itemName: string;
  category: string;
  itemCost: number;
  foodCostPercentage: number;
  totalCost: number;
  quantitySold: number;
  driverType: string;         // "HIGH_COST" | "MEDIUM_COST" | "OPTIMAL"
  recommendation: string;
}
```

---

## 3. Field Name Mapping: FE Spec vs BE Reality

| FE Spec Field | BE Actual Field | Notes |
|---|---|---|
| `MenuEngineeringPeriod.id` | same | |
| `MenuEngineeringPeriod.costGroupId` | **NOT IN BE** | Cost group filtering not in BE period entity |
| `MenuEngineeringPeriod.costGroupName` | **NOT IN BE** | |
| `MenuEngineeringPeriod.popularityFactor` | **NOT IN BE** | Comes from `MenuEngineeringSettings`, not from period |
| `MenuEngineeringPeriod.itemCount` | **NOT IN BE** | Computed from `resultsJson` length |
| `MenuEngineeringPeriod.winnerCount` | **NOT IN BE** | Computed from results |
| `MenuEngineeringPeriod.workhorseCount` | **NOT IN BE** | Computed from results |
| `MenuEngineeringPeriod.opportunityCount` | **NOT IN BE** | Computed from results |
| `MenuEngineeringPeriod.loserCount` | **NOT IN BE** | Computed from results |
| `MenuEngineeringPeriod.periodBeginDate` | `period.startDate` | Renamed |
| `MenuEngineeringPeriod.periodEndDate` | `period.endDate` | Renamed |
| `MenuEngineeringPeriod.createdAt` | same (as `createdAt`) | |
| `MenuEngineeringPeriod.status` | same | `DRAFT`→`DRAFT`, `COMPLETE`→`COMPLETE`, `FINALIZED`→`FINALIZED` |
| `MenuEngineeringResult.itemGrossProfit` | `grossProfit` | Renamed |
| `MenuEngineeringResult.salesMixPct` | same | |
| `MenuEngineeringResult.totalRevenue` | computed: `sellPrice × quantitySold` | NOT in BE MenuEngResult, computed on the fly |
| `MenuEngineeringResult.totalCost` | computed: `itemCost × quantitySold` | NOT in BE MenuEngResult |
| `MenuEngineeringResult.totalProfit` | computed: `itemGrossProfit × quantitySold` | NOT in BE MenuEngResult |
| `MenuEngineeringResult.grossProfitCategory` | **NOT IN BE** | |
| `MenuEngineeringResult.salesMixCategory` | **NOT IN BE** | |
| `PeriodSummaryDto.totalQuantitySold` | `totalSold` | Renamed |
| `PeriodSummaryDto.weightedAvgGrossProfit` | `avgFoodCostPct` | **WRONG MAPPING** — FE expects avg GP, BE returns avg FC% |
| `PeriodSummaryDto.popularityThreshold` | **NOT IN BE** | |
| `LiveSalesCountDto[]` | `LiveSalesSummaryMap` (object, not array) | **CRITICAL: BE returns object, FE expects array** |
| `Recommendation.id` (number) | `id` (UUID string) | **Type mismatch** |
| `Recommendation.analysisId` | `periodId` | Renamed |
| `Recommendation.type` | `recommendationType` | Renamed |
| `Recommendation.priority` | **NEW FIELD** | Not in FE spec |
| `Recommendation.estimatedImpact` | `projectedImpactProfit` | Renamed |
| `Recommendation.assignedTo` | same | |
| `Recommendation.dueDate` | same | |
| `Recommendation.createdAt` | same | |
| `Recommendation.completedAt` | same | |
| `Recommendation.actionPlan` | **NEW FIELD** | Not in FE spec |
| `ComparisonDto` | `ComparisonMap` | BE returns `{comparison: [p1, p2]}` not flat structure |
| `ComparisonDto.period1` | inside `comparison[0]` | |
| `ComparisonDto.period2` | inside `comparison[1]` | |
| `ComparisonDto.rows` | **NOT IN BE** | No item-level comparison |
| `ComparisonDto.moversCount` | **NOT IN BE** | |
| `WhatIfResultDto.overallFcPctBefore` | **NOT IN BE** | |
| `WhatIfResultDto.overallFcPctAfter` | **NOT IN BE** | |
| `WhatIfResultDto.fcPctDelta` | **NOT IN BE** | |
| `CreatePeriodRequest.costGroupId` | **NOT IN BE** | |
| `CreatePeriodRequest.popularityFactor` | **NOT IN BE** | |
| `CreatePeriodRequest.periodBeginDate` | `startDate` | |
| `CreatePeriodRequest.periodEndDate` | `endDate` | |
| `CreatePeriodRequest.restaurantId` | **NOT USED** (from path) | |

---

## 4. Enum Values: BE vs FE

### `MenuEngClassification` (match ✓)
`WINNER` | `WORKHORSE` | `OPPORTUNITY` | `LOSER`

### `AnalysisStatus` (match ✓)
`DRAFT` | `COMPLETE` | `FINALIZED`

### `RecommendationStatus` (BE has MORE values)
| BE Value | FE Spec | Notes |
|---|---|---|
| `PENDING` | ✅ | |
| `IN_PROGRESS` | ✅ | |
| `COMPLETED` | ✅ | |
| `DISMISSED` | ✅ | |
| `PENDING_APPROVAL` | ❌ not in FE | |
| `APPROVED` | ❌ not in FE | |
| `REJECTED` | ❌ not in FE | |

### `RecommendationType` (BE has MORE values)
`RETAIN` | `PROTECT` | `FEATURE` | `INCREASE_VISIBILITY` | `ENHANCE_DESCRIPTION` | `TRAIN_STAFF` | `REPRICE_UP` | `REDUCE_PORTION_COST` | `BUNDLE` | `INVESTIGATE` | `SEASONAL_ONLY` | `REMOVE` | `HIGHLIGHT`

FE only has: `RETAIN` | `REPRICE` | `REPLATE` | `RETHINK` — **completely different values**

### `RecommendationPriority` (NEW — not in FE spec)
`HIGH` | `MEDIUM` | `LOW`

---

## 5. Key Findings Summary

1. **`LiveSalesCountDto[]` → Object mismatch** — `GET /live` returns `LiveSalesSummaryMap` (object), not array. FE crashes on `.reduce()`.
2. **Period list missing summary counts** — BE `PeriodSummaryMap` has no `winnerCount/workhorseCount/opportunityCount/loserCount/itemCount`. Must be derived from results.
3. **`PeriodSummaryDto.weightedAvgGrossProfit` → `avgFoodCostPct`** — FE expects weighted avg gross profit, BE returns avg food cost %. Field name and meaning differ.
4. **`MenuEngineeringPeriod.popularityFactor`** — Not stored in period entity. Comes from `MenuEngineeringSettings`.
5. **`Recommendation.id` type mismatch** — BE uses UUID (string), FE uses number. All recommendation PATCH URIs use UUID.
6. **`RecommendationType` mismatch** — BE uses `PROTECT`, `FEATURE`, `INCREASE_VISIBILITY`, `ENHANCE_DESCRIPTION`, `TRAIN_STAFF`, `REPRICE_UP`, `REDUCE_PORTION_COST`, `BUNDLE`, `INVESTIGATE`, `SEASONAL_ONLY`, `REMOVE`, `HIGHLIGHT`. FE spec uses `RETAIN`, `REPRICE`, `REPLATE`, `RETHINK`.
7. **`Recommendation.priority`** — New field in BE, not in FE spec.
8. **`Recommendation.actionPlan`** — New field in BE, not in FE spec.
9. **No `costGroupId` in period create** — BE `createPeriod` only accepts `periodName`, `startDate`, `endDate`. No cost group or popularity factor.
10. **`ComparisonDto.rows` missing** — BE `comparePeriods` returns `{comparison: [summary1, summary2]}` with no per-item comparison rows.
11. **`WhatIfResultDto` placeholder** — BE `runWhatIfSimulation` just echoes original results without applying overrides.
12. **`getPeriodSummary` vs `getExecutiveSummary` are DIFFERENT** — FE calls both for ME.2 but they return different shapes.
13. **UUID for recommendations PATCH** — All recommendation PATCH/PUT endpoints use `UUID recommendationId`, not numeric `id`.
