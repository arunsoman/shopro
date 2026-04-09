# TypeScript Entity Types — Restaurant Management Platform

All interfaces mirror the Java DTOs returned by the REST controllers.

---

## Shared / Cross-cutting

```typescript
export interface Restaurant {
  id: number;
  name: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: number;
  restaurantId: number;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  accountNumber: string | null;
  active: boolean;
  createdAt: string;
}

export type InventoryType = 'FOOD' | 'BAR';

export type InventoryCategory =
  | 'MEAT' | 'SEAFOOD' | 'PRODUCE' | 'DAIRY' | 'DRY_GOODS'
  | 'BEVERAGES' | 'LIQUOR' | 'WINE' | 'BEER' | 'OTHER';

export type PurchaseUnit =
  | 'LB' | 'OZ' | 'CASE' | 'BOTTLE' | 'KEG' | 'EACH' | 'GALLON' | 'LITER';

export type RecipeUnit =
  | 'OZ_WEIGHT' | 'OZ_FLUID' | 'LB' | 'CUP' | 'TBSP' | 'TSP'
  | 'LITER' | 'ML' | 'EACH' | 'GALLON';

export type InventoryUnit =
  | 'LB' | 'OZ' | 'EACH' | 'BOTTLE' | 'KEG' | 'GALLON' | 'LITER' | 'CASE';
```

---

## Subsystem 1 — Inventory

```typescript
export interface Ingredient {
  id: number;
  restaurantId: number;
  itemCode: string;
  description: string;
  inventoryType: InventoryType;
  category: InventoryCategory;
  purchaseUnit: PurchaseUnit;
  casePackSize: string | null;
  purchaseUnitPrice: number;
  recipeUnit: RecipeUnit;
  ruPerPu: number;
  yieldPct: number;
  inventoryUnit: InventoryUnit;
  iuPerPu: number;
  ozWeightPerCup: number | null;
  packedBy: 'WEIGHT' | 'VOLUME' | null;
  parLevel: number | null;
  imageStorageKey: string | null;
  imageUrl: string | null;       // derived — CDN URL
  active: boolean;
  createdAt: string;
}

export interface IngredientCostDto {
  ingredientId: number;
  ruCost: number;   // cost per recipe unit
  iuCost: number;   // cost per inventory unit
}

export interface LowStockAlertDto {
  ingredientId: number;
  itemCode: string;
  description: string;
  category: InventoryCategory;
  inventoryType: InventoryType;
  currentCount: number;
  parLevel: number;
  inventoryUnit: InventoryUnit;
  shortfallAmount: number;
}

export type PeriodStatus = 'OPEN' | 'FINALISED';

export interface InventoryPeriod {
  id: number;
  restaurantId: number;
  periodDate: string;         // LocalDate ISO
  inventoryType: InventoryType;
  status: PeriodStatus;
  finalisedAt: string | null;
  totalValue: number | null;  // null when OPEN
}

export interface InventoryLineItem {
  id: number;
  periodId: number;
  ingredientId: number;
  itemCode: string;
  description: string;
  category: InventoryCategory;
  count: number;
  inventoryUnit: InventoryUnit;
  iuCost: number;
  extension: number;          // count × iuCost (derived)
}

export interface InventoryPeriodDetailDto extends InventoryPeriod {
  lineItems: InventoryLineItem[];
  categorySubtotals: { category: string; subtotal: number }[];
  totalValue: number;
}
```

---

## Subsystem 2 — Purchasing

```typescript
export type InvoiceStatus = 'DRAFT' | 'POSTED' | 'VOID';

export interface PurchaseInvoice {
  id: number;
  restaurantId: number;
  supplierId: number;
  supplierName: string;
  invoiceDate: string;
  invoiceNumber: string | null;
  status: InvoiceStatus;
  totalAmount: number;
  lineCount: number;
  createdAt: string;
  postedAt: string | null;
}

export interface InvoiceLine {
  id: number;
  invoiceId: number;
  ingredientId: number;
  description: string;
  quantity: number;
  purchaseUnit: PurchaseUnit;
  unitPrice: number;
  extension: number;   // quantity × unitPrice
  category: InventoryCategory;
  inventoryType: InventoryType;
}

export interface InvoiceDetailDto extends PurchaseInvoice {
  lines: InvoiceLine[];
  categoryBreakdown: { category: string; total: number }[];
}

export interface WeeklySummaryDto {
  weekStartDate: string;
  totalFood: number;
  totalBar: number;
  totalOther: number;
  grandTotal: number;
  categoryBreakdown: { category: string; total: number }[];
}
```

---

## Subsystem 3 — Recipes & Menu

```typescript
export interface MenuCostGroup {
  id: number;
  restaurantId: number;
  name: string;
  displayOrder: number;
  targetFoodCostPct: number | null;
  active: boolean;
}

export interface BatchRecipe {
  id: number;
  restaurantId: number;
  name: string;
  yieldQuantity: number;
  yieldUnit: RecipeUnit;
  active: boolean;
  totalCost: number | null;     // derived, Redis-backed
  costPerUnit: number | null;
}

export interface RecipeLine {
  id: number;
  recipeId: number;
  ingredientId: number;
  description: string;
  quantity: number;
  recipeUnit: RecipeUnit;
  ruCost: number;
  lineTotal: number;            // quantity × ruCost
}

export interface RecipeDetailDto extends BatchRecipe {
  lines: RecipeLine[];
  totalCost: number;
  costPerUnit: number;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  costGroupId: number;
  costGroupName: string;
  name: string;
  plu: string | null;
  sellPrice: number;
  totalCost: number | null;     // derived, Redis-backed
  foodCostPct: number | null;   // derived
  active: boolean;
}

export interface CostCardDto extends MenuItem {
  ingredientLines: { description: string; quantity: number; unit: string; cost: number }[];
  recipeLines: { recipeName: string; quantity: number; unit: string; cost: number }[];
  plateCost: number;
  totalCost: number;
  foodCostPct: number;
  gpDollars: number;
}
```

