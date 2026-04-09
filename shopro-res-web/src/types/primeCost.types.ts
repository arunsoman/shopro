// ─────────────────────────────────────────────────────────────
// primeCost.types.ts
// Sourced from: PrimeCostReport, WeeklyBudget, DailySalesEntry
//               JPA entities + PrimeCostService, WeeklyBudgetService
// ─────────────────────────────────────────────────────────────

import type { ReportStatus } from "./enums.types";

// ── Live prime cost (Redis TTL 5min) ──────────────────────────
// GET /api/v1/prime-cost/{restaurantId}/live

export interface LivePrimeCost {
  restaurantId: number;
  grossSalesToDate: number;       // from OrderLine (live)
  theoreticalCos: number;         // SUM(orderLine.qty × menuItem.totalCost)
  postedPurchases: number;        // SUM posted invoices this week
  laborAccrual: number;           // hours entered × rates
  primeCostGross: number;         // theoreticalCos + postedPurchases + laborAccrual
  primeCostPct: number;           // primeCostGross / grossSalesToDate × 100
  coversToDate: number;
  checkAverage: number;
  computedAt: string;
  ttlSeconds: number;
}

// ── Forecast (end-of-week projection) ────────────────────────
// GET /api/v1/prime-cost/{restaurantId}/forecast

export interface PrimeCostForecast {
  restaurantId: number;
  weekStart: string;
  forecastedGrossSales: number;
  forecastedPrimeCostPct: number;
  budgetPrimeCostPct: number;
  onTrack: boolean;               // forecastedPrimeCostPct ≤ budgetPrimeCostPct
  projectedVariancePts: number;   // forecastedPct - budgetPct
  computedAt: string;
}

// ── Weekly Prime Cost Report ───────────────────────────────────
// GET /api/v1/prime-cost/{restaurantId}/weekly?weekStart=

export interface WeeklyPrimeCostReport {
  id: number;
  restaurantId: number;
  weekStart: string;
  weekEnd: string;
  status: ReportStatus;

  // ── Revenue ─────────────────────────────────────────────────
  grossSales: number;
  compsDiscounts: number;
  netSales: number;

  // ── Food COS ─────────────────────────────────────────────────
  begInventoryFood: number;
  endInventoryFood: number;
  purchasesFood: number;
  actualFoodCos: number;          // beg + purchases - end
  actualFoodCosPct: number;       // / grossSales

  // ── Beverage COS ─────────────────────────────────────────────
  begInventoryBev: number;
  endInventoryBev: number;
  purchasesBev: number;
  actualBevCos: number;
  actualBevCosPct: number;

  // ── Total Actual COS ─────────────────────────────────────────
  totalActualCos: number;
  totalActualCosPct: number;

  // ── Theoretical COS ──────────────────────────────────────────
  theoreticalCos: number;
  theoreticalCosPct: number;

  // ── Shrinkage ────────────────────────────────────────────────
  shrinkageVariance: number;      // actualCos - theoreticalCos
  shrinkageVariancePct: number;

  // ── Labor ─────────────────────────────────────────────────────
  mgmtLabor: number;
  hourlyLabor: number;
  payrollTaxesBenefits: number;
  totalLabor: number;
  totalLaborPct: number;

  // ── Prime Cost ────────────────────────────────────────────────
  primeCostGross: number;
  primeCostGrossPct: number;
  primeCostNet: number;
  primeCostNetPct: number;
  grossMargin: number;
  grossMarginPct: number;

  // ── Scheduled vs Actual Labor ─────────────────────────────────
  scheduledLabor: number;
  laborVariance: number;          // actual - scheduled

  // ── KPIs ──────────────────────────────────────────────────────
  totalCovers: number;
  checkAverage: number;
  laborCostPerCover: number;
  salesPerLaborHour: number;

  createdAt: string;
  updatedAt: string;
  budget?: WeeklyBudget;
}

// ── Weekly Budget ─────────────────────────────────────────────
// Sourced from: WeeklyBudget JPA entity

export interface WeeklyBudget {
  id: number;
  restaurantId: number;
  weekStart: string;

  // Sales forecast
  totalSalesForecast: number;
  foodSalesPct: number;
  softBevSalesPct: number;
  liquorSalesPct: number;
  bottleBeerSalesPct: number;
  draftBeerSalesPct: number;
  wineSalesPct: number;
  compsPct: number;

  // COS % targets
  foodCosPctTarget: number;
  bevCosPctTarget: number;

  // Labor % targets
  mgmtLaborPctTarget: number;
  hourlyLaborPctTarget: number;
  benefitsRate: number;           // e.g. 0.22

