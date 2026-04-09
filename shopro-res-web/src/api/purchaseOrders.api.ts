import { apiGet, apiPost, apiDelete, apiPatch } from "./client";
import type { PurchaseOrder, CreatePORequest, POListParams, PurchaseMatchBundle } from "../types/purchaseOrder.types";

export const listPurchaseOrders = async (restaurantId: number, params: POListParams): Promise<PurchaseOrder[]> => {
  // Simple query string builder for params
  const qs = new URLSearchParams();
  if (params.supplierId) qs.append('supplierId', String(params.supplierId));
  if (params.status) qs.append('status', params.status);
  
  const query = qs.toString();
  return apiGet<PurchaseOrder[]>(`/restaurants/${restaurantId}/purchase-orders${query ? `?${query}` : ''}`);
};

export const getPurchaseOrder = async (restaurantId: number, id: number): Promise<PurchaseOrder> => {
  return apiGet<PurchaseOrder>(`/restaurants/${restaurantId}/purchase-orders/${id}`);
};

export const createPurchaseOrder = async (restaurantId: number, body: CreatePORequest): Promise<PurchaseOrder> => {
  return apiPost<PurchaseOrder>(`/restaurants/${restaurantId}/purchase-orders`, body);
};

export const updatePOStatus = async (restaurantId: number, id: number, status: string): Promise<PurchaseOrder> => {
  return apiPatch<PurchaseOrder>(`/restaurants/${restaurantId}/purchase-orders/${id}/status`, { status });
};

export const deletePurchaseOrder = async (restaurantId: number, id: number): Promise<void> => {
  return apiDelete<void>(`/restaurants/${restaurantId}/purchase-orders/${id}`);
};

export const getMatchBundle = async (restaurantId: number, id: number): Promise<PurchaseMatchBundle> => {
  return apiGet<PurchaseMatchBundle>(`/restaurants/${restaurantId}/purchase-orders/${id}/match-bundle`);
};
