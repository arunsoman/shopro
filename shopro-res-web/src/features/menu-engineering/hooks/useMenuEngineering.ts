// ─────────────────────────────────────────────────────────────
// useMenuEngineering.ts — All hooks aligned with BE API contract
// All API calls use: /api/v1/restaurants/{restaurantId}/menu-engineering/...
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPeriods,
  getPeriod,
  getPeriodResults,
  getExecutiveSummary,
  getPeriodSummary,
  comparePeriods,
  getLiveSales,
  getCategoryDistribution,
  getRecommendations,
  updateRecommendationStatus,
  assignRecommendation,
  setRecommendationDueDate,
  addRecommendationComment,
  submitRecommendation,
  approveRecommendation,
  rejectRecommendation,
  getMatrixVisualization,
  getWorkflowStats,
  getDashboard,
  getTopPerformers,
  getOpportunityItems,
  runWhatIf,
  applyWhatIf,
  generateRecommendations,
  getItemMetrics,
  createPeriod,
  runPeriod,
  finalisePeriod,
  deletePeriod,
} from "@/api/menuEngineering.api";
import type {
  CreatePeriodRequest,
  MenuEngResult,
  LiveSalesSummaryMap,
  ExecutiveSummaryMap,
  PeriodDetailMap,
  ComparisonDto,
  WhatIfOverride,
  Recommendation,
  CategoryDistributionMap,
  MatrixVisualizationMap,
  WorkflowStatsMap,
  DashboardMap,
  TopPerformerMap,
  OpportunityItemMap,
  WhatIfResultMap,
  ComparisonItemRow,
} from "@/types/menuEngineering.types";

// ── Helpers ────────────────────────────────────────────────────────────────

export function deriveClassificationCounts(
  results: MenuEngResult[] | undefined,
): { winnerCount: number; opportunityCount: number; workhorseCount: number; loserCount: number } {
  if (!results) return { winnerCount: 0, opportunityCount: 0, workhorseCount: 0, loserCount: 0 };
  return {
    winnerCount:       results.filter((r) => r.classification === "WINNER").length,
    opportunityCount:  results.filter((r) => r.classification === "OPPORTUNITY").length,
    workhorseCount:    results.filter((r) => r.classification === "WORKHORSE").length,
    loserCount:        results.filter((r) => r.classification === "LOSER").length,
  };
}

export function computeTotalRevenue(results: MenuEngResult[] | undefined): number {
  return (results ?? []).reduce((sum, r) => sum + r.sellPrice * r.quantitySold, 0);
}

export function computeTotalCost(results: MenuEngResult[] | undefined): number {
  return (results ?? []).reduce((sum, r) => sum + r.itemCost * r.quantitySold, 0);
}

export const CLASSIFICATION_META = {
  WINNER:      { label: "Star",        emoji: "⭐", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  OPPORTUNITY: { label: "Puzzle",      emoji: "🧩", color: "text-amber-600",   bg: "bg-amber-500/10" },
  WORKHORSE:   { label: "Plow Horse",  emoji: "🐴", color: "text-cyan-600",    bg: "bg-cyan-500/10" },
  LOSER:       { label: "Dog",         emoji: "🐶", color: "text-rose-600",    bg: "bg-rose-500/10" },
} as const;

export const FC_PCT_COLOR = (pct: number) =>
  pct < 30 ? "text-emerald-600" : pct <= 40 ? "text-amber-600" : "text-rose-600";

export const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v);

export const formatPct = (v: number) =>
  `${(v * 100).toFixed(1)}%`;

// BE RecommendationStatus → FE badge label
export const RECOMMENDATION_STATUS_BADGE_MAP: Record<string, string> = {
  PENDING:        "DRAFT",
  IN_PROGRESS:    "IN PROGRESS",
  COMPLETED:      "COMPLETED",
  DISMISSED:      "DISMISSED",
  DEFERRED:       "DEFERRED",
  PENDING_APPROVAL: "PENDING APPROVAL",
  APPROVED:       "APPROVED",
  REJECTED:       "REJECTED",
};