---

## Subsystem 4 — Menu Engineering

```typescript
export type AnalysisStatus = 'DRAFT' | 'FINALISED';
export type Classification = 'WINNER' | 'WORKHORSE' | 'OPPORTUNITY' | 'LOSER';

export interface MenuEngineeringPeriod {
  id: number;
  restaurantId: number;
  costGroupId: number | null;
  costGroupName: string | null;
  periodBeginDate: string;
  periodEndDate: string;
  popularityFactor: number;
  status: AnalysisStatus;
  createdAt: string;
  itemCount: number;
}

export interface EngineeringResultDto {
  menuItemId: number;
  itemNameSnapshot: string;
  quantitySold: number;
  sellPrice: number;
  itemCost: number;
  itemGrossProfit: number;       // sellPrice − itemCost
  salesMixPct: number;           // quantitySold / totalSold
  totalCost: number;             // itemCost × quantitySold
  totalRevenue: number;          // sellPrice × quantitySold
  totalProfit: number;           // totalRevenue − totalCost
  foodCostPct: number;           // itemCost / sellPrice
  gpCategory: 'HIGH' | 'LOW';
  salesMixCategory: 'HIGH' | 'LOW';
  classification: Classification;
}

export interface PeriodSummaryDto {
  periodId: number;
  totalSold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  avgFoodCostPct: number;
  winnerCount: number;
  workhorseCount: number;
  opportunityCount: number;
  loserCount: number;
}

export interface WhatIfResultDto {
  items: (EngineeringResultDto & { priceOverride: number | null })[];
  summary: PeriodSummaryDto;
}
```

---

## Subsystem 5 — POS / Floor

```typescript
export type TableStatus = 'AVAILABLE' | 'OPEN' | 'INACTIVE';
export type SessionStatus = 'OPEN' | 'CLOSED' | 'VOID';
export type OrderStatus = 'OPEN' | 'FIRED' | 'CLOSED' | 'VOID';
export type OrderLineStatus = 'ORDERED' | 'VOIDED' | 'COMPED';

export interface DiningTable {
  id: number;
  restaurantId: number;
  tableNumber: string;
  section: string;
  capacity: number;
  active: boolean;
}

export interface FloorStatusDto {
  tableId: number;
  tableNumber: string;
  section: string;
  capacity: number;
  status: TableStatus;
  activeSessionId: number | null;
  guestCount: number | null;
  sessionDurationMinutes: number | null;
  orderCount: number | null;
  sessionTotal: number | null;
}

export interface TableSession {
  id: number;
  restaurantId: number;
  tableId: number;
  tableNumber: string;
  guestCount: number;
  openedAt: string;
  closedAt: string | null;
  status: SessionStatus;
  sessionTotal: number;
}

export interface Order {
  id: number;
  sessionId: number;
  status: OrderStatus;
  orderedAt: string;
  firedAt: string | null;
  closedAt: string | null;
  orderTotal: number;
}

export interface OrderLine {
  id: number;
  orderId: number;
  menuItemId: number;
  menuItemName: string;
  plu: string | null;
  quantity: number;
  priceAtOrder: number;
  status: OrderLineStatus;
}

export interface SessionDetailDto extends TableSession {
  orders: (Order & { lines: OrderLine[] })[];
  openOrder: (Order & { lines: OrderLine[] }) | null;
  sessionTotal: number;
}
```

---

## KPI DTOs

```typescript
export interface TodayKpiDto {
  grossSalesToday: number;
  coversToday: number;
  checkAvgToday: number;
  openSessionsNow: number;
  compedToday: number;
  foodCostPctToday: number;
  topSeller: { menuItemId: number; name: string; quantitySold: number } | null;
}

export interface FoodCostKpiDto {
  period: string;       // "today" | "week"
  totalCost: number;
  totalRevenue: number;
  foodCostPct: number;
}

export interface PrimeCostTrendPointDto {
  weekStartDate: string;
  grossSales: number;
  totalCOS: number;
  totalLabor: number;
  primeCost: number;
  primeCostPct: number;
  grossMarginPct: number;
}

export interface SellerRankDto {
  rank: number;
  menuItemId: number;
  name: string;
  costGroupName: string;
  quantitySold: number;
  revenue: number;
}

export interface TurnTimeDto {
  section: string;
  dayOfWeek: number;   // 0=Sunday, 1=Monday…
  avgMinutes: number;
}

export interface GuestHeatmapDto {
  rows: {
    timeSlot: string;
    slotLabel: string | null;
    mon: number; tue: number; wed: number;
    thu: number; fri: number; sat: number; sun: number;
    weeklyTotal: number;
    weeklyAverage: number;
  }[];
  dailyTotals: { mon: number; tue: number; wed: number; thu: number; fri: number; sat: number; sun: number };
  grandTotal: number;
}
```

---

## Conversion DTOs

```typescript
export interface ConversionCalculatorRequest {
  purchaseUnit: PurchaseUnit;
  purchaseUnitPrice: number;
  casePackSize: string | null;
  ruPerPu: number;
  yieldPct: number;
  iuPerPu: number;
  ozWeightPerCup: number | null;
  packedBy: 'WEIGHT' | 'VOLUME' | null;
}

export interface ConversionCalculatorResultDto {
  ruCost: number;
  iuCost: number;
  costPerFlOz: number | null;
  costPerWtOz: number | null;
}
```
