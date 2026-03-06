import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kdsStationApi } from '../api/kdsStationApi';
import type { CreateKDSStationRequest, UpdateKDSStationRequest, KDSStation } from '../api/kdsStationApi';
import { toast } from 'sonner';

export const useKdsStations = () => {
    return useQuery<KDSStation[]>({
        queryKey: ['kds-stations'],
        queryFn: kdsStationApi.getAll,
    });
};

export const useCreateKdsStation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateKDSStationRequest) => kdsStationApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kds-stations'] });
            toast.success('KDS Station created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create KDS Station');
        }
    });
};

export const useUpdateKdsStation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateKDSStationRequest }) =>
            kdsStationApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kds-stations'] });
            toast.success('KDS Station updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update KDS Station');
        }
    });
};

export const useToggleKdsStationStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => kdsStationApi.toggleStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kds-stations'] });
        },
    });
};

export const useDeleteKdsStation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => kdsStationApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kds-stations'] });
            toast.success('KDS Station deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete KDS Station');
        }
    });
};
