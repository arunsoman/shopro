// ─────────────────────────────────────────────────────────────
// menuEngineering.api.ts
// Pattern: /api/v1/restaurants/{restaurantId}/menu-engineering/...
// (Path param for restaurantId, NOT query param — matches BE contract)
// ─────────────────────────────────────────────────────────────

import { apiGet, apiPost, apiPatch, apiDelete } from "@/api/client";
import type {
  CreatePeriodRequest,
  MenuEngineeringPeriod,
  MenuEngResult,
  LiveSalesSummaryMap,
  ExecutiveSummaryMap,
  PeriodDetailMap,
  ComparisonDto,
  WhatIfOverride,
  WhatIfResultMap,
  ApplyWhatIfResult,
  Recommendation,
  CategoryDistributionMap,
  MatrixVisualizationMap,
  WorkflowStatsMap,
  DashboardMap,
  TopPerformerMap,
  OpportunityItemMap,
  AllRecommendationsMap,
} from "@/types/menuEngineering.types";

// Base: /api/v1/restaurants/{restaurantId}/menu-engineering
// All functions take restaurantId and use it as a PATH param, NOT query param.
function me(restaurantId: number, path: string): string {
  return `/restaurants/${restaurantId}/menu-engineering${path}`;
}

// ── Periods / Analyses ───────────────────────────────────────────────────────

/** GET /restaurants/{id}/menu-engineering/periods */
export function getPeriods(restaurantId: number) {
  return apiGet<MenuEngineeringPeriod[]>(me(restaurantId, "/periods"));
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId} */
export function getPeriod(restaurantId: number, periodId: number) {
  return apiGet<PeriodDetailMap>(me(restaurantId, `/analyses/${periodId}`));
}

/** POST /restaurants/{id}/menu-engineering/periods */
export function createPeriod(restaurantId: number, body: CreatePeriodRequest) {
  return apiPost<MenuEngineeringPeriod>(me(restaurantId, "/periods"), body);
}

/** POST /restaurants/{id}/menu-engineering/periods/{periodId}/run */
export function runPeriod(restaurantId: number, periodId: number) {
  return apiPost<MenuEngineeringPeriod>(me(restaurantId, `/periods/${periodId}/run`), undefined);
}

/** DELETE /restaurants/{id}/menu-engineering/periods/{periodId} */
export function deletePeriod(restaurantId: number, periodId: number) {
  return apiDelete<void>(me(restaurantId, `/periods/${periodId}`));
}

/** POST /restaurants/{id}/menu-engineering/periods/{periodId}/finalise */
export function finalisePeriod(restaurantId: number, periodId: number) {
  return apiPost<{ success: boolean }>(me(restaurantId, `/periods/${periodId}/finalise`), undefined);
}

// ── Results ──────────────────────────────────────────────────────────────────

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/results */
export function getPeriodResults(restaurantId: number, periodId: number) {
  return apiGet<MenuEngResult[]>(me(restaurantId, `/periods/${periodId}/results`));
}

// ── Summary ─────────────────────────────────────────────────────────────────

/**
 * GET /restaurants/{id}/menu-engineering/periods/{periodId}/summary/executive
 * Returns: { menuHealthScore, kpis{...}, classificationBreakdown }
 */
export function getExecutiveSummary(restaurantId: number, periodId: number) {
  return apiGet<ExecutiveSummaryMap>(me(restaurantId, `/periods/${periodId}/summary/executive`));
}

/**
 * GET /restaurants/{id}/menu-engineering/periods/{periodId}/summary
 * Alias for the above (BE supports both paths).
 */
export function getPeriodSummary(restaurantId: number, periodId: number) {
  return apiGet<PeriodDetailMap>(me(restaurantId, `/periods/${periodId}/summary`));
}

// ── Categories ──────────────────────────────────────────────────────────────

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/report/category-distribution */
export function getCategoryDistribution(restaurantId: number, periodId: number) {
  return apiGet<CategoryDistributionMap[]>(me(restaurantId, `/periods/${periodId}/report/category-distribution`));
}

