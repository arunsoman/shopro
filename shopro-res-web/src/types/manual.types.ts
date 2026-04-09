// ─────────────────────────────────────────────────────────────
// manual.types.ts
// Sourced from: OperationsManualEntry JPA entity
// ─────────────────────────────────────────────────────────────

import type { KitchenStationType } from "./enums.types";
import type { RecipeProcedureStep } from "./recipe.types";

export type ManualEntryType = "RECIPE_LINKED" | "FREE_FORM";

export interface OperationsManualEntry {
  id: number;
  restaurantId: number;
  station: KitchenStationType;
  title: string;
  displayOrder: number;
  entryType: ManualEntryType;
  // One of these is set:
  batchRecipeId: number | null;
  content: string | null;
  // Populated when entryType === RECIPE_LINKED:
  recipeSteps?: RecipeProcedureStep[];
  updatedAt: string;
}

export interface ManualEntryGroup {
  station: KitchenStationType;
  entries: OperationsManualEntry[];
}

export interface CreateManualEntryRequest {
  restaurantId: number;
  station: KitchenStationType;
  title: string;
  entryType: ManualEntryType;
  batchRecipeId?: number;
  content?: string;
}

export interface UpdateManualEntryRequest {
  station?: KitchenStationType;
  title?: string;
  entryType?: ManualEntryType;
  batchRecipeId?: number;
  content?: string;
}

export interface ManualReorderItem {
  id: number;
  displayOrder: number;
}
