// ─────────────────────────────────────────────────────────────
// menuEngineering.types.ts — Complete BE contract aligned types
// ─────────────────────────────────────────────────────────────

import type {
  MenuEngClassification,
  RecommendationType,
  RecommendationStatus,
  RecommendationPriority,
} from "./enums.types";

// ── Menu Engineering Period / Analysis ──────────────────────────────────────

export interface MenuEngineeringPeriod {
  id: number;
  restaurantId: number;
  periodName: string;
  startDate: string;      // yyyy-MM-dd (NOT periodBeginDate)
  endDate:   string;      // yyyy-MM-dd (NOT periodEndDate)
  status:    "DRAFT" | "COMPLETE" | "FINALIZED";
  runAt?:    string;     // ISO timestamp
}

export interface CreatePeriodRequest {
  periodName?: string;
  startDate:  string;    // yyyy-MM-dd
  endDate:    string;    // yyyy-MM-dd
  // NOTE: BE does NOT accept costGroupId or popularityFactor on create.
}

// ── Menu Engineering Results ──────────────────────────────────────────────────

/**
 * Single menu item result row.
 * BE field names: itemName, contributionMargin, grossProfit (NOT itemNameSnapshot, itemGrossProfit).
 * Derived client-side: _totalRevenue = sellPrice * quantitySold, _fcPct = itemCost / sellPrice.
 */
export interface MenuEngResult {
  itemId:           number;
  itemName:         string;
  categoryName?:    string;           // from BE item.category.name
  quantitySold:     number;           // totalSold (aliased)
  sellPrice:        number;           // grossProfit / sellPrice
  itemCost:         number;           // foodCost
  grossProfit:      number;           // sellPrice − itemCost (same as contributionMargin for simple model)
  contributionMargin: number;        // revenue − variable costs (= sellPrice − itemCost for simple model)
  salesMixPct:      number;           // quantitySold / totalQuantitySold across all items
  classification:   MenuEngClassification;
}

// ── Summary / KPI Maps ───────────────────────────────────────────────────────

export interface PeriodDetailMap {
  periodId:          number;
  periodName:       string;
  startDate:        string;
  endDate:          string;
  totalItems:       number;
  totalSold:        number;
  totalRevenue:     number;
  totalCost:        number;
  totalProfit:      number;
  avgFoodCostPct:   number;
  avgMargin:        number;
  winnerCount:      number;
  workhorseCount:   number;
  opportunityCount: number;
  loserCount:       number;
  classificationBreakdown: Record<MenuEngClassification, number>;
  runAt:            string;
}

export interface ExecutiveSummaryMap {
  menuHealthScore:        number;      // 0-100
  kpis: {
    avgFoodCostPct:       number;
    avgContributionMargin: number;
    avgSalesMixPct:       number;
    totalItems:           number;
    totalSold:            number;
    totalRevenue:         number;
    totalCost:            number;
    totalProfit:          number;
  };
  classificationBreakdown: Record<MenuEngClassification, number>;
  topStars?:        MenuEngResult[]; // optional — BE may not always return these
  topOpportunities?: MenuEngResult[];
  periodName?:      string;
}

export interface LiveSalesSummaryMap {
  totalOrders:      number;
  totalItems:       number;
  totalRevenue:     number;
  averageOrderValue: number;
  lastUpdated:      string; // ISO timestamp
}

export interface CategoryDistributionMap {
  id:            number;   // derived from index — not from BE. Used as key by ResponsiveDataList.
  category:      string;
  itemCount:     number;
  totalRevenue:  number;
  totalProfit:   number;
  avgMargin:     number;
  classification: Record<MenuEngClassification, number>;
}

export interface ComparisonDto {
  periodName1: string;
  periodName2: string;
  periodDetail1: PeriodDetailMap;
  periodDetail2: PeriodDetailMap;
  rows: ComparisonItemRow[];
  totalRevenueP1: number;
  totalRevenueP2: number;
  revenueDelta:  number;
  moversCount:   number;
}

export interface ComparisonItemRow {
  id:                  number;   // menuItemId — used as key by ResponsiveDataList
  menuItemId:          number;
  itemName:           string;
  classificationPeriod1: MenuEngClassification;
  classificationPeriod2: MenuEngClassification;
  grossProfitP1:       number;
  grossProfitP2:       number;
  salesMixPctP1:       number;
  salesMixPctP2:       number;
  changed:              boolean;
  grossProfitDelta?:   number;
  salesMixDelta?:      number;
  pluNumber?:          string;
}

