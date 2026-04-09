// ─────────────────────────────────────────────────────────────
// inventory.types.ts
// Sourced from: InventoryPeriod, InventoryLineItem JPA entities
// ─────────────────────────────────────────────────────────────

import type { InventoryType, InventoryCategory, PeriodStatus } from "./enums.types";

// ── Core entities ─────────────────────────────────────────────

export interface InventoryPeriod {
  id: number;
  restaurantId: number;
  periodDate: string;             // yyyy-MM-dd
  inventoryType: InventoryType;
  status: PeriodStatus;
  finalisedAt: string | null;
  createdAt: string;
  // Derived fields included in list response
  totalValue: number | null;      // null if OPEN and no counts yet
  lineItemCount: number;
}

export interface InventoryLineItem {
  id: number;
  inventoryPeriodId: number;
  ingredientId: number;
  itemCode: string;
  description: string;
  category: InventoryCategory;
  count: number;
  inventoryUnit: string;
  iuCost: number;                 // live from Redis
  extension: number;              // count × iuCost — DERIVED
}

// ── Period detail (full response with lines + breakdown) ──────

export interface CategoryBreakdown {
  category: InventoryCategory;
  subtotal: number;
  itemCount: number;
}

export interface InventoryPeriodDetail {
  period: InventoryPeriod;
  lines: InventoryLineItem[];
  categoryBreakdown: CategoryBreakdown[];
  totalValue: number;
}

// ── Period comparison ─────────────────────────────────────────

export interface PeriodDeltaRow {
  ingredientId: number;
  itemCode: string;
  description: string;
  category: InventoryCategory;
  countPeriod1: number;
  countPeriod2: number;
  countDelta: number;
  valuePeriod1: number;
  valuePeriod2: number;
  valueDelta: number;
}

export interface PeriodComparisonDto {
  period1: InventoryPeriod;
  period2: InventoryPeriod;
  rows: PeriodDeltaRow[];
  totalDelta: number;
  categoryDeltas: CategoryBreakdown[];
}

// ── Request shapes ────────────────────────────────────────────

export interface OpenPeriodRequest {
  restaurantId: number;
  periodDate: string;
  inventoryType: InventoryType;
}

export interface UpdateCountRequest {
  count: number;
}

export interface BatchCountItem {
  ingredientId: number;
  count: number;
}

export interface BatchCountRequest {
  lines: BatchCountItem[];
}
