import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface ManagementProfile {
    id?: string;
    restaurantName: string;
    weekStartDate: string;
    taxesBenefitsRate: number;
}

const API_BASE = '/api/management/profile';

export const useManagementProfile = () => {
    return useQuery<ManagementProfile>({
        queryKey: ['management-profile'],
        queryFn: async () => {
            const { data } = await axios.get(API_BASE);
            return data;
        }
    });
};

export const useSaveManagementProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (profile: ManagementProfile) => axios.post(API_BASE, profile),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['management-profile'] });
        }
    });
};
