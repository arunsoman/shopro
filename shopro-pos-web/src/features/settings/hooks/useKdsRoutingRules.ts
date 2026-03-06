import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kdsStationApi } from '../api/kdsStationApi';
import type { CreateKDSRoutingRuleRequest, KDSRoutingRule } from '../api/kdsStationApi';
import { toast } from 'sonner';

export const useKdsRoutingRules = () => {
    return useQuery<KDSRoutingRule[]>({
        queryKey: ['kds-routing-rules'],
        queryFn: kdsStationApi.getRoutingRules,
    });
};

export const useCreateKdsRoutingRule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateKDSRoutingRuleRequest) => kdsStationApi.createRoutingRule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kds-routing-rules'] });
            toast.success('Routing rule created');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create routing rule');
        }
    });
};

export const useDeleteKdsRoutingRule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => kdsStationApi.deleteRoutingRule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kds-routing-rules'] });
            toast.success('Routing rule removed');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to remove routing rule');
        }
    });
};
