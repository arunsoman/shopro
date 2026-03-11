import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { type PriceProposal, type ReviewProposalRequest } from '../api/types';

export const usePendingProposals = () => {
    return useQuery<PriceProposal[]>({
        queryKey: ['proposals', 'pending'],
        queryFn: async () => {
            const { data } = await apiClient.get('/inventory/proposals/pending');
            return data;
        }
    });
};

export const useReviewProposal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, request }: { id: string; request: ReviewProposalRequest }) => {
            const { data } = await apiClient.post(`/inventory/proposals/${id}/review`, request);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proposals'] });
            queryClient.invalidateQueries({ queryKey: ['ingredients'] }); // Refetch pricing
        }
    });
};

export const useProposalHistory = () => {
    return useQuery<PriceProposal[]>({
        queryKey: ['proposals', 'history'],
        queryFn: async () => {
            const { data } = await apiClient.get('/inventory/proposals/history');
            return data;
        }
    });
};

export const useCreatePoFromProposal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, staffId }: { id: string; staffId: string }) => {
            const { data } = await apiClient.post(`/inventory/proposals/${id}/create-po`, null, {
                params: { staffId }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos'] });
        }
    });
};
