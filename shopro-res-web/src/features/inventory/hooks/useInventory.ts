import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/client'
import { useRestaurantStore } from '@/store/useRestaurantStore'
import type { InventoryType, InventoryCategory, InventoryUnit } from './useIngredients'

export type PeriodStatus = 'OPEN' | 'FINALISED'

export interface InventoryPeriod {
  id: number
  restaurantId: number
  periodDate: string
  inventoryType: InventoryType
  status: PeriodStatus
  finalisedAt: string | null
  totalValue: number | null
}

export interface InventoryLineItem {
  id: number
  periodId: number
  ingredientId: number
  itemCode: string
  description: string
  category: InventoryCategory
  count: number
  inventoryUnit: InventoryUnit
  iuCost: number
  extension: number
}

export interface InventoryPeriodDetailDto extends InventoryPeriod {
  lineItems: InventoryLineItem[]
  categorySubtotals: { category: string; subtotal: number }[]
  totalValue: number
}

export interface LatestInventoryDto {
  periodDate: string
  totalValue: number
  categoryBreakdown: { category: string; subtotal: number }[]
}

export function useInventoryPeriods() {
  const { restaurantId } = useRestaurantStore()
  return useQuery<InventoryPeriod[]>({
    queryKey: ['inventory-periods', restaurantId],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/inventory/periods`).then(r => r.data),
  })
}

export function useCurrentPeriod(type: InventoryType) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<InventoryPeriod>({
    queryKey: ['inventory-period-current', restaurantId, type],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/inventory/periods/current`, { params: { type } })
        .then(r => r.data),
  })
}

export function useLatestInventory(type: InventoryType) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<LatestInventoryDto>({
    queryKey: ['inventory-latest', restaurantId, type],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/inventory/periods/latest`, { params: { type } })
        .then(r => r.data),
  })
}

export function usePeriodDetail(periodId: number | null) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<InventoryPeriodDetailDto>({
    queryKey: ['inventory-period-detail', restaurantId, periodId],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/inventory/periods/${periodId}/detail`)
        .then(r => r.data),
    enabled: !!periodId,
  })
}

export function useOpenPeriod() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (type: InventoryType) =>
      api.post(`/restaurants/${restaurantId}/inventory/periods`, { inventoryType: type }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-periods', restaurantId] })
      qc.invalidateQueries({ queryKey: ['inventory-period-current', restaurantId] })
    },
  })
}

export function useUpdateCount() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: ({ periodId, lineId, count }: { periodId: number; lineId: number; count: number }) =>
      api.put(
        `/restaurants/${restaurantId}/inventory/periods/${periodId}/lines/${lineId}/count`,
        { count }
      ).then(r => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['inventory-period-detail', restaurantId, vars.periodId] })
    },
  })
}

export function useBatchUpdateCounts() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: ({ periodId, counts }: { periodId: number; counts: { lineId: number; count: number }[] }) =>
      api.post(
        `/restaurants/${restaurantId}/inventory/periods/${periodId}/lines/batch`,
        { counts }
      ).then(r => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['inventory-period-detail', restaurantId, vars.periodId] })
      qc.invalidateQueries({ queryKey: ['inventory-period-current', restaurantId] })
    },
  })
}

export function useFinalisePeriod() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (periodId: number) =>
      api.post(`/restaurants/${restaurantId}/inventory/periods/${periodId}/finalise`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-periods', restaurantId] })
      qc.invalidateQueries({ queryKey: ['inventory-period-current', restaurantId] })
      qc.invalidateQueries({ queryKey: ['inventory-latest', restaurantId] })
    },
  })
}

export function useComparePeriods(id1: number | null, id2: number | null) {
  const { restaurantId } = useRestaurantStore()
  return useQuery({
    queryKey: ['inventory-compare', restaurantId, id1, id2],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/inventory/periods/${id1}/compare/${id2}`)
        .then(r => r.data),
    enabled: !!id1 && !!id2,
  })
}