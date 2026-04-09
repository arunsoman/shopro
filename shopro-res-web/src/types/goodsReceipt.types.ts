// ─────────────────────────────────────────────────────────────
// goodsReceipt.types.ts
// Sourced from: GoodsReceipt, GoodsReceiptLine JPA entities
// ─────────────────────────────────────────────────────────────

import type { GoodsReceiptStatus } from "./enums.types";
import type { Supplier } from "./supplier.types";
import type { Ingredient } from "./ingredient.types";

export interface GoodsReceiptLine {
  id: number;
  ingredientId: number;
  ingredientDescription?: string;
  receivedQty: number;
  unitPrice: number;
  hasConflict?: boolean;
  conflictReason?: string;
}

export interface GoodsReceipt {
  id: number;
  supplierId: number;
  supplierName: string;
  purchaseOrderId?: number;
  receivedDate: string;
  totalAmount: number;
  status: GoodsReceiptStatus;
  notes?: string;
  lines: GoodsReceiptLine[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGRNRequest {
  supplierId: number;
  purchaseOrderId?: number;
  receivedDate: string;
  notes?: string;
  lines: {
    ingredientId: number;
    receivedQty: number;
    unitPrice: number;
  }[];
}
