import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { RFQResponse, VendorBidRequest, PurchaseOrder } from '../api/types';

const API_BASE = '/supplier/portal';

export interface SupplierDashboardData {
    activeRfqCount: number;
    pendingBidCount: number;
    wonBidsLast30Days: number;
    winRate: number;
    lastSyncAt: string;
}

export interface SupplierInventoryView {
    ingredientId: string;
    ingredientName: string;
    currentStock: number;
    unitOfMeasure: string;
    parLevel: number;
    belowPar: boolean;
    currentVendorPrice: number;
}

export interface VendorPriceProposalRequest {
    supplierId: string;
    ingredientId: string;
    proposedPrice: number;
    notes?: string;
}

export const useSupplierDashboard = (supplierId?: string) => {
    return useQuery<SupplierDashboardData>({
        queryKey: ['supplier-dashboard', supplierId],
        queryFn: async () => {
            const { data } = await apiClient.get(`${API_BASE}/${supplierId}/dashboard`);
            return data;
        },
        enabled: !!supplierId
    });
};

export const useSupplierPortalRfqs = (supplierId?: string) => {
    return useQuery<RFQResponse[]>({
        queryKey: ['supplier-rfqs', supplierId],
        queryFn: async () => {
            const { data } = await apiClient.get(`${API_BASE}/${supplierId}/rfqs`);
            return data;
        },
        enabled: !!supplierId
    });
};

export const useSupplierPortalInventory = (supplierId?: string) => {
    return useQuery<SupplierInventoryView[]>({
        queryKey: ['supplier-inventory', supplierId],
        queryFn: async () => {
            const { data } = await apiClient.get(`${API_BASE}/${supplierId}/inventory`);
            return data;
        },
        enabled: !!supplierId
    });
};

export const useSubmitPortalBid = (rfqId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, request }: { userId: string, request: VendorBidRequest }) => {
            await apiClient.post(`${API_BASE}/${rfqId}/bid`, request, {
                params: { userId }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplier-portal-rfqs'] });
            queryClient.invalidateQueries({ queryKey: ['supplier-dashboard'] });
        }
    });
};

export const useProposePrice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, request }: { userId: string, request: VendorPriceProposalRequest }) => {
            await apiClient.post(`${API_BASE}/propose-price`, request, {
                params: { userId }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplier-inventory'] });
        }
    });
};

export const useSupplierPortalPOs = (supplierId?: string) => {
    return useQuery<PurchaseOrder[]>({
        queryKey: ['supplier-pos', supplierId],
        queryFn: async () => {
            const { data } = await apiClient.get(`${API_BASE}/${supplierId}/pos`);
            return data;
        },
        enabled: !!supplierId
    });
};

export const useMyProposals = (supplierId?: string) => {
    return useQuery<any[]>({
        queryKey: ['supplier-proposals', supplierId],
        queryFn: async () => {
            const { data } = await apiClient.get(`${API_BASE}/${supplierId}/proposals`);
            return data;
        },
        enabled: !!supplierId
    });
};

export const useCounterOffer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, userId, request }: { id: string, userId: string, request: any }) => {
            const { data } = await apiClient.post(`${API_BASE}/pos/${id}/counter-offer?userId=${userId}`, request);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['supplier-pos'] });
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
        }
    });
};
