// ─────────────────────────────────────────────────────────────
// unitConversion.types.ts
// Sourced from: UnitConversionService, ConversionFunctions
// ─────────────────────────────────────────────────────────────

import type { RecipeUnit, PackedBy } from "./enums.types";

// ── Mode A: unit ↔ unit converter ─────────────────────────────

export interface ConvertRequest {
  quantity: number;
  fromUnit: RecipeUnit;
  toUnit: RecipeUnit;
  ozWeightPerCup?: number;        // required for volume ↔ weight cross-dim
}

export interface ConvertResponse {
  fromQuantity: number;
  fromUnit: RecipeUnit;
  toQuantity: number;
  toUnit: RecipeUnit;
}

// ── Mode B: ingredient cost calculator ────────────────────────

export interface IngredientCostCalcRequest {
  purchaseUnit: string;
  purchaseUnitPrice: number;
  packedBy: PackedBy;
  totalOz?: number;               // total oz by weight (if packedBy WEIGHT)
  totalFlOz?: number;             // total fl oz (if packedBy VOLUME)
  ozWeightPerCup?: number;        // for volume → weight cross
}

export interface IngredientCostCalcResponse {
  costPerFlOz: number | null;
  costPerWtOz: number | null;
  costPerLb: number | null;
  costPerKg: number | null;
}
