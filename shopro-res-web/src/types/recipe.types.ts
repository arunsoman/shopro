// ─────────────────────────────────────────────────────────────
// recipe.types.ts
// Sourced from: BatchRecipe, RecipeIngredientLine,
//               RecipeProcedureStep JPA entities
// ─────────────────────────────────────────────────────────────

import type { KitchenStationType, ShelfLife, RecipeUnit } from "./enums.types";

// ── Core entities ─────────────────────────────────────────────

export interface RecipeIngredientLine {
  id: number;
  batchRecipeId: number;
  ingredientId: number;
  description: string;            // from Ingredient.description
  lineNumber: number;
  quantityRu: number;
  ruUnit: RecipeUnit;             // from Ingredient.recipeUnit
  ruCost: number;                 // DERIVED live from Redis
  extension: number;              // quantityRu × ruCost — DERIVED
}

export interface RecipeProcedureStep {
  id: number;
  batchRecipeId: number;
  stepNumber: number;
  instruction: string;
}

export interface BatchRecipe {
  id: number;
  restaurantId: number;
  name: string;
  station: KitchenStationType;
  shelfLife: ShelfLife | null;
  toolsEquipment: string | null;
  positionNotes: string | null;
  yieldQuantity: number;
  yieldUnit: RecipeUnit;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // Summary fields — included in list responses
  ingredientCount: number;
  costPerYieldUnit: number | null; // null until costs available
}

// ── Detail DTO (includes lines + steps + costs) ───────────────

export interface RecipeDetailDto extends BatchRecipe {
  ingredientLines: RecipeIngredientLine[];
  procedureSteps: RecipeProcedureStep[];
  totalCost: number;              // SUM(extension)
  costPerYieldUnit: number;       // totalCost / yieldQuantity
}

// ── Cost DTO (Redis-backed, TTL 24hr) ─────────────────────────

export interface RecipeCostDto {
  recipeId: number;
  totalCost: number;
  yieldQuantity: number;
  yieldUnit: RecipeUnit;
  costPerYieldUnit: number;
  computedAt: string;
}

// ── Draft payload for autosave ────────────────────────────────

export interface RecipeDraftPayload {
  restaurantId: number;
  name: string;
  station: KitchenStationType;
  shelfLife: ShelfLife | null;
  toolsEquipment: string;
  positionNotes: string;
  yieldQuantity: number;
  yieldUnit: RecipeUnit;
  ingredientLines: CreateIngredientLineRequest[];
  steps: CreateStepRequest[];
}

// ── Request shapes ────────────────────────────────────────────

export interface CreateRecipeRequest {
  restaurantId: number;
  name: string;
  station: KitchenStationType;
  shelfLife?: ShelfLife;
  toolsEquipment?: string;
  positionNotes?: string;
  yieldQuantity: number;
  yieldUnit: RecipeUnit;
}

export interface UpdateRecipeHeaderRequest {
  name?: string;
  station?: KitchenStationType;
  shelfLife?: ShelfLife;
  toolsEquipment?: string;
  positionNotes?: string;
  yieldQuantity?: number;
  yieldUnit?: RecipeUnit;
}

export interface CreateIngredientLineRequest {
  lineOrder: number;
  ingredientId: number;
  quantityRu: number;
}

export interface UpdateIngredientLineRequest {
  quantityRu: number;
}

export interface CreateStepRequest {
  stepOrder: number;
  instruction: string;
}

export interface UpdateStepRequest {
  instruction: string;
}

export interface LineReorderItem {
  id: number;
  lineNumber: number;
}

export interface StepReorderItem {
  id: number;
  stepNumber: number;
}

export interface ScaleRecipeRequest {
  factor: number;                 // e.g. 2.0 = double batch
}

export interface ScaleRecipeResponse {
  recipeId: number;
  factor: number;
  scaledLines: Array<{
    ingredientId: number;
    description: string;
    originalQty: number;
    scaledQty: number;
    ruUnit: RecipeUnit;
  }>;
  originalTotalCost: number;
  scaledTotalCost: number;
}

export interface RecipeListParams {
  restaurantId: number;
  station?: KitchenStationType;
  activeOnly?: boolean;
  search?: string;
}
