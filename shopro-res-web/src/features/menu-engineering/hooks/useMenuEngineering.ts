import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/client'
import { useRestaurantStore } from '@/store/useRestaurantStore'

export type AnalysisStatus = 'DRAFT' | 'FINALISED'
export type Classification = 'WINNER' | 'WORKHORSE' | 'OPPORTUNITY' | 'LOSER'

export interface MenuEngineeringPeriod {
  id: number
  restaurantId: number
  costGroupId: number | null
  costGroupName: string | null
  periodBeginDate: string
  periodEndDate: string
  popularityFactor: number
  status: AnalysisStatus
  createdAt: string
  itemCount: number
}

export interface EngineeringResultDto {
  menuItemId: number
  itemNameSnapshot: string
  quantitySold: number
  sellPrice: number
  itemCost: number
  itemGrossProfit: number
  salesMixPct: number
  totalCost: number
  totalRevenue: number
  totalProfit: number
  foodCostPct: number
  gpCategory: 'HIGH' | 'LOW'
  salesMixCategory: 'HIGH' | 'LOW'
  classification: Classification
}

export interface PeriodSummaryDto {
  periodId: number
  totalSold: number
  totalRevenue: number
  totalCost: number
  totalProfit: number
  avgFoodCostPct: number
  winnerCount: number
  workhorseCount: number
  opportunityCount: number
  loserCount: number
}

export function useEngineeringPeriods() {
  const { restaurantId } = useRestaurantStore()
  return useQuery<MenuEngineeringPeriod[]>({
    queryKey: ['engineering-periods', restaurantId],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/menu-engineering/periods`).then(r => r.data),
  })
}

export function useEngineeringResults(periodId: number | null) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<EngineeringResultDto[]>({
    queryKey: ['engineering-results', restaurantId, periodId],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/menu-engineering/periods/${periodId}/results`).then(r => r.data),
    enabled: !!periodId,
    staleTime: 5 * 60_000,
  })
}

export function useEngineeringSummary(periodId: number | null) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<PeriodSummaryDto>({
    queryKey: ['engineering-summary', restaurantId, periodId],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/menu-engineering/periods/${periodId}/summary`).then(r => r.data),
    enabled: !!periodId,
  })
}

export function useCreateEngineeringPeriod() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (body: Partial<MenuEngineeringPeriod>) =>
      api.post(`/restaurants/${restaurantId}/menu-engineering/periods`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['engineering-periods', restaurantId] }),
  })
}

export function useRunAnalysis() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (periodId: number) =>
      api.post(`/restaurants/${restaurantId}/menu-engineering/periods/${periodId}/run`).then(r => r.data),
    onSuccess: (_data, periodId) => {
      qc.invalidateQueries({ queryKey: ['engineering-results', restaurantId, periodId] })
      qc.invalidateQueries({ queryKey: ['engineering-summary', restaurantId, periodId] })
      qc.invalidateQueries({ queryKey: ['engineering-periods', restaurantId] })
    },
  })
}

export function useWhatIf(periodId: number | null) {
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (overrides: { menuItemId: number; sellPrice: number }[]) =>
      api.post(`/restaurants/${restaurantId}/menu-engineering/periods/${periodId}/simulate`, { overrides })
        .then(r => r.data),
  })
}

export function useComparePeriods(id1: number | null, id2: number | null) {
  const { restaurantId } = useRestaurantStore()
  return useQuery({
    queryKey: ['engineering-compare', restaurantId, id1, id2],
    queryFn: () =>
      api.post(`/restaurants/${restaurantId}/menu-engineering/periods/compare`, { periodId1: id1, periodId2: id2 })
        .then(r => r.data),
    enabled: !!id1 && !!id2,
  })
}