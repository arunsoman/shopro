import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface InventoryStats {
    foodInventoryValue: number;
    barInventoryValue: number;
    belowParCount: number;
}

export function useInventoryStats() {
    return useQuery<InventoryStats>({
        queryKey: ['inventory-stats'],
        queryFn: async () => {
            const response = await apiClient.get('/inventory/stats');
            return response.data;
        }
    });
}
