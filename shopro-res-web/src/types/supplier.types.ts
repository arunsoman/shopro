// ─────────────────────────────────────────────────────────────
// supplier.types.ts
// Sourced from: Supplier JPA entity
// ─────────────────────────────────────────────────────────────

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
  updatedAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  accountNumber?: string;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}
