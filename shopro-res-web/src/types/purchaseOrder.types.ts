// ─────────────────────────────────────────────────────────────
// purchaseOrder.types.ts
// Sourced from: PurchaseOrder, PurchaseOrderLine JPA entities
// ─────────────────────────────────────────────────────────────

import type { PurchaseOrderStatus } from "./enums.types";
import type { Supplier } from "./supplier.types";
import type { Ingredient } from "./ingredient.types";

export interface PurchaseOrderLine {
  id: number;
  purchaseOrderId: number;
  ingredientId: number;
  ingredientDescription?: string;
  ingredientCode?: string;
  orderedUnit?: string;
  orderedQty: number;
  receivedQty: number;
  unitPrice: number;
  lineTotal?: number;
}

export interface PurchaseOrder {
  id: number;
  restaurantId: number;
  supplierId: number;
  supplierName: string;
  poNumber: string;
  issueDate: string;
  status: PurchaseOrderStatus;
  lines: PurchaseOrderLine[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePORequest {
  supplierId: number;
  issueDate: string;
  lines: {
    ingredientId: number;
    orderedQty: number;
    unitPrice: number;
  }[];
}

export interface POListParams {
  restaurantId: number;
  supplierId?: number;
  status?: PurchaseOrderStatus;
}

export interface PurchaseMatchBundle {
  purchaseOrder: PurchaseOrder;
  goodsReceipts: import("./goodsReceipt.types").GoodsReceipt[];
  invoices: import("./invoice.types").PurchaseInvoice[];
  summary: {
    totalOrdered: number;
    totalReceived: number;
    totalBilled: number;
    totalVariance: number;
    matchStatus: "PERFECT" | "VARIANCE" | "LEAK";
  };
}