// ── Live ─────────────────────────────────────────────────────────────────────

/**
 * GET /restaurants/{id}/menu-engineering/live
 * Returns: SINGLE LiveSalesSummaryMap object (not array).
 */
export function getLiveSales(restaurantId: number) {
  return apiGet<LiveSalesSummaryMap>(me(restaurantId, "/live"));
}

// ── Comparison ───────────────────────────────────────────────────────────────

/**
 * GET /restaurants/{id}/menu-engineering/comparison?period1=X&period2=Y
 * Returns: { comparison: [periodDetail1, periodDetail2] }
 * Per-item rows computed client-side in useComparison hook.
 */
export function comparePeriods(restaurantId: number, periodId1: number, periodId2: number) {
  return apiGet<{ comparison: [PeriodDetailMap, PeriodDetailMap] }>(
    me(restaurantId, `/comparison?period1=${periodId1}&period2=${periodId2}`),
  );
}

// ── What-If ──────────────────────────────────────────────────────────────────

/** POST /restaurants/{id}/menu-engineering/periods/{periodId}/whatif */
export function runWhatIf(restaurantId: number, periodId: number, overrides: WhatIfOverride[]) {
  return apiPost<WhatIfResultMap>(me(restaurantId, `/periods/${periodId}/whatif`), { overrides });
}

/** POST /restaurants/{id}/menu-engineering/periods/{periodId}/apply-whatif */
export function applyWhatIf(restaurantId: number, periodId: number, overrides: WhatIfOverride[]) {
  return apiPost<ApplyWhatIfResult>(me(restaurantId, `/periods/${periodId}/apply-whatif`), { overrides });
}

// ── Recommendations ───────────────────────────────────────────────────────────

/**
 * GET /restaurants/{id}/menu-engineering/periods/{periodId}/recommendations
 * NOTE: Recommendation.id is UUID string, NOT number.
 */
export function getRecommendations(restaurantId: number, periodId: number) {
  return apiGet<Recommendation[]>(me(restaurantId, `/periods/${periodId}/recommendations`));
}

/** POST /restaurants/{id}/menu-engineering/periods/{periodId}/recommendations/generate */
export function generateRecommendations(restaurantId: number, periodId: number) {
  return apiPost<Recommendation[]>(me(restaurantId, `/periods/${periodId}/recommendations/generate`), undefined);
}

/**
 * PATCH /restaurants/{id}/menu-engineering/recommendations/{uuid}/status
 * NOTE: recommendationId is UUID string, NOT number.
 */
export function updateRecommendationStatus(
  restaurantId: number,
  recommendationId: string,
  status: string,
) {
  return apiPatch<Recommendation>(
    me(restaurantId, `/recommendations/${recommendationId}/status`),
    { status },
  );
}

/** PATCH /restaurants/{id}/menu-engineering/recommendations/{uuid}/assign */
export function assignRecommendation(
  restaurantId: number,
  recommendationId: string,
  assignedTo: string,
) {
  return apiPatch<Recommendation>(
    me(restaurantId, `/recommendations/${recommendationId}/assign`),
    { assignedTo },
  );
}

/** PATCH /restaurants/{id}/menu-engineering/recommendations/{uuid}/due-date */
export function setRecommendationDueDate(
  restaurantId: number,
  recommendationId: string,
  dueDate: string,
) {
  return apiPatch<Recommendation>(
    me(restaurantId, `/recommendations/${recommendationId}/due-date`),
    { dueDate },
  );
}

/** PATCH /restaurants/{id}/menu-engineering/recommendations/{uuid}/comment */
export function addRecommendationComment(
  restaurantId: number,
  recommendationId: string,
  comment: string,
) {
  return apiPatch<Recommendation>(
    me(restaurantId, `/recommendations/${recommendationId}/comment`),
    { comment },
  );
}

/** POST /restaurants/{id}/menu-engineering/recommendations/{uuid}/submit */
export function submitRecommendation(restaurantId: number, recommendationId: string) {
  return apiPost<Recommendation>(me(restaurantId, `/recommendations/${recommendationId}/submit`), undefined);
}

