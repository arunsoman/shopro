// ─────────────────────────────────────────────────────────────
// api/primeCost.api.ts
// All PrimeCostService endpoints
// Base: /api/v1/prime-cost/...
// ─────────────────────────────────────────────────────────────

import { apiGet, apiPost } from "./client";
import type {
  LivePrimeCost,
  PrimeCostForecast,
  WeeklyPrimeCostReport,
  BudgetVsActualReport,
  VarianceAttribution,
  PrimeCostTrendResponse,
  MultiLocationSummaryDto,
  FinaliseReportRequest,
  MultiLocationParams,
} from "../types";

const BASE = "/restaurants";

export const getLivePrimeCost = (restaurantId: number): Promise<LivePrimeCost> =>
  apiGet(`${BASE}/${restaurantId}/prime-cost/live`);

export const getForecast = (restaurantId: number, weekStart: string): Promise<PrimeCostForecast> =>
  apiGet(`${BASE}/${restaurantId}/prime-cost/forecast?weekStart=${weekStart}`);

export const getWeeklyReport = (restaurantId: number, weekStart: string): Promise<WeeklyPrimeCostReport> =>
  apiGet(`${BASE}/${restaurantId}/prime-cost/weekly?weekStart=${weekStart}`);

export const finaliseWeeklyReport = (restaurantId: number, weekStart: string): Promise<WeeklyPrimeCostReport> =>
  apiPost(`${BASE}/${restaurantId}/prime-cost/weekly/${weekStart}/finalise`);

export const getBudgetVsActual = (restaurantId: number, weekStart: string): Promise<BudgetVsActualReport> =>
  apiGet(`${BASE}/${restaurantId}/prime-cost/budget-vs-actual?weekStart=${weekStart}`);

export const getVarianceAttribution = (restaurantId: number, weekStart: string): Promise<VarianceAttribution> =>
  apiGet(`${BASE}/${restaurantId}/prime-cost/variance-attribution?weekStart=${weekStart}`);

export const getPrimeCostTrend = (restaurantId: number, weeks: number): Promise<PrimeCostTrendResponse> =>
  apiGet(`${BASE}/${restaurantId}/prime-cost/trend?weeks=${weeks}`);

export const getDailyPrimeCostTrend = (restaurantId: number, days: number): Promise<PrimeCostTrendResponse> =>
  apiGet(`${BASE}/${restaurantId}/prime-cost/trend/daily?days=${days}`);

export const getMultiLocationSummary = (params: MultiLocationParams): Promise<MultiLocationSummaryDto> =>
  apiGet(`${BASE}/multi-location/prime-cost?weekStart=${params.weekStart}&restaurantIds=${params.restaurantIds.join(",")}`);