/** Human-readable labels for RecommendationStatus — used in ItemDrillDownSlideOver and RecommendationPanel */
export const RECOMMENDATION_STATUS_LABELS: Record<string, string> = {
  PENDING:          "Pending",
  IN_PROGRESS:      "In Progress",
  COMPLETED:        "Completed",
  DISMISSED:        "Dismissed",
  DEFERRED:         "Deferred",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED:         "Approved",
  REJECTED:         "Rejected",
};

/** Human-readable labels for RecommendationType — used in ItemDrillDownSlideOver and RecommendationPanel */
export const RECOMMENDATION_TYPE_LABELS: Record<string, string> = {
  RETAIN:                 "Retain",
  PROTECT:                "Protect",
  FEATURE:                "Feature",
  HIGHLIGHT:              "Highlight",
  INCREASE_VISIBILITY:    "Increase Visibility",
  REPOSITION:             "Reposition",
  ENHANCE_DESCRIPTION:    "Enhance Description",
  PROMOTE:                "Promote",
  TRAIN_STAFF:            "Train Staff",
  REPRICE_UP:             "Reprice",
  REFORMULATE:            "Reformulate",
  REDUCE_PORTION_COST:    "Reduce Portion Cost",
  BUNDLE:                 "Bundle",
  REMOVE:                 "Remove",
  REDESIGN:               "Redesign",
  REPLACE:                "Replace",
  SEASONAL_ONLY:          "Seasonal Only",
  CONVERT_TO_SPECIAL:     "Convert to Special",
  MONITOR:                "Monitor",
  INVESTIGATE:            "Investigate",
  ANALYZE:               "Analyze",
  REPRICE:                "Reprice",
  REPLATE:                "Replate",
  RETHINK:                "Rethink",
  NO_ACTION:              "No Action",
};

// ── Query Keys ──────────────────────────────────────────────────────────────

export const ME_KEYS = {
  analyses:        (restaurantId: number)                                        => ["me", "periods", restaurantId] as const,
  analysis:        (restaurantId: number, periodId: number)                       => ["me", "period", restaurantId, periodId] as const,
  results:         (restaurantId: number, periodId: number)                      => ["me", "results", restaurantId, periodId] as const,
  summary:         (restaurantId: number, periodId: number)                      => ["me", "summary", restaurantId, periodId] as const,
  categories:      (restaurantId: number, periodId: number)                      => ["me", "categories", restaurantId, periodId] as const,
  live:            (restaurantId: number)                                        => ["me", "live", restaurantId] as const,
  recommendations: (restaurantId: number, periodId: number)                    => ["me", "recommendations", restaurantId, periodId] as const,
  comparison:      (restaurantId: number, p1: number | null, p2: number | null)=> ["me", "comparison", restaurantId, p1, p2] as const,
  matrix:          (restaurantId: number, periodId: number)                    => ["me", "matrix", restaurantId, periodId] as const,
  workflow:        (restaurantId: number, periodId: number)                    => ["me", "workflow", restaurantId, periodId] as const,
  dashboard:       (restaurantId: number)                                        => ["me", "dashboard", restaurantId] as const,
  top:             (restaurantId: number, periodId: number)                    => ["me", "top", restaurantId, periodId] as const,
  opportunities:   (restaurantId: number, periodId: number)                    => ["me", "opportunities", restaurantId, periodId] as const,
  whatIf:          (restaurantId: number, periodId: number, overrides: WhatIfOverride[]) =>
    ["me", "whatif", restaurantId, periodId, JSON.stringify(overrides)] as const,
};

// Backwards-compat alias
export const engineeringKeys = ME_KEYS;

// ── Hooks ───────────────────────────────────────────────────────────────────

