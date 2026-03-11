import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { PurchaseOrder, ShipOrderRequest, CounterOfferRequest } from '../api/types';

export const useAcknowledgePO = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
            const { data } = await apiClient.post<PurchaseOrder>(`/supplier/portal/pos/${id}/acknowledge?userId=${userId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            queryClient.invalidateQueries({ queryKey: ['supplier-dashboard'] });
        },
    });
};

export const useCounterOfferPO = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, userId, request }: { id: string; userId: string; request: CounterOfferRequest }) => {
            const { data } = await apiClient.post<PurchaseOrder>(`/supplier/portal/pos/${id}/counter-offer?userId=${userId}`, request);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        },
    });
};

export const useShipPO = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, userId, request }: { id: string; userId: string; request: ShipOrderRequest }) => {
            const { data } = await apiClient.post<PurchaseOrder>(`/supplier/portal/pos/${id}/ship?userId=${userId}`, request);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            queryClient.invalidateQueries({ queryKey: ['supplier-dashboard'] });
        },
    });
};
