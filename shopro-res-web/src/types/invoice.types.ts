// ─────────────────────────────────────────────────────────────
// invoice.types.ts
// Sourced from: PurchaseInvoice, PurchaseInvoiceLine JPA entities
// ─────────────────────────────────────────────────────────────

import type { InvoiceStatus, PurchaseCategory } from "./enums.types";
import type { Supplier } from "./supplier.types";
import type { GoodsReceipt } from "./goodsReceipt.types";

// ── Core entities ─────────────────────────────────────────────

export interface PurchaseInvoiceLine {
  id: number;
  invoiceId: number;
  purchaseCategory: PurchaseCategory;
  amount: number;
  pct: number;                    // amount / invoiceAmount — DERIVED
}

export interface PurchaseInvoice {
  id: number;
  restaurantId: number;
  supplierId: number;
  supplierName: string;
  goodsReceipt?: GoodsReceipt;    // Linked GRN for matching
  invoiceDate: string;
  invoiceNumber: string | null;
  invoiceAmount: number;
  status: InvoiceStatus;
  lines: PurchaseInvoiceLine[];
  proof: number;                  // invoiceAmount − SUM(lines) — DERIVED
  createdAt: string;
  updatedAt: string;
}

// ── Summary DTOs ──────────────────────────────────────────────

export interface WeeklySummaryDto {
  weekStart: string;
  weekEnd: string;
  totalFood: number;
  totalSoftBeverage: number;
  totalLiquor: number;
  totalBottleBeer: number;
  totalDraftBeer: number;
  totalWine: number;
  totalMerchandise: number;
  totalSupplies: number;
  grandTotal: number;
  categoryBreakdown: CategorySpend[];
}

export interface CategorySpend {
  purchaseCategory: PurchaseCategory;
  amount: number;
  pct: number;
}

export interface SpendBySupplierDto {
  supplierId: number;
  supplierName: string;
  amount: number;
  invoiceCount: number;
}

export interface CategoryTrendPoint {
  weekStart: string;
  purchaseCategory: PurchaseCategory;
  amount: number;
}

export interface ProofAlertDto {
  invoiceId: number;
  invoiceNumber: string | null;
  supplierName: string;
  invoiceDate: string;
  invoiceAmount: number;
  sumOfLines: number;
  variance: number;               // invoiceAmount - sumOfLines
}

export interface SpendTrendDto {
  weekLabel: string;
  trendPercentage: number;
  totalSpend: number;
}

export interface PurchasingDashboardDto {
  weeklySpend: number;
  spendDelta: string;
  openPoCount: number;
  unmatchedGrnCount: number;
  matchingHealth: number;
  spendTrend: SpendTrendDto[];
  latestVouchers: PurchaseInvoice[];
}

// ── Request shapes ────────────────────────────────────────────

export interface CreateDraftRequest {
  supplierId: number;
  invoiceDate: string;
  invoiceNumber?: string;
  invoiceAmount: number;
}

export interface UpsertLineRequest {
  purchaseCategory: PurchaseCategory;
  amount: number;
}

export interface InvoiceListParams {
  restaurantId: number;
  from?: string;
  to?: string;
  supplierId?: number;
  status?: InvoiceStatus;
}
