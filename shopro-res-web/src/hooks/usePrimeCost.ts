// ─────────────────────────────────────────────────────────────
// hooks/usePrimeCost.ts — React Query wrappers for all
// PrimeCostService endpoints
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/primeCost.api";
import type { MultiLocationParams } from "../types";

// ── Query key factory ──────────────────────────────────────────
export const primeCostKeys = {
  live:             (rId: number)                  => ["prime-cost", rId, "live"]            as const,
  forecast:         (rId: number, ws: string)      => ["prime-cost", rId, "forecast", ws]    as const,
  weekly:           (rId: number, ws: string)      => ["prime-cost", rId, "weekly", ws]      as const,
  budgetVsActual:   (rId: number, ws: string)      => ["prime-cost", rId, "bva", ws]         as const,
  variance:         (rId: number, ws: string)      => ["prime-cost", rId, "variance", ws]    as const,
  trend:            (rId: number, weeks: number)   => ["prime-cost", rId, "trend", weeks]    as const,
  multiLocation:    (ws: string, ids: number[])    => ["prime-cost", "multi", ws, ids]       as const,
};

// ── SS5.0 / SS5.1 — Live prime cost (auto-refresh 5min) ───────
export function useLivePrimeCost(restaurantId: number) {
  return useQuery({
    queryKey: primeCostKeys.live(restaurantId),
    queryFn:  () => api.getLivePrimeCost(restaurantId),
    refetchInterval: 5 * 60 * 1000, // every 5min — matches Redis TTL
    staleTime:       4 * 60 * 1000, // consider stale just before TTL
    enabled: restaurantId > 0,
  });
}

// ── SS5.0 / SS5.1 — Forecast ──────────────────────────────────
export function useForecast(restaurantId: number, weekStart: string) {
  return useQuery({
    queryKey: primeCostKeys.forecast(restaurantId, weekStart),
    queryFn:  () => api.getForecast(restaurantId, weekStart),
    enabled:  restaurantId > 0 && !!weekStart,
    staleTime: 5 * 60 * 1000,
  });
}

// ── SS5.2 — Weekly report (DRAFT or FINALISED) ─────────────────
export function useWeeklyReport(restaurantId: number, weekStart: string) {
  return useQuery({
    queryKey: primeCostKeys.weekly(restaurantId, weekStart),
    queryFn:  () => api.getWeeklyReport(restaurantId, weekStart),
    enabled:  restaurantId > 0 && !!weekStart,
    // DRAFT reports: keep fresh. FINALISED: cache forever.
    staleTime: 2 * 60 * 1000,
  });
}

// ── SS5.2 — Finalise mutation ─────────────────────────────────
export function useFinaliseReport(restaurantId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (weekStart: string) => api.finaliseWeeklyReport(restaurantId, weekStart),
    onSuccess: (data, weekStart) => {
      // Update the cached report with the now-finalised snapshot
      qc.setQueryData(primeCostKeys.weekly(restaurantId, weekStart), data);
      // Invalidate trend so it picks up the new finalised point
      qc.invalidateQueries({ queryKey: ["prime-cost", restaurantId, "trend"] });
    },
  });
}

// ── SS5.3 — Budget vs Actual ──────────────────────────────────
export function useBudgetVsActual(restaurantId: number, weekStart: string) {
  return useQuery({
    queryKey: primeCostKeys.budgetVsActual(restaurantId, weekStart),
    queryFn:  () => api.getBudgetVsActual(restaurantId, weekStart),
    enabled:  restaurantId > 0 && !!weekStart,
    staleTime: 5 * 60 * 1000,
  });
}

// ── SS5.4 — Variance attribution ─────────────────────────────
export function useVarianceAttribution(restaurantId: number, weekStart: string) {
  return useQuery({
    queryKey: primeCostKeys.variance(restaurantId, weekStart),
    queryFn:  () => api.getVarianceAttribution(restaurantId, weekStart),
    enabled:  restaurantId > 0 && !!weekStart,
    staleTime: 10 * 60 * 1000,
  });
}

// ── SS5.5 — Trend (Redis TTL 1hr) ────────────────────────────
export function usePrimeCostTrend(restaurantId: number, weeks: number) {
  return useQuery({
    queryKey: primeCostKeys.trend(restaurantId, weeks),
    queryFn:  () => api.getPrimeCostTrend(restaurantId, weeks),
    enabled:  restaurantId > 0 && weeks > 0,
    staleTime: 60 * 60 * 1000,
  });
}

// ── SS5.5 — Daily Trend (Redis TTL 1hr) ──────────────────────
export function useDailyPrimeCostTrend(restaurantId: number, days: number = 7) {
  return useQuery({
    queryKey: ["prime-cost", restaurantId, "daily-trend", days],
    queryFn:  () => api.getDailyPrimeCostTrend(restaurantId, days),
    enabled:  restaurantId > 0 && days > 0,
    staleTime: 5 * 60 * 1000, // consider stale after 5min for live dashboard
  });
}

// ── SS5.7 — Multi-location ────────────────────────────────────
export function useMultiLocationSummary(params: MultiLocationParams) {
  return useQuery({
    queryKey: primeCostKeys.multiLocation(params.weekStart, params.restaurantIds),
    queryFn:  () => api.getMultiLocationSummary(params),
    enabled:  params.restaurantIds.length > 0 && !!params.weekStart,
    staleTime: 5 * 60 * 1000,
  });
}
