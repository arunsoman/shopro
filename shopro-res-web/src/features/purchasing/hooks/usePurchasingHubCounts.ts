import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api/client'
import { useRestaurantStore } from '@/store/useRestaurantStore'

/**
 * DTO for Purchasing Hub navigation card counts.
 * Matches the backend PurchasingHubCountsDTO.
 */
export interface PurchasingHubCounts {
  /** Number of ingredients below par level needing reorder */
  reorderStagingCount: number
  /** Number of POs that need to be sent (DRAFT, SENT, PARTIAL) */
  purchaseOrdersToSendCount: number
  /** Number of Goods Receipts pending invoice creation */
  goodsReceiptsPendingCount: number
  /** Number of 3-way matches pending */
  threeWayMatchPendingCount: number
}

/**
 * Hook to fetch all Purchasing Hub counts in a single query.
 * Optimized for navigation card badges.
 * 
 * @example
 * const { data, isLoading, error } = usePurchasingHubCounts()
 * 
 * // Access counts
 * const reorderCount = data?.reorderStagingCount
 * const poCount = data?.purchaseOrdersToSendCount
 * const grCount = data?.goodsReceiptsPendingCount
 * const matchCount = data?.threeWayMatchPendingCount
 */
export function usePurchasingHubCounts() {
  const { restaurantId } = useRestaurantStore()

  return useQuery<PurchasingHubCounts>({
    queryKey: ['purchasing-hub', 'counts', restaurantId],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/purchasing-hub/counts`).then(r => r.data),
    staleTime: 30_000, // 30 seconds - counts change frequently
    refetchInterval: 60_000, // Auto-refresh every minute
  })
}
