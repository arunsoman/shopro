import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { PurchaseOrder, POStatusHistory } from '../api/types';

export const usePurchaseOrders = () => {
    return useQuery({
        queryKey: ['purchase-orders'],
        queryFn: async () => {
            const { data } = await apiClient.get<PurchaseOrder[]>('/pos');
            return data;
        },
    });
};

export const usePOHistory = (poId?: string) => {
    return useQuery({
        queryKey: ['purchase-orders', poId, 'history'],
        queryFn: async () => {
            const { data } = await apiClient.get<POStatusHistory[]>(`/pos/${poId}/history`);
            return data;
        },
        enabled: !!poId,
    });
};

export const useSubmitForApproval = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await apiClient.post<PurchaseOrder>(`/pos/${id}/submit`);
            return data;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] });
        },
    });
};

export const useApprovePO = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, staffId }: { id: string; staffId: string }) => {
            const { data } = await apiClient.post<PurchaseOrder>(`/pos/${id}/approve?approverId=${staffId}`);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
        },
    });
};

export const useRejectPO = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, staffId, reason }: { id: string; staffId: string; reason: string }) => {
            const { data } = await apiClient.post<PurchaseOrder>(`/pos/${id}/reject?approverId=${staffId}&reason=${reason}`);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
        },
    });
};

export const useSendPO = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, staffId }: { id: string; staffId: string }) => {
            const { data } = await apiClient.post<PurchaseOrder>(`/pos/${id}/send?staffId=${staffId}`);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
        },
    });
};

export const useReceiveGoods = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: import('../api/types').ReceiveGoodsRequest }) => {
            const { data: res } = await apiClient.post(`/pos/${id}/receive`, data);
            return res;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
        },
    });
};

export const useMatchInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: import('../api/types').MatchInvoiceRequest }) => {
            const { data: res } = await apiClient.post(`/pos/${id}/match-invoice`, data);
            return res;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
        },
    });
};
