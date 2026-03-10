import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { RFQResponse, VendorBidRequest } from '../api/types';

const API_BASE = '/api/v1/supplier/portal';

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
            const { data } = await axios.get(`${API_BASE}/${supplierId}/dashboard`);
            return data;
        },
        enabled: !!supplierId
    });
};

export const useSupplierPortalRfqs = (supplierId?: string) => {
    return useQuery<RFQResponse[]>({
        queryKey: ['supplier-portal-rfqs', supplierId],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/${supplierId}/rfqs`);
            return data;
        },
        enabled: !!supplierId
    });
};

export const useSupplierPortalInventory = (supplierId?: string) => {
    return useQuery<SupplierInventoryView[]>({
        queryKey: ['supplier-portal-inventory', supplierId],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/${supplierId}/inventory`);
            return data;
        },
        enabled: !!supplierId
    });
};

export const useSubmitPortalBid = (rfqId: string, supplierUserId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: VendorBidRequest) =>
            axios.post(`${API_BASE}/${rfqId}/bid?userId=${supplierUserId}`, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplier-portal-rfqs'] });
            queryClient.invalidateQueries({ queryKey: ['supplier-dashboard'] });
        }
    });
};

export const useProposePrice = (userId: string) => {
    return useMutation({
        mutationFn: (request: VendorPriceProposalRequest) =>
            axios.post(`${API_BASE}/propose-price?userId=${userId}`, request)
    });
};
