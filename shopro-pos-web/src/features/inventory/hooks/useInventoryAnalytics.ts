import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface InventoryStats {
    activePOsCount: number;
    totalInventoryValue: number;
    monthlyWasteAmount: number;
    wastePercentageOfSales: number;
}

export function useInventoryStats() {
    return useQuery<InventoryStats>({
        queryKey: ['inventory', 'stats'],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/inventory/analytics/dashboard');
            return data;
        },
    });
}
