// ─────────────────────────────────────────────────────────────
// menuItem.types.ts
// Sourced from: MenuItem, MenuItemIngredientLine JPA entities
// ─────────────────────────────────────────────────────────────

import type { LineSourceType, RecipeUnit } from "./enums.types";

// ── Core entities ─────────────────────────────────────────────

export interface CostingLine {
  id: number;
  menuItemId: number;
  lineNumber: number;
  sourceType: LineSourceType;
  sourceId: number;               // ingredientId or batchRecipeId
  description: string;
  quantityRu: number;
  ruUnit: RecipeUnit;
  ruCost: number;                 // DERIVED live (ingredient) or from Redis (recipe)
  extension: number;              // quantityRu × ruCost — DERIVED
}

export interface MenuItemSummary {
  id: number;
  costGroupId: number;
  name: string;
  menuPrice: number;
  plateCost: number;
  pluNumber: string | null;
  imageUrl: string | null;
  active: boolean;
  // Computed from Redis (getCostGroupSummary)
  totalIngredientCost: number;
  totalCost: number;              // totalIngredientCost + plateCost
  grossProfit: number;            // menuPrice − totalCost
  foodCostPct: number;            // totalCost / menuPrice × 100
}

export interface MenuItemDetail extends MenuItemSummary {
  targetFoodCostPct: number;
  imageStorageKey: string | null;
  imageAltText: string | null;
  imageVersion: number | null;
  lines: CostingLine[];
  targetPrice: number;            // totalCost / (targetFoodCostPct / 100) — DERIVED
  createdAt: string;
  updatedAt: string;
}

// ── Cost DTO (Redis-backed, TTL 24hr) ─────────────────────────

export interface MenuItemCostDto {
  menuItemId: number;
  totalIngredientCost: number;
  totalCost: number;
  grossProfit: number;
  foodCostPct: number;
  targetPrice: number;
  computedAt: string;
}

// ── Request shapes ────────────────────────────────────────────

export interface CreateMenuItemRequest {
  restaurantId: number;
  costGroupId: number;
  name: string;
  menuPrice: number;
  plateCost?: number;
  targetFoodCostPct?: number;
  pluNumber?: string;
}

export interface CreateMenuItemResponse {
  id: number;
  name: string;
  costGroupId: number;
}

export interface UpdateMenuItemRequest {
  name?: string;
  menuPrice?: number;
  plateCost?: number;
  targetFoodCostPct?: number;
  pluNumber?: string;
}

export interface AddCostingLineRequest {
  sourceType: LineSourceType;
  sourceId: number;
  quantityRu: number;
}

export interface UpdateCostingLineRequest {
  quantityRu: number;
}

export interface CostingLineReorderItem {
  id: number;
  lineNumber: number;
}

export interface TargetPriceResponse {
  menuItemId: number;
  totalCost: number;
  targetFoodCostPct: number;
  targetPrice: number;
}

export interface MoveCostGroupRequest {
  newCostGroupId: number;
}
