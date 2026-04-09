// ─────────────────────────────────────────────────────────────
// kpi.types.ts
// Sourced from: KpiService — all KPI DTOs
// Redis-backed (TTL 5min for today, 24hr for past)
// ─────────────────────────────────────────────────────────────

// ── Today KPIs (live, Redis TTL 5min) ─────────────────────────
// GET /api/v1/kpi/{restaurantId}/today

export interface TodayKpiDto {
  restaurantId: number;
  grossSalesToday: number;
  coversToday: number;
  checkAverageToday: number;
  openSessionsNow: number;
  liveFoodCostPct: number;
  computedAt: string;
}

// ── Top/Slow Sellers (Redis TTL 5min) ─────────────────────────
// GET /api/v1/kpi/{restaurantId}/top-sellers?period=today&limit=10

export interface SellerDto {
  menuItemId: number;
  menuItemName: string;
  costGroupName: string;
  quantitySold: number;
  revenue: number;
  pluNumber: string | null;
}

export type SellerPeriod = "today" | "week" | "month";

// ── Weekly KPIs ───────────────────────────────────────────────
// GET /api/v1/kpi/{restaurantId}/week?weekStart=

export interface WeekKpiDto {
  restaurantId: number;
  weekStart: string;
  grossSalesWeek: number;
  coversWeek: number;
  checkAverageWeek: number;
  foodCostPctWeek: number;
  laborCostPctWeek: number;
  primeCostPctWeek: number;
}

// ── Daily Sales by Category (for weekly bar chart) ────────────
// GET /api/v1/kpi/{restaurantId}/daily-sales-by-category?date=

export interface DailySalesByCategoryDto {
  date: string;
  costGroupId: number;
  costGroupName: string;
  revenue: number;
  coversCount: number;
}

// ── Table Turn Times ──────────────────────────────────────────
// GET /api/v1/kpi/{restaurantId}/table-turn-times?weekStart=

export interface TableTurnTimeDto {
  section: string;
  avgTurnMinutes: number;
  totalSessions: number;
  avgCoversPerSession: number;
}

// ── Prime Cost Trend (Redis TTL 1hr) ─────────────────────────
// GET /api/v1/kpi/{restaurantId}/prime-cost-trend?weeks=8
// Re-exported from primeCost.types for convenience

export interface PrimeCostTrendPoint {
  weekStart: string;
  grossSales: number;
  primeCostGross: number;
  primeCostGrossPct: number;
  budgetPrimeCostPct: number | null;
}

export interface PrimeCostTrendDto {
  restaurantId: number;
  weeks: number;
  points: PrimeCostTrendPoint[];
}
