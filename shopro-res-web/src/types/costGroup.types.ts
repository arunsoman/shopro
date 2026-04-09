// ─────────────────────────────────────────────────────────────
// costGroup.types.ts
// Sourced from: MenuCostGroup JPA entity
// ─────────────────────────────────────────────────────────────

import type { MenuItemSummary } from "./menuItem.types";

export interface CostGroup {
  id: number;
  restaurantId: number;
  name: string;
  displayOrder: number;
  active: boolean;
}

export interface CostGroupSummary extends CostGroup {
  itemCount: number;
  avgFoodCostPct: number;         // avg across active items — from Redis
  items: MenuItemSummary[];       // full item list with costs
}

export interface CreateCostGroupRequest {
  restaurantId: number;
  name: string;
}

export interface UpdateCostGroupRequest {
  name?: string;
  displayOrder?: number;
}

export interface CostGroupReorderItem {
  id: number;
  displayOrder: number;
}
