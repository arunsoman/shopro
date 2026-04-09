// ─────────────────────────────────────────────────────────────
// common.types.ts
// Shared API response shapes, pagination, error types
// ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export type SortOrder = "ASC" | "DESC";

export interface SortParam {
  field: string;
  order: SortOrder;
}

export interface DateRange {
  from: string; // ISO date string yyyy-MM-dd
  to: string;
}

export interface WeekParam {
  weekStart: string; // ISO date string yyyy-MM-dd (Monday)
}

export interface ReorderRequest {
  id: number;
  displayOrder: number;
}

export interface IdResponse {
  id: number;
}

export interface MessageResponse {
  message: string;
}

// Utility: make all fields in T optional except the ones in K
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Utility: ISO date string brand type for safety
export type ISODateString = string & { readonly _brand: "ISODate" };
export type ISODateTimeString = string & { readonly _brand: "ISODateTime" };
export type ISOTimeString = string & { readonly _brand: "ISOTime" };
