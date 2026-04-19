import { useQuery } from '@tanstack/react-query';
import { useRestaurantStore } from '@/store/useRestaurantStore';

interface PreferredVendorMap {
  ingredientId: number;
  supplierId: number;
  supplierName: string;
  isPreferred: boolean;
  unitCost?: number; // Price per purchase unit
}

async function fetchPreferredVendors(restaurantId: number): Promise<PreferredVendorMap[]> {
  const response = await fetch(`/api/v1/restaurants/${restaurantId}/preferred-vendors`);
  if (!response.ok) throw new Error('Failed to fetch preferred vendors');
  const data = await response.json();
  
  // Transform to ingredient -> supplier mapping
  return data.map((pv: any) => ({
    ingredientId: pv.ingredient?.id || pv.ingredientId,
    supplierId: pv.supplier?.id || pv.supplierId,
    supplierName: pv.supplier?.name || pv.supplierName || 'Unknown',
    isPreferred: pv.preferred || pv.isPreferred,
    unitCost: pv.unitCost ? Number(pv.unitCost) : undefined,
  }));
}

export function usePreferredVendors(restaurantId?: number) {
  const storeRestaurantId = useRestaurantStore(s => s.restaurantId);
  const resolvedId = restaurantId || storeRestaurantId;

  return useQuery({
    queryKey: ['preferred-vendors', resolvedId],
    queryFn: () => fetchPreferredVendors(resolvedId),
    enabled: !!resolvedId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