// ── What-If Simulation ────────────────────────────────────────────────────────

/** Request body for What-If simulation. BE field: itemId (number), newSellPrice. */
export interface WhatIfOverride {
  itemId:       number;    // NOT menuItemId
  newSellPrice: number;
}

/** Result from applying what-if changes. BE returns Map<String,Object>: { success, periodId, updatedItems, message }. */
export interface ApplyWhatIfResult {
  success:      boolean;
  periodId:     number;
  updatedItems: number;
  message?:     string;
}

/** Simulated what-if results — BE returns Map with periodId, results[], totalRevenue, avgFoodCostPct. */
export interface WhatIfResultMap {
  periodId:    number;
  results:     MenuEngResult[];
  totalRevenue: number;
  avgFoodCostPct: number;
}

// ── Recommendations ──────────────────────────────────────────────────────────

/**
 * Menu Engineering recommendation entity.
 * All fields aligned with BE MenuEngineeringRecommendation.java entity.
 *
 * Key notes:
 * - id is UUID string (NOT number)
 * - BE fields: projectedImpactRevenue, projectedImpactMargin, projectedImpactProfit (all BigDecimal)
 * - BE fields: estimatedImplementationCost, dismissedReason, approvedBy, approvedAt, approvalComment
 * - BE fields: comment (renamed from actionPlan — actionPlan is also kept for backward compat)
 */
export interface Recommendation {
  id:                     string;       // UUID
  periodId:               number;
  menuItemId:             number;
  itemName:               string;
  classification:         MenuEngClassification;
  recommendationType:     RecommendationType;
  title:                  string;
  description:            string;
  priority:               RecommendationPriority;
  status:                 RecommendationStatus;
  assignedTo?:            string;
  dueDate?:               string;
  actionPlan?:            string;
  projectedImpactRevenue?:  number;   // BE: projectedImpactRevenue (BigDecimal)
  projectedImpactProfit?:   number;   // BE: projectedImpactProfit (BigDecimal)
  projectedImpactMargin?:   number;   // BE: projectedImpactMargin (BigDecimal)
  estimatedImplementationCost?: number;  // BE: estimatedImplementationCost
  comment?:               string;
  dismissedReason?:       string;
  approvedBy?:            string;
  approvedAt?:            string;
  approvalComment?:       string;
  completedAt?:           string;
  createdAt:               string;
  updatedAt:               string;
}

// ── Dashboard / Reporting ───────────────────────────────────────────────────

export interface MatrixVisualizationMap {
  quadrantDistribution: Record<MenuEngClassification, number>;
  avgFoodCostPct:        number;
  avgContributionMargin: number;
  avgSalesMixPct:        number;
  menuHealthScore:        number;
}

export interface WorkflowStatsMap {
  total:          number;
  pending:        number;
  inProgress:     number;
  completed:      number;
  dismissed:      number;
  byType:         Record<RecommendationType, number>;
  byPriority:     Record<RecommendationPriority, number>;
}

export interface DashboardMap {
  totalAnalyses:     number;
  lastAnalysisDate:   string;
  lastAnalysisPeriod: string;
  avgHealthScore:    number;
  totalItemsAnalyzed: number;
  avgFoodCostPct:    number;
}

export interface TopPerformerMap {
  menuItemId:   number;
  itemName:     string;
  categoryName: string;
  revenue:     number;
  profit:      number;
  marginPct:   number;
  quantitySold: number;
  salesMixPct: number;
  classification: MenuEngClassification;
}

export interface OpportunityItemMap {
  menuItemId:    number;
  itemName:      string;
  categoryName:  string;
  contributionMargin: number;
  salesMixPct:   number;
  classification:    MenuEngClassification;
  projectedImprovement?: number;
}

// ── All Recommendations Map ──────────────────────────────────────────────────

export interface AllRecommendationsMap {
  recommendations: Recommendation[];
  total:           number;
  byStatus:        Record<RecommendationStatus, number>;
  byType:          Record<RecommendationType, number>;
  byPriority:     Record<RecommendationPriority, number>;
}
