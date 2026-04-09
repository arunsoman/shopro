// ─────────────────────────────────────────────────────────────
// menuEngineering.types.ts
// Sourced from: MenuEngineeringPeriod, MenuEngineeringResult
//               JPA entities + MenuEngineeringService
// ─────────────────────────────────────────────────────────────

import type {
  MenuEngClassification,
  HighLow,
  AnalysisStatus,
} from "./enums.types";

// ── Core entities ─────────────────────────────────────────────

export interface MenuEngineeringPeriod {
  id: number;
  restaurantId: number;
  costGroupId: number | null;     // null = all groups
  costGroupName: string | null;
  periodBeginDate: string;        // yyyy-MM-dd
  periodEndDate: string;          // yyyy-MM-dd
  popularityFactor: number;       // default 0.80
  status: AnalysisStatus;
  createdAt: string;
  // Summary counts — included in list response
  itemCount: number;
  winnerCount: number;
  workhorseCount: number;
  opportunityCount: number;
  loserCount: number;
}

export interface MenuEngineeringResult {
  id: number;
  periodId: number;
  menuItemId: number;
  pluNumber: string | null;
  itemNameSnapshot: string;       // frozen at analysis time
  quantitySold: number;
  sellPrice: number;              // frozen at analysis time
  itemCost: number;               // frozen at analysis time
  // DERIVED at analysis time — stored in snapshot:
  itemGrossProfit: number;        // sellPrice - itemCost
  salesMixPct: number;            // quantitySold / totalQuantitySold
  totalRevenue: number;           // sellPrice × quantitySold
  totalCost: number;              // itemCost × quantitySold
  totalProfit: number;            // itemGrossProfit × quantitySold
  // Classification dimensions
  grossProfitCategory: HighLow;
  salesMixCategory: HighLow;
  classification: MenuEngClassification;
}

// ── Period summary ────────────────────────────────────────────

export interface PeriodSummaryDto {
  periodId: number;
  totalQuantitySold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  weightedAvgGrossProfit: number;
  popularityThreshold: number;    // weightedAvgGP × popularityFactor
  winnerCount: number;
  workhorseCount: number;
  opportunityCount: number;
  loserCount: number;
}

// ── Category summary ──────────────────────────────────────────

export interface CategorySummaryDto {
  costGroupId: number;
  costGroupName: string;
  itemCount: number;
  avgFoodCostPct: number;
  totalRevenue: number;
  totalProfit: number;
  winnerCount: number;
  workhorseCount: number;
  opportunityCount: number;
  loserCount: number;
}

// ── Period comparison ─────────────────────────────────────────

export interface ComparisonItemRow {
  menuItemId: number;
  itemName: string;
  pluNumber: string | null;
  classificationPeriod1: MenuEngClassification;
  classificationPeriod2: MenuEngClassification;
  changed: boolean;
  // Period 1 metrics
  quantitySoldP1: number;
  grossProfitP1: number;
  salesMixPctP1: number;
  // Period 2 metrics
  quantitySoldP2: number;
  grossProfitP2: number;
  salesMixPctP2: number;
}

export interface ComparisonDto {
  period1: MenuEngineeringPeriod;
  period2: MenuEngineeringPeriod;
  rows: ComparisonItemRow[];
  totalRevenueP1: number;
  totalRevenueP2: number;
  revenueDelta: number;
  moversCount: number;            // items that changed classification
}

// ── Live sales counter (SS4.7) ────────────────────────────────

export interface LiveSalesCountDto {
  menuItemId: number;
  itemName: string;
  costGroupId: number;
  costGroupName: string;
  quantitySoldToday: number;
  revenueToday: number;
  runningFoodCostPct: number;
  lastUpdated: string;
}

// ── What-if simulator ─────────────────────────────────────────

export interface WhatIfOverride {
  menuItemId: number;
  newSellPrice: number;
}

export interface WhatIfResultItem {
  menuItemId: number;
  itemName: string;
  originalSellPrice: number;
  newSellPrice: number;
  originalClassification: MenuEngClassification;
  newClassification: MenuEngClassification;
  classificationChanged: boolean;
  originalGrossProfit: number;
  newGrossProfit: number;
  gpDelta: number;
  originalFoodCostPct: number;
  newFoodCostPct: number;
}

export interface WhatIfResultDto {
  periodId: number;
  overrides: WhatIfOverride[];
  results: WhatIfResultItem[];
  overallFcPctBefore: number;
  overallFcPctAfter: number;
  fcPctDelta: number;
}

// ── Request shapes ────────────────────────────────────────────

export interface CreatePeriodRequest {
  restaurantId: number;
  costGroupId?: number;
  periodBeginDate: string;
  periodEndDate: string;
  popularityFactor?: number;      // defaults to 0.80
}

export interface WhatIfRequest {
  overrides: WhatIfOverride[];
}

export interface EngineeringListParams {
  restaurantId: number;
  costGroupId?: number;
  status?: AnalysisStatus;
}
