import { apiGet, apiPost } from "./client";
import type { GoodsReceipt, CreateGRNRequest } from "../types/goodsReceipt.types";
import type { PurchaseInvoice } from "../types/invoice.types";

export const listGoodsReceipts = async (restaurantId: number, params?: { supplierId?: number }): Promise<GoodsReceipt[]> => {
    const qs = new URLSearchParams();
    if (params?.supplierId) qs.append('supplierId', String(params.supplierId));
    
    const query = qs.toString();
    return apiGet<GoodsReceipt[]>(`/restaurants/${restaurantId}/purchasing/grns${query ? `?${query}` : ''}`);
};

export const getGoodsReceipt = async (restaurantId: number, id: number): Promise<GoodsReceipt> => {
    return apiGet<GoodsReceipt>(`/restaurants/${restaurantId}/purchasing/grns/${id}`);
};

export const createGoodsReceipt = async (restaurantId: number, body: CreateGRNRequest): Promise<GoodsReceipt> => {
    return apiPost<GoodsReceipt>(`/restaurants/${restaurantId}/purchasing/grns`, body);
};

export const finaliseGoodsReceipt = async (restaurantId: number, id: number): Promise<PurchaseInvoice> => {
    return apiPost<PurchaseInvoice>(`/restaurants/${restaurantId}/purchasing/grns/${id}/finalise`, {});
};

export const getStaleGRNs = async (restaurantId: number): Promise<GoodsReceipt[]> => {
    return apiGet<GoodsReceipt[]>(`/restaurants/${restaurantId}/purchasing/grns/stale`);
};

export const getGRNConflicts = async (restaurantId: number): Promise<GoodsReceipt[]> => {
    return apiGet<GoodsReceipt[]>(`/restaurants/${restaurantId}/purchasing/grns/conflicts`);
};

export const raiseLineConflict = async (restaurantId: number, grnId: number, lineId: number, reason: string): Promise<GoodsReceipt> => {
    return apiPost<GoodsReceipt>(`/restaurants/${restaurantId}/purchasing/grns/${grnId}/lines/${lineId}/conflict`, { reason });
};

export const resolveLineConflict = async (restaurantId: number, grnId: number, lineId: number): Promise<GoodsReceipt> => {
    return apiPost<GoodsReceipt>(`/restaurants/${restaurantId}/purchasing/grns/${grnId}/lines/${lineId}/resolve`, {});
};
