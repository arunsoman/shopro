import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useRestaurantStore } from '@/store/useRestaurantStore';

export interface DashboardMetrics {
  grossSalesToday: number;
  grossSalesDelta: number;
  coversToday: number;
  coversDelta: number;
  checkAvgToday: number;
  checkAvgDelta: number;
  foodCostPctToday: number;
  foodCostPctDelta: number;
  openSessionsNow: number;
  topSellerToday: string;
  lowStockCount: number;
  draftInvoiceCount: number;
  primeCostTrend: number[];
  primeCostTarget: number;
}

export function useDashboard() {
  const restaurantId = useRestaurantStore((s) => s.restaurantId);

  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard', restaurantId],
    queryFn: async () => {
      const response = await apiClient.get(`/restaurants/${restaurantId}/analytics/dashboard`);
      return response.data;
    },
    enabled: !!restaurantId,
    refetchInterval: 60000, // Auto-refresh every 60s as per UX spec
  });
}