  // Derived (from totalSalesForecast × respective pct):
  budgetFoodSales: number;
  budgetSoftBevSales: number;
  budgetLiquorSales: number;
  budgetBottleBeerSales: number;
  budgetDraftBeerSales: number;
  budgetWineSales: number;
  budgetFoodCos: number;
  budgetBevCos: number;
  budgetMgmtLabor: number;
  budgetHourlyLabor: number;
  budgetBenefits: number;
  budgetTotalLabor: number;
  budgetPrimeCostPct: number;     // foodCosTarget + bevCosTarget + laborTarget

  createdAt: string;
  updatedAt: string;
}

export interface UpsertWeeklyBudgetRequest {
  totalSalesForecast: number;
  foodSalesPct: number;
  softBevSalesPct: number;
  liquorSalesPct: number;
  bottleBeerSalesPct: number;
  draftBeerSalesPct: number;
  wineSalesPct: number;
  compsPct: number;
  foodCosPctTarget: number;
  bevCosPctTarget: number;
  mgmtLaborPctTarget: number;
  hourlyLaborPctTarget: number;
  benefitsRate: number;
}

// ── Budget vs Actual ──────────────────────────────────────────

export interface BudgetVsActualLine {
  label: string;
  actualAmount: number;
  actualPct: number | null;
  budgetAmount: number;
  budgetPct: number | null;
  varianceAmount: number;         // actual - budget
  variancePct: number | null;
  favorable: boolean;             // lower is better for costs; higher for sales
}

export interface BudgetVsActualReport {
  weekStart: string;
  restaurantId: number;
  lines: BudgetVsActualLine[];
  primeCostActualPct: number;
  primeCostBudgetPct: number;
  primeCostVariancePts: number;
  onBudget: boolean;
}

// ── Variance Attribution ──────────────────────────────────────

export type VarianceBucketType = "PRICE" | "MIX" | "PORTION" | "LABOR";

export interface VarianceBucketRow {
  ingredientId?: number;
  menuItemId?: number;
  employeeId?: number;
  description: string;
  impact: number;                 // $ impact on prime cost %
  impactPts: number;              // percentage points
  detail: string;                 // human-readable explanation
}

export interface VarianceBucket {
  bucketType: VarianceBucketType;
  totalImpact: number;
  totalImpactPts: number;
  rows: VarianceBucketRow[];
}

export interface VarianceAttribution {
  weekStart: string;
  restaurantId: number;
  totalVariancePts: number;       // actual primeCostPct - theoretical primeCostPct
  buckets: VarianceBucket[];
}

// ── Prime Cost Trend ──────────────────────────────────────────

export interface TrendPoint {
  weekStart: string;
  grossSales: number;
  totalActualCos: number;
  totalLabor: number;
  primeCostGross: number;
  primeCostGrossPct: number;
  budgetPrimeCostPct: number | null;
  status: ReportStatus;
}

export interface PrimeCostTrendResponse {
  restaurantId: number;
  weeks: number;
  points: TrendPoint[];
}

// ── Multi-location ────────────────────────────────────────────

export interface LocationPrimeCost {
  restaurantId: number;
  restaurantName: string;
  weekStart: string;
  grossSales: number;
  primeCostGross: number;
  primeCostGrossPct: number;
  budgetPrimeCostPct: number | null;
  variancePts: number | null;
  status: ReportStatus;
  alert: boolean;                 // true if > budget by 2+ pts
}

export interface MultiLocationSummaryDto {
  weekStart: string;
  locations: LocationPrimeCost[];
  combinedGrossSales: number;
  combinedPrimeCostGross: number;
  combinedPrimeCostPct: number;
}

// ── Daily Sales Entry (manual fallback) ───────────────────────

export interface DailySalesEntry {
  id: number;
  restaurantId: number;
  salesDate: string;
  foodSales: number;
  softBevSales: number;
  liquorSales: number;
  bottleBeerSales: number;
  draftBeerSales: number;
  wineSales: number;
  merchSales: number;
  compsDiscounts: number;
  guestCount: number | null;
  source: "POS" | "MANUAL";
  // DERIVED:
  grossSales: number;
  netSales: number;
  checkAverage: number | null;
  createdAt: string;
}

export interface UpsertDailySalesRequest {
  salesDate: string;
  foodSales?: number;
  softBevSales?: number;
  liquorSales?: number;
  bottleBeerSales?: number;
  draftBeerSales?: number;
  wineSales?: number;
  merchSales?: number;
  compsDiscounts?: number;
  guestCount?: number;
}

// ── Request shapes ─────────────────────────────────────────────

export interface FinaliseReportRequest {
  weekStart: string;
}

export interface MultiLocationParams {
  weekStart: string;
  restaurantIds: number[];
}
