// ─────────────────────────────────────────────────────────────
// api/weeklyBudget.api.ts — WeeklyBudgetService endpoints
// ─────────────────────────────────────────────────────────────

import { apiGet, apiPut } from "./client";
import type { WeeklyBudget, UpsertWeeklyBudgetRequest } from "../types";

const BASE = "/weekly-budget";

export const getWeeklyBudget = (restaurantId: number, weekStart: string): Promise<WeeklyBudget> =>
  apiGet(`${BASE}/${restaurantId}?weekStart=${weekStart}`);

export const upsertWeeklyBudget = (
  restaurantId: number,
  weekStart: string,
  req: UpsertWeeklyBudgetRequest,
): Promise<WeeklyBudget> =>
  apiPut(`${BASE}/${restaurantId}?weekStart=${weekStart}`, req);

export const listRecentBudgets = (restaurantId: number, weeks: number): Promise<WeeklyBudget[]> =>
  apiGet(`${BASE}/${restaurantId}/recent?weeks=${weeks}`);
