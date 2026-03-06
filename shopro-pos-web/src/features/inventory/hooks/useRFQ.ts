import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { type RFQ, type CreateRFQRequest, type VendorBidRequest, type RfqStatus } from '../api/types';

export const useRfqs = (status?: RfqStatus) => {
    return useQuery<RFQ[]>({
        queryKey: ['rfqs', status],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/inventory/rfqs', {
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
            const { data } = await axios.get(`/api/v1/inventory/rfqs/${id}`);
            return data;
        },
        enabled: !!id
    });
};

export const useCreateRfq = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: CreateRFQRequest) => {
            const { data } = await axios.post('/api/v1/inventory/rfqs', request);
            return data;
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
            await axios.post(`/api/v1/inventory/rfqs/${rfqId}/bids`, request);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rfq', rfqId] });
        }
    });
};
