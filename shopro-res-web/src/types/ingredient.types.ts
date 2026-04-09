// ─────────────────────────────────────────────────────────────
// ingredient.types.ts
// Sourced from: Ingredient, IngredientPriceHistory JPA entities
// ─────────────────────────────────────────────────────────────

import type {
  InventoryType, InventoryCategory,
  PurchaseUnit, RecipeUnit, InventoryUnit, PackedBy,
} from "./enums.types";

// ── Core entity ──────────────────────────────────────────────

export interface Ingredient {
  id: number;
  restaurantId: number;
  itemCode: string;               // 6-char unique within restaurant
  description: string;
  inventoryType: InventoryType;
  category: InventoryCategory;

  // Purchase unit
  purchaseUnit: PurchaseUnit;
  casePackSize: string | null;    // e.g. "4/2.5-lb. box"
  purchaseUnitPrice: number;      // price per purchase unit

  // Recipe unit
  recipeUnit: RecipeUnit;
  ruPerPu: number;                // recipe units per purchase unit
  yieldPct: number;               // 0 < yieldPct ≤ 1
  // ruCost is DERIVED: purchaseUnitPrice / ruPerPu / yieldPct

  // Inventory unit
  inventoryUnit: InventoryUnit;
  iuPerPu: number;                // inventory units per purchase unit
  // iuCost is DERIVED: purchaseUnitPrice / iuPerPu

  // Volume↔weight density (optional)
  ozWeightPerCup: number | null;
  packedBy: PackedBy | null;

  parLevel: number | null;
  imageStorageKey: string | null;
  imageAltText: string | null;
  imageVersion: number | null;
  imageUrl: string | null;        // CDN URL — not stored in DB, resolved by backend

  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Computed costs (Redis-backed, TTL 24hr) ───────────────────
// GET /api/v1/ingredients/{id}/costs

export interface IngredientCostDto {
  ingredientId: number;
  ruCost: number;                 // cost per recipe unit
  iuCost: number;                 // cost per inventory unit
  computedAt: string;
}

// ── Low stock alert ───────────────────────────────────────────
// From IngredientService.getLowStockAlerts()

export interface LowStockAlertDto {
  ingredientId: number;
  itemCode: string;
  description: string;
  category: InventoryCategory;
  inventoryType: InventoryType;
  parLevel: number;
  currentCount: number;           // from latest FINALISED period
  shortage: number;               // parLevel - currentCount
  lastPeriodDate: string;
}

// ── Price history ─────────────────────────────────────────────
// From IngredientPriceHistory entity

export interface IngredientPriceHistory {
  id: number;
  ingredientId: number;
  oldPrice: number;
  newPrice: number;
  effectiveDate: string;
  changedByUserId: number | null;
  createdAt: string;
}

// ── Request shapes ────────────────────────────────────────────

export interface CreateIngredientRequest {
  itemCode: string;
  description: string;
  inventoryType: InventoryType;
  category: InventoryCategory;
  purchaseUnit: PurchaseUnit;
  casePackSize?: string;
  purchaseUnitPrice: number;
  recipeUnit: RecipeUnit;
  ruPerPu: number;
  yieldPct: number;
  inventoryUnit: InventoryUnit;
  iuPerPu: number;
  ozWeightPerCup?: number;
  packedBy?: PackedBy;
  parLevel?: number;
}

export interface UpdateIngredientRequest extends Partial<CreateIngredientRequest> {
  imageAltText?: string;
}

// ── Search / list params ──────────────────────────────────────

export interface IngredientListParams {
  restaurantId: number;
  inventoryType?: InventoryType;
  category?: InventoryCategory;
  activeOnly?: boolean;
  search?: string;
}
