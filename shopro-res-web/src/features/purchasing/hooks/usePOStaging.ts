import { useMemo } from 'react';
import { useLowStockAlerts, type LowStockAlertDto } from '../../inventory/hooks/useIngredients';
import { useRestaurantStore } from '@/store/useRestaurantStore';

export interface StagingItem {
  id: number;
  itemCode: string;
  description: string;
  category: string;
  onHand: number;
  parLevel: number;
  shortfall: number;
  unit: string;
  isOrdered: boolean;
  activePOId?: number;
}

export function usePOStaging() {
  const { restaurantId } = useRestaurantStore();
  
  // Get all items below par - this is the ONLY API call
  const { data: alerts = [], isLoading } = useLowStockAlerts();

  const stagingItems = useMemo(() => {
    return alerts
      .map((alert: LowStockAlertDto) => ({
        id: alert.ingredientId,
        itemCode: alert.itemCode,
        description: alert.description,
        category: alert.category || 'OTHER',
        onHand: Number(alert.onHand) || 0,
        parLevel: Number(alert.parLevel) || 0,
        shortfall: Number(alert.shortfallAmount) || 0,
        unit: alert.inventoryUnit || 'EACH',
        isOrdered: false,
      }));
  }, [alerts]);

  return {
    data: stagingItems,
    isLoading
  };
}