/** GET /restaurants/{id}/menu-engineering/periods */
export function usePeriods(restaurantId: number) {
  return useQuery({
    queryKey: ME_KEYS.analyses(restaurantId),
    queryFn:  () => getPeriods(restaurantId),
    enabled:  !!restaurantId,
  });
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId} */
export function usePeriodDetail(restaurantId: number, periodId: number) {
  return useQuery({
    queryKey: ME_KEYS.analysis(restaurantId, periodId),
    queryFn:  () => getPeriod(restaurantId, periodId),
    enabled:  !!restaurantId && !!periodId,
  });
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/results */
export function useResults(restaurantId: number, periodId: number) {
  return useQuery({
    queryKey: ME_KEYS.results(restaurantId, periodId),
    queryFn:  () => getPeriodResults(restaurantId, periodId),
    enabled:  !!restaurantId && !!periodId,
  });
}

/**
 * GET /restaurants/{id}/menu-engineering/periods/{periodId}/summary/executive
 * Returns: { menuHealthScore, kpis{...}, classificationBreakdown }
 */
export function useSummary(restaurantId: number, periodId: number) {
  return useQuery({
    queryKey: ME_KEYS.summary(restaurantId, periodId),
    queryFn:  () => getExecutiveSummary(restaurantId, periodId),
    enabled:  !!restaurantId && !!periodId,
  });
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/report/category-distribution */
export function useCategorySummary(restaurantId: number, periodId: number) {
  return useQuery({
    queryKey: ME_KEYS.categories(restaurantId, periodId),
    queryFn:  () => getCategoryDistribution(restaurantId, periodId),
    enabled:  !!restaurantId && !!periodId,
  });
}

/**
 * GET /restaurants/{id}/menu-engineering/live
 * Returns: SINGLE LiveSalesSummaryMap object (not array).
 */
export function useLiveSales(restaurantId: number) {
  return useQuery({
    queryKey: ME_KEYS.live(restaurantId),
    queryFn:  () => getLiveSales(restaurantId),
    enabled:  !!restaurantId,
    refetchInterval: 30_000,
  });
}

/**
 * GET /restaurants/{id}/menu-engineering/periods/compare
 * Body: { periodIds: [p1, p2] } → { comparison: [PeriodDetailMap, PeriodDetailMap] }
 * Per-item rows computed client-side.
 */
export function useComparison(restaurantId: number, period1Id: number | null, period2Id: number | null) {
  return useQuery({
    queryKey: ME_KEYS.comparison(restaurantId, period1Id, period2Id),
    queryFn: async (): Promise<ComparisonDto | null> => {
      if (!period1Id || !period2Id) return null;

      const [comparisonResult, results1, results2] = await Promise.all([
        comparePeriods(restaurantId, period1Id, period2Id),
        getPeriodResults(restaurantId, period1Id),
        getPeriodResults(restaurantId, period2Id),
      ]);

      const { comparison } = comparisonResult;
      const [periodDetail1, periodDetail2] = comparison;

      const results2ByItemId = new Map((results2 ?? []).map((r) => [r.itemId, r]));

      const rows: ComparisonItemRow[] = (results1 ?? []).map((r1) => {
        const r2 = results2ByItemId.get(r1.itemId);
        const grossProfitP1 = r1.grossProfit;
        const grossProfitP2 = r2?.grossProfit ?? r1.grossProfit;
        const salesMixPctP1 = r1.salesMixPct;
        const salesMixPctP2 = r2?.salesMixPct ?? r1.salesMixPct;
        const changed = !r2 || r1.classification !== r2.classification;
        return {
          id: r1.itemId,
          menuItemId: r1.itemId,
          itemName: r1.itemName,
          classificationPeriod1: r1.classification,
          classificationPeriod2: r2?.classification ?? r1.classification,
          grossProfitP1,
          grossProfitP2,
          salesMixPctP1,
          salesMixPctP2,
          changed,
          grossProfitDelta: grossProfitP2 - grossProfitP1,
          salesMixDelta: salesMixPctP2 - salesMixPctP1,
        };
      });

      const revenueP1 = (results1 ?? []).reduce((s, r) => s + r.sellPrice * r.quantitySold, 0);
      const revenueP2 = (results2 ?? []).reduce((s, r) => s + r.sellPrice * r.quantitySold, 0);

      return {
        periodName1: periodDetail1.periodName,
        periodName2: periodDetail2.periodName,
        periodDetail1,
        periodDetail2,
        rows,
        totalRevenueP1: revenueP1,
        totalRevenueP2: revenueP2,
        revenueDelta: revenueP2 - revenueP1,
        moversCount: rows.filter((r) => r.changed).length,
      };
    },
    enabled: !!restaurantId && !!period1Id && !!period2Id,
  });
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/recommendations */
export function useRecommendations(restaurantId: number, periodId: number) {
  return useQuery({
    queryKey: ME_KEYS.recommendations(restaurantId, periodId),
    queryFn:  () => getRecommendations(restaurantId, periodId),
    enabled:  !!restaurantId && !!periodId,
  });
}

/**
 * PATCH /restaurants/{id}/menu-engineering/recommendations/{uuid}/status
 * NOTE: recommendationId is UUID string, NOT number.
 */
export function useUpdateRecommendationStatus(restaurantId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      recommendationId,
      status,
    }: {
      recommendationId: string;
      status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DISMISSED";
    }) => updateRecommendationStatus(restaurantId, recommendationId, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["me", "recommendations"] });
    },
  });
}

