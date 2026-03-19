import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { type RFQ, type CreateRFQRequest, type VendorBidRequest, type RfqStatus, type VendorBid, type CreateBidRequest } from '../api/types';

export const useRfqs = (status?: RfqStatus) => {
    return useQuery<RFQ[]>({
        queryKey: ['rfqs', status],
        queryFn: async () => {
            const { data } = await apiClient.get('/inventory/rfqs', {
                params: { status }
            });
            return data;
        }
    });
};

export const useRfq = (id: string) => {
    return useQuery<RFQ>({
        queryKey: ['rfq', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/inventory/rfqs/${id}`);
            return data;
        },
        enabled: !!id
    });
};

export const useCreateRfq = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: CreateRFQRequest) => {
            const { data } = await apiClient.post('/inventory/rfqs', request);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rfqs'] });
        }
    });
};

export const useCreateBid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: CreateBidRequest) => {
            await apiClient.post('/inventory/rfqs/bid', request);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rfqs'] });
        }
    });
};

export const useSubmitBid = (rfqId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: VendorBidRequest) => {
            await apiClient.post(`/inventory/rfqs/${rfqId}/bids`, request);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rfq', rfqId] });
        }
    });
};

export const useRfqBids = (rfqId: string) => {
    return useQuery<VendorBid[]>({
        queryKey: ['rfq-bids', rfqId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/inventory/rfqs/${rfqId}/bids`);
            return data;
        },
        enabled: !!rfqId
    });
};

export const useAwardBid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (bidId: string) => {
            await apiClient.post(`/inventory/rfqs/bids/${bidId}/award`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rfqs'] });
            queryClient.invalidateQueries({ queryKey: ['rfq'] });
            queryClient.invalidateQueries({ queryKey: ['rfq-bids'] });
        }
    });
};

export const useCancelRfq = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (rfqId: string) => {
            await apiClient.post(`/inventory/rfqs/${rfqId}/cancel`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rfqs'] });
        }
    });
};