/** POST /restaurants/{id}/menu-engineering/recommendations/{uuid}/approve */
export function approveRecommendation(
  restaurantId: number,
  recommendationId: string,
  approvedBy: string,
  comment?: string,
) {
  return apiPost<Recommendation>(
    me(restaurantId, `/recommendations/${recommendationId}/approve`),
    { approvedBy, comment },
  );
}

/** POST /restaurants/{id}/menu-engineering/recommendations/{uuid}/reject */
export function rejectRecommendation(
  restaurantId: number,
  recommendationId: string,
  rejectedBy: string,
  reason: string,
) {
  return apiPost<Recommendation>(
    me(restaurantId, `/recommendations/${recommendationId}/reject`),
    { rejectedBy, reason },
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

/** GET /restaurants/{id}/menu-engineering/dashboard */
export function getDashboard(restaurantId: number) {
  return apiGet<DashboardMap>(me(restaurantId, "/dashboard"));
}

/** GET /restaurants/{id}/menu-engineering/matrix */
export function getQuickMatrix(restaurantId: number) {
  return apiGet<MatrixVisualizationMap>(me(restaurantId, "/matrix"));
}

// ── Reporting ───────────────────────────────────────────────────────────────

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/visualization/matrix */
export function getMatrixVisualization(restaurantId: number, periodId: number) {
  return apiGet<MatrixVisualizationMap>(me(restaurantId, `/periods/${periodId}/visualization/matrix`));
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/report/top-performers?limit=10 */
export function getTopPerformers(restaurantId: number, periodId: number, limit = 10) {
  return apiGet<TopPerformerMap[]>(me(restaurantId, `/periods/${periodId}/report/top-performers?limit=${limit}`));
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/report/opportunities */
export function getOpportunityItems(restaurantId: number, periodId: number) {
  return apiGet<OpportunityItemMap[]>(me(restaurantId, `/periods/${periodId}/report/opportunities`));
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/export */
export function getExportData(restaurantId: number, periodId: number) {
  return apiGet<Record<string, unknown>>(me(restaurantId, `/periods/${periodId}/export`));
}

// ── Item Metrics ─────────────────────────────────────────────────────────────

/**
 * GET /restaurants/{id}/menu-engineering/items/{itemId}/metrics
 * NOTE: restaurantId is path param, itemId is path param.
 */
export function getItemMetrics(restaurantId: number, itemId: number) {
  return apiGet<ItemMetricsMap>(me(restaurantId, `/items/${itemId}/metrics`));
}

export interface ItemMetricsMap {
  itemId: number;
  itemName: string;
  category: string;
  sellPrice: number;
  itemCost: number;
  contributionMargin: number;
  foodCostPct: number;
  quantitySold: number;
  salesMixPct: number;
  classification: string;
  historicalAnalysis: HistoricalAnalysisEntry[];
  recommendations: Recommendation[];
  recommendationCount: number;
}

export interface HistoricalAnalysisEntry {
  periodId: number;
  periodName: string;
  quantitySold: number;
  revenue: number;
  classification: string;
  contributionMargin: number;
  foodCostPct: number;
}

// ── Workflow Stats ────────────────────────────────────────────────────────────

/** GET /restaurants/{id}/menu-engineering/recommendations/workflow/stats */
export function getWorkflowStats(restaurantId: number) {
  return apiGet<WorkflowStatsMap>(me(restaurantId, "/recommendations/workflow/stats"));
}

/** GET /restaurants/{id}/menu-engineering/recommendations/all?status=&classification=&priority=&limit=50 */
export function getAllRecommendations(
  restaurantId: number,
  params?: { status?: string; classification?: string; priority?: string; limit?: number },
) {
  const q = new URLSearchParams();
  if (params?.status)        q.set("status", params.status);
  if (params?.classification) q.set("classification", params.classification);
  if (params?.priority)       q.set("priority", params.priority);
  if (params?.limit)         q.set("limit", String(params.limit));
  const qs = q.toString();
  return apiGet<AllRecommendationsMap>(me(restaurantId, `/recommendations/all${qs ? `?${qs}` : ""}`));
}

/** GET /restaurants/{id}/menu-engineering/recommendations/overdue */
export function getOverdueRecommendations(restaurantId: number) {
  return apiGet<Recommendation[]>(me(restaurantId, "/recommendations/overdue"));
}

// ── Menu Design Recommendations ─────────────────────────────────────────────

/** POST /restaurants/{id}/menu-engineering/periods/{periodId}/recommendations/menu-design/generate */
export function generateMenuDesignRecommendations(restaurantId: number, periodId: number) {
  return apiPost<Recommendation[]>(
    me(restaurantId, `/periods/${periodId}/recommendations/menu-design/generate`),
    undefined,
  );
}

// ── Advanced Analytics ───────────────────────────────────────────────────────

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/analysis/food-cost-comparison */
export function getFoodCostComparison(restaurantId: number, periodId: number) {
  return apiGet<FoodCostComparisonMap>(me(restaurantId, `/periods/${periodId}/analysis/food-cost-comparison`));
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/analysis/price-elasticity */
export function getPriceElasticity(restaurantId: number, periodId: number) {
  return apiGet<PriceElasticityMap[]>(me(restaurantId, `/periods/${periodId}/analysis/price-elasticity`));
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/analysis/market-basket */
export function getMarketBasketAnalysis(restaurantId: number, periodId: number) {
  return apiGet<MarketBasketMap>(me(restaurantId, `/periods/${periodId}/analysis/market-basket`));
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/analysis/server-performance */
export function getServerPerformance(restaurantId: number, periodId: number) {
  return apiGet<ServerPerformanceMap>(me(restaurantId, `/periods/${periodId}/analysis/server-performance`));
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/analysis/demand-forecast */
export function getDemandForecast(restaurantId: number, periodId: number) {
  return apiGet<DemandForecastMap[]>(me(restaurantId, `/periods/${periodId}/analysis/demand-forecast`));
}

// ── Advanced Analytics Types ─────────────────────────────────────────────────

export interface FoodCostComparisonMap {
  theoreticalCost: number;
  actualCost: number;
  variance: number;
  variancePct: number;
  items: FoodCostItem[];
}

export interface FoodCostItem {
  itemId: number;
  itemName: string;
  theoreticalCost: number;
  actualCost: number;
  variance: number;
  variancePct: number;
}

export interface PriceElasticityMap {
  itemId: number;
  itemName: string;
  currentPrice: number;
  currentQty: number;
  elasticity: number;
  recommendedPrice: number;
  potentialRevenueChange: number;
  recommendation: string;
}

export interface MarketBasketMap {
  totalOrders: number;
  uniqueItems: number;
  topItemPairs: ItemPair[];
  bundleRecommendations: BundleRecommendation[];
}

export interface ItemPair {
  item1Id: number;
  item1Name: string;
  item2Id: number;
  item2Name: string;
  coOccurrenceCount: number;
  support: number;
  confidence: number;
  lift: number;
}

export interface BundleRecommendation {
  bundleName: string;
  items: string[];
  expectedLift: number;
  potentialRevenue: number;
}

export interface ServerPerformanceMap {
  totalOrders: number;
  totalRevenue: number;
  serverRankings: ServerRanking[];
}

export interface ServerRanking {
  server: string;
  orderCount: number;
  totalRevenue: number;
  averageTicket: number;
  averageItemsPerOrder: number;
  percentageOfTotalOrders: number;
}

export interface DemandForecastMap {
  itemId: number;
  itemName: string;
  currentDailyAvg: number;
  forecastedDailyAvg: number;
  trend: string;
  confidence: number;
  stockRecommendation: string;
}

// ── Simulation ───────────────────────────────────────────────────────────────

export interface SimulateOrdersRequest {
  days: number;
  startDate: string;
}

export interface SimulateOrdersResponse {
  days: number;
  startDate: string;
  totalOrders: number;
  totalRevenue: number;
  message: string;
}

/** POST /restaurants/{id}/menu-engineering/simulate/orders */
export function simulateOrders(restaurantId: number, request: SimulateOrdersRequest) {
  return apiPost<SimulateOrdersResponse>(me(restaurantId, "/simulate/orders"), request);
}

// ── Reviews & Reminders ─────────────────────────────────────────────────────

/** GET /restaurants/{id}/menu-engineering/reviews/quarterly */
export function getQuarterlyReviews(restaurantId: number) {
  return apiGet<QuarterlyReview[]>(me(restaurantId, "/reviews/quarterly"));
}

/** GET /restaurants/{id}/menu-engineering/reviews/reminders */
export function getQuarterlyReminders(restaurantId: number) {
  return apiGet<Reminder[]>(me(restaurantId, "/reviews/reminders"));
}

export interface QuarterlyReview {
  quarter: string;
  year: number;
  scheduledDate: string;
  status: string;
  periodsAnalyzed: number;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  type: string;
  priority: string;
  status: string;
}

// ── Integration Status ───────────────────────────────────────────────────────

/** GET /restaurants/{id}/menu-engineering/integrations/inventory-status */
export function getInventoryIntegrationStatus(restaurantId: number) {
  return apiGet<IntegrationStatus>(me(restaurantId, "/integrations/inventory-status"));
}

/** GET /restaurants/{id}/menu-engineering/integrations/recipe-status */
export function getRecipeIntegrationStatus(restaurantId: number) {
  return apiGet<IntegrationStatus>(me(restaurantId, "/integrations/recipe-status"));
}

/** GET /restaurants/{id}/menu-engineering/integrations/notifications */
export function getNotificationSettings(restaurantId: number) {
  return apiGet<Reminder[]>(me(restaurantId, "/integrations/notifications"));
}

export interface IntegrationStatus {
  name: string;
  status: "connected" | "disconnected" | "error";
  lastSync: string;
  itemCount: number;
  errorMessage?: string;
}

// ── Quick Export ─────────────────────────────────────────────────────────────

/** GET /restaurants/{id}/menu-engineering/export/quick?format=json */
export function getQuickExport(restaurantId: number, format = "json") {
  return apiGet<Record<string, unknown>>(me(restaurantId, `/export/quick?format=${format}`));
}

// ── Settings ─────────────────────────────────────────────────────────────────

/** GET /restaurants/{id}/menu-engineering/settings */
export function getEngineeringSettings(restaurantId: number) {
  return apiGet<EngineeringSettings>(me(restaurantId, "/settings"));
}

/** PUT /restaurants/{id}/menu-engineering/settings */
export function updateEngineeringSettings(restaurantId: number, settings: Partial<EngineeringSettings>) {
  return apiPatch<EngineeringSettings>(me(restaurantId, "/settings"), settings);
}

// Legacy export aliases for backwards compatibility
export interface ExportDataResponse {
  periodId: number;
  periodName: string;
  format: string;
  data: unknown;
  downloadUrls: Record<string, string>;
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/export?format=csv */
export function getExportDataCsv(restaurantId: number, periodId: number) {
  return apiGet<string>(me(restaurantId, `/periods/${periodId}/export?format=csv`));
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/export?format=json */
export function getExportDataJson(restaurantId: number, periodId: number) {
  return apiGet<ExportDataResponse>(me(restaurantId, `/periods/${periodId}/export`));
}

export interface EngineeringSettings {
  id: string;
  restaurantId: number;
  popularityFactor: number;
  foodCostAlertThreshold: number;
  winnerThresholdMin: number;
  winnerThresholdMax: number;
  workhorseThresholdMin: number;
  workhorseThresholdMax: number;
  autoGenerateRecommendations: boolean;
  targetWinnerPct: number;
  targetWorkhorsePct: number;
  targetOpportunityPct: number;
  targetLoserPct: number;
  restaurantType: string;
}
