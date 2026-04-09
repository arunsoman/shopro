// ─────────────────────────────────────────────────────────────
// enums.types.ts
// Every enum from the domain — sourced from
//   enums_and_conversions.java + v4_jpa_entities_complete.java
// ─────────────────────────────────────────────────────────────

// ── Inventory ────────────────────────────────────────────────

export type InventoryType = "FOOD" | "BAR";

export type InventoryCategory =
  | "MEAT"
  | "SEAFOOD"
  | "POULTRY"
  | "PRODUCE"
  | "DAIRY"
  | "BAKERY"
  | "GROCERY_DRY_GOODS"
  | "DRINKS"
  | "LIQUOR"
  | "BOTTLE_BEER"
  | "DRAFT_BEER"
  | "WINE"
  | "BAR_CONSUMABLES";

export type PurchaseUnit =
  | "LB" | "OZ" | "KG"
  | "EACH" | "CASE" | "BOTTLE"
  | "BAG" | "BOX" | "CARTON"
  | "CAN" | "ROLL" | "JAR"
  | "PACK_12" | "KEG" | "CYLINDER"
  | "BUNCH" | "DOZEN" | "GALLON" | "HALF_GALLON";

export type RecipeUnit =
  | "OZ_WEIGHT" | "OZ_FLUID" | "LB" | "KG" | "GRAM"
  | "TSP" | "TBSP" | "CUP" | "PINT" | "QUART" | "GALLON"
  | "EACH" | "BUNCH" | "SLICE" | "WHOLE";

export type InventoryUnit =
  | "LB" | "OZ" | "EACH" | "BOX" | "CARTON"
  | "CASE" | "BOTTLE" | "CAN" | "JAR"
  | "BAG" | "KEG" | "DOZEN" | "GALLON";

export type PackedBy = "WEIGHT" | "VOLUME";

export type MeasureType = "WEIGHT" | "VOLUME" | "PIECE";

export type PeriodStatus = "OPEN" | "FINALISED";

// ── Purchasing ───────────────────────────────────────────────

export type InvoiceStatus = "DRAFT" | "POSTED" | "VOID";

export type PurchaseOrderStatus = "DRAFT" | "SENT" | "RECEIVED" | "PARTIAL" | "CANCELLED";

export type GoodsReceiptStatus = "DRAFT" | "RECEIVED" | "CANCELLED";

export type PurchaseCategory =
  | "FOOD"
  | "SOFT_BEVERAGE"
  | "LIQUOR"
  | "BOTTLE_BEER"
  | "DRAFT_BEER"
  | "WINE"
  | "MERCHANDISE"
  | "SUPPLIES";

// ── Recipe & Menu Costing ────────────────────────────────────

export type KitchenStationType =
  | "GRILL"
  | "SAUTE"
  | "SAUCE"
  | "COLD"
  | "PREP"
  | "PASTRY"
  | "FRY"
  | "BROIL"
  | "LINE_COOK"
  | "PREP_COOK"
  | "PANTRY"
  | "SOUS_CHEF"
  | "DISHWASHER"
  | "SERVER"
  | "CUSTOM";

export type ShelfLife =
  | "ONE_SHIFT"
  | "ONE_DAY"
  | "TWO_DAYS"
  | "THREE_DAYS"
  | "FOUR_DAYS"
  | "FIVE_DAYS"
  | "SIX_DAYS"
  | "SEVEN_DAYS"
  | "EIGHT_DAYS"
  | "NINE_DAYS"
  | "TEN_DAYS";

/** Human-readable label map for ShelfLife enum */
export const SHELF_LIFE_LABELS: Record<ShelfLife, string> = {
  ONE_SHIFT:   "1 shift",
  ONE_DAY:     "1 day",
  TWO_DAYS:    "2 days",
  THREE_DAYS:  "3 days",
  FOUR_DAYS:   "4 days",
  FIVE_DAYS:   "5 days",
  SIX_DAYS:    "6 days",
  SEVEN_DAYS:  "7 days",
  EIGHT_DAYS:  "8 days",
  NINE_DAYS:   "9 days",
  TEN_DAYS:    "10 days",
};

export type ServingUtensil =
  | "SPOON"
  | "LADLE"
  | "TONGS"
  | "SPATULA"
  | "SQUEEZE_BOTTLE"
  | "BRUSH"
  | "HANDS"
  | "SCALE"
  | "PORTION_CUP"
  | "NONE";

// ── Menu Engineering ─────────────────────────────────────────

export type HighLow = "HIGH" | "LOW";

export type MenuEngClassification =
  | "WINNER"       // High GP + High Mix
  | "WORKHORSE"    // Low GP  + High Mix
  | "OPPORTUNITY"  // High GP + Low Mix
  | "LOSER";       // Low GP  + Low Mix

export type AnalysisStatus = "DRAFT" | "FINALISED";

// ── POS ──────────────────────────────────────────────────────

export type TableSection =
  | "INDOOR"
  | "OUTDOOR"
  | "BAR"
  | "PRIVATE"
  | "TAKEAWAY"
  | "DELIVERY";

export type TableStatus =
  | "AVAILABLE"
  | "OPEN"
  | "LONG_OPEN"  // > 1 hr — UI shows red
  | "INACTIVE";

export type SessionStatus = "OPEN" | "CLOSED" | "VOID";

export type OrderStatus = "OPEN" | "FIRED" | "CLOSED" | "VOID";

export type OrderLineStatus = "ORDERED" | "VOIDED" | "COMPED";

// ── Labor / Prime Cost ───────────────────────────────────────

export type EmployeeType = "MANAGEMENT" | "HOURLY";

export type ReportStatus = "DRAFT" | "FINALISED";

export type LineSourceType = "INGREDIENT" | "BATCH_RECIPE";