/** POST /restaurants/{id}/menu-engineering/periods/{periodId}/whatif */
export function useWhatIf(restaurantId: number, periodId: number, overrides: WhatIfOverride[]) {
  return useQuery({
    queryKey: ME_KEYS.whatIf(restaurantId, periodId, overrides),
    queryFn:  () => runWhatIf(restaurantId, periodId, overrides),
    enabled:  !!restaurantId && !!periodId && overrides.length > 0,
  });
}

/** POST /restaurants/{id}/menu-engineering/periods/{periodId}/apply-whatif */
export function useApplyWhatIf(restaurantId: number, periodId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (overrides: WhatIfOverride[]) =>
      applyWhatIf(restaurantId, periodId, overrides),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ME_KEYS.results(restaurantId, periodId) });
      void qc.invalidateQueries({ queryKey: ME_KEYS.summary(restaurantId, periodId) });
    },
  });
}

/** POST /restaurants/{id}/menu-engineering/periods */
export function useCreatePeriod(restaurantId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePeriodRequest) => createPeriod(restaurantId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ME_KEYS.analyses(restaurantId) });
    },
  });
}

/** POST /restaurants/{id}/menu-engineering/periods/{periodId}/run */
export function useRunPeriod(restaurantId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (periodId: number) => runPeriod(restaurantId, periodId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/** POST /restaurants/{id}/menu-engineering/periods/{periodId}/finalise */
export function useFinalisePeriod(restaurantId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (periodId: number) => finalisePeriod(restaurantId, periodId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/** DELETE /restaurants/{id}/menu-engineering/periods/{periodId} */
export function useDeletePeriod(restaurantId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (periodId: number) => deletePeriod(restaurantId, periodId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/** GET /restaurants/{id}/menu-engineering/items/{itemId}/metrics */
export function useItemMetrics(restaurantId: number, itemId: number) {
  return useQuery({
    queryKey: ["me", "item", itemId] as const,
    queryFn:  () => getItemMetrics(restaurantId, itemId),
    enabled:  !!restaurantId && !!itemId,
  });
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/visualization/matrix */
export function useMatrixVisualization(restaurantId: number, periodId: number) {
  return useQuery({
    queryKey: ME_KEYS.matrix(restaurantId, periodId),
    queryFn:  () => getMatrixVisualization(restaurantId, periodId),
    enabled:  !!restaurantId && !!periodId,
  });
}

/** GET /restaurants/{id}/menu-engineering/recommendations/workflow/stats */
export function useWorkflowStats(restaurantId: number) {
  return useQuery({
    queryKey: ME_KEYS.workflow(restaurantId, 0),
    queryFn:  () => getWorkflowStats(restaurantId),
    enabled:  !!restaurantId,
  });
}

/** GET /restaurants/{id}/menu-engineering/dashboard */
export function useDashboard(restaurantId: number) {
  return useQuery({
    queryKey: ME_KEYS.dashboard(restaurantId),
    queryFn:  () => getDashboard(restaurantId),
    enabled:  !!restaurantId,
  });
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/report/top-performers */
export function useTopPerformers(restaurantId: number, periodId: number) {
  return useQuery({
    queryKey: ME_KEYS.top(restaurantId, periodId),
    queryFn:  () => getTopPerformers(restaurantId, periodId),
    enabled:  !!restaurantId && !!periodId,
  });
}

/** GET /restaurants/{id}/menu-engineering/periods/{periodId}/report/opportunities */
export function useOpportunityItems(restaurantId: number, periodId: number) {
  return useQuery({
    queryKey: ME_KEYS.opportunities(restaurantId, periodId),
    queryFn:  () => getOpportunityItems(restaurantId, periodId),
    enabled:  !!restaurantId && !!periodId,
  });
}
