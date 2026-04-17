import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/client'
import { useRestaurantStore } from '@/store/useRestaurantStore'

export type InventoryType = 'FOOD' | 'BAR'
export type InventoryCategory =
  | 'MEAT' | 'SEAFOOD' | 'PRODUCE' | 'DAIRY' | 'DRY_GOODS'
  | 'BEVERAGES' | 'LIQUOR' | 'WINE' | 'BEER' | 'OTHER'
export type PurchaseUnit = 'LB' | 'OZ' | 'CASE' | 'BOTTLE' | 'KEG' | 'EACH' | 'GALLON' | 'LITER'
export type RecipeUnit = 'OZ_WEIGHT' | 'OZ_FLUID' | 'LB' | 'CUP' | 'TBSP' | 'TSP' | 'LITER' | 'ML' | 'EACH' | 'GALLON'
export type InventoryUnit = 'LB' | 'OZ' | 'EACH' | 'BOTTLE' | 'KEG' | 'GALLON' | 'LITER' | 'CASE'

export interface Ingredient {
  id: number
  restaurantId: number
  itemCode: string
  description: string
  inventoryType: InventoryType
  category: InventoryCategory
  purchaseUnit: PurchaseUnit
  casePackSize: string | null
  purchaseUnitPrice: number
  recipeUnit: RecipeUnit
  ruPerPu: number
  yieldPct: number
  inventoryUnit: InventoryUnit
  iuPerPu: number
  ozWeightPerCup: number | null
  packedBy: 'WEIGHT' | 'VOLUME' | null
  parLevel: number | null
  onHand: number | null
  imageUrl: string | null
  active: boolean
  createdAt: string
}

export interface IngredientCostDto {
  ingredientId: number
  ruCost: number
  iuCost: number
}

export interface LowStockAlertDto {
  ingredientId: number
  itemCode: string
  description: string
  category: InventoryCategory
  inventoryType: InventoryType
  onHand: number
  parLevel: number
  inventoryUnit: InventoryUnit
  shortfallAmount: number
}

export function useIngredients(type?: InventoryType, category?: InventoryCategory) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<Ingredient[]>({
    queryKey: ['ingredients', restaurantId, type, category],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/ingredients`, { params: { type, category } })
        .then(r => r.data),
    staleTime: 2 * 60_000,
  })
}

export function useIngredientSearch(fragment: string) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<Ingredient[]>({
    queryKey: ['ingredients', 'search', restaurantId, fragment],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/ingredients/search`, { params: { fragment } })
        .then(r => r.data),
    enabled: fragment.length >= 2,
  })
}

export function useIngredient(id: number | null) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<Ingredient>({
    queryKey: ['ingredient', restaurantId, id],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/ingredients/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export function useIngredientCosts(id: number | null) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<IngredientCostDto>({
    queryKey: ['ingredient-costs', restaurantId, id],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/ingredients/${id}/costs`).then(r => r.data),
    enabled: !!id,
    staleTime: 24 * 60 * 60_000,
  })
}

export function useLowStockAlerts() {
  const { restaurantId } = useRestaurantStore()
  return useQuery<LowStockAlertDto[]>({
    queryKey: ['low-stock', restaurantId],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/ingredients/low-stock`).then(r => r.data),
    staleTime: 5 * 60_000,
  })
}

export function useCreateIngredient() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (body: Partial<Ingredient>) =>
      api.post(`/restaurants/${restaurantId}/ingredients`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients', restaurantId] }),
  })
}

export function useUpdateIngredient(id: number) {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (body: Partial<Ingredient>) =>
      api.put(`/restaurants/${restaurantId}/ingredients/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients', restaurantId] })
      qc.invalidateQueries({ queryKey: ['ingredient', restaurantId, id] })
      qc.invalidateQueries({ queryKey: ['ingredient-costs', restaurantId, id] })
    },
  })
}

export function useAutoGeneratePO() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()

  return useMutation({
    mutationFn: () =>
      api.post(`/api/purchasing/invoices/auto-generate?restaurantId=${restaurantId}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchaseInvoices', restaurantId] })
    }
  })
}

export function useDeactivateIngredient() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/restaurants/${restaurantId}/ingredients/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients', restaurantId] }),
  })
}