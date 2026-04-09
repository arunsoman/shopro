import { useMemo } from 'react';
import { useLowStockAlerts } from '../../inventory/hooks/useIngredients';
import { usePurchaseOrders } from './usePurchaseOrders';
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
  
  // 1. Get all items below par
  const { data: alerts = [], isLoading: loadingAlerts } = useLowStockAlerts();
  
  // 2. Get active Purchase Orders (DRAFT or SENT)
  const { data: draftPOs = [], isLoading: loadingDrafts } = usePurchaseOrders(restaurantId, { status: 'DRAFT' } as any);
  const { data: sentPOs = [], isLoading: loadingSent } = usePurchaseOrders(restaurantId, { status: 'SENT' } as any);
  const { data: partialPOs = [], isLoading: loadingPartial } = usePurchaseOrders(restaurantId, { status: 'PARTIAL' } as any);

  const stagingItems = useMemo(() => {
    // Collect all ingredient IDs that are currently in an active PO
    // Unless the PO is partial, we might still want to see the item? 
    // The user said: "unless Po has been canceled or when a certain item listed in a po was partial"
    // This implies if it's in a DRAFT or SENT PO, it's HIDDEN.
    // If it's in a PARTIAL PO, it might be visible if the shortfall still exists.
    
    const activePOIngredientIds = new Set<number>();
    
    [...draftPOs, ...sentPOs].forEach(po => {
      po.lines?.forEach((line: any) => activePOIngredientIds.add(line.ingredientId));
    });

    // For PARTIAL, the user said "unless... partial". 
    // This usually means "it was partial, so I still need more".
    // So we don't add partial PO items to the 'active' set (which hides them).
    
    return alerts
      .filter(alert => !activePOIngredientIds.has((alert as any).id ?? alert.ingredientId))
      .map(alert => ({
        id: ((alert as any).id ?? alert.ingredientId) as number,
        itemCode: alert.itemCode,
        description: alert.description,
        category: alert.category,
        onHand: alert.currentCount,
        parLevel: alert.parLevel,
        shortfall: alert.shortfallAmount,
        unit: alert.inventoryUnit,
        isOrdered: false,
      }));
  }, [alerts, draftPOs, sentPOs]);

  return {
    data: stagingItems,
    isLoading: loadingAlerts || loadingDrafts || loadingSent || loadingPartial
  };
}
