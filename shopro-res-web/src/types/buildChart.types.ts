// ─────────────────────────────────────────────────────────────
// buildChart.types.ts
// Sourced from: RecipeBuildChart, BuildChartLine JPA entities
// ─────────────────────────────────────────────────────────────

import type { KitchenStationType, RecipeUnit, ServingUtensil } from "./enums.types";

export interface BuildChartLine {
  id: number;
  buildChartId: number;
  lineNumber: number;
  label: string;
  ingredientId: number | null;    // optional link to ingredient master
  ingredientDescription: string | null;
  portionQuantity: number | null;
  portionUnit: RecipeUnit | null;
  portionNote: string | null;
  servingUtensil: ServingUtensil;
  utensilNote: string | null;
  crossStationNote: string | null;
}

export interface BuildChart {
  id: number;
  menuItemId: number;
  menuItemName: string;           // denormalised for list display
  station: KitchenStationType;
  platingSpec: string | null;
  updatedAt: string;
  lines: BuildChartLine[];
  lineCount: number;
}

export interface BuildChartSummary {
  id: number;
  menuItemId: number;
  menuItemName: string;
  station: KitchenStationType;
  platingSpec: string | null;
  lineCount: number;
  updatedAt: string;
}

// ── Request shapes ────────────────────────────────────────────

export interface UpdateBuildChartHeaderRequest {
  station?: KitchenStationType;
  platingSpec?: string;
}

export interface CreateBuildChartLineRequest {
  label: string;
  ingredientId?: number;
  portionQuantity?: number;
  portionUnit?: RecipeUnit;
  portionNote?: string;
  servingUtensil: ServingUtensil;
  utensilNote?: string;
  crossStationNote?: string;
}

export interface UpdateBuildChartLineRequest extends Partial<CreateBuildChartLineRequest> {}

export interface BuildChartLineReorderItem {
  id: number;
  lineNumber: number;
}
