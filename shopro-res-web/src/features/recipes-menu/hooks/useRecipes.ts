import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/client'
import { useRestaurantStore } from '@/store/useRestaurantStore'

// ── Types ──────────────────────────────────────────────────────
export interface MenuCostGroup {
  id: number
  restaurantId: number
  name: string
  displayOrder: number
  targetFoodCostPct: number | null
  active: boolean
}

export interface RecipeProcedureStep {
  id?: number
  stepNumber: number
  instruction: string
  criticalControlPoint: boolean
}

export interface BatchRecipe {
  id: number
  restaurantId: number
  name: string
  yieldQuantity: number
  yieldUnit: string
  station: string
  shelfLife: string
  toolsEquipment: string
  positionNotes: string
  active: boolean
  totalCost: number | null
  costPerUnit: number | null
  ingredientLines: RecipeLine[]
  procedureSteps: RecipeProcedureStep[]
}

export interface RecipeLine {
  id?: number
  ingredientId: number
  description: string
  quantity: number
  recipeUnit: string
  ruCost: number
  lineTotal: number
}

export interface RecipeDetailDto extends BatchRecipe {}

export interface MenuItem {
  id: number
  restaurantId: number
  costGroupId: number
  costGroupName: string
  name: string
  plu: string | null
  sellPrice: number
  totalCost: number | null
  foodCostPct: number | null
  active: boolean
  prepTimeMinutes: number | null
}

export interface CostCardDto extends MenuItem {
  ingredientLines: { description: string; quantity: number; unit: string; cost: number }[]
  recipeLines: { recipeName: string; quantity: number; unit: string; cost: number }[]
  plateCost: number
  totalCost: number
  foodCostPct: number
  gpDollars: number
  prepTimeMinutes: number | null
}

// ── Cost Groups ────────────────────────────────────────────────
export function useCostGroups() {
  const { restaurantId } = useRestaurantStore()
  return useQuery<MenuCostGroup[]>({
    queryKey: ['cost-groups', restaurantId],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/cost-groups`).then(r => r.data),
    staleTime: 5 * 60_000,
  })
}

export function useCreateCostGroup() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (body: Partial<MenuCostGroup>) =>
      api.post(`/restaurants/${restaurantId}/cost-groups`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cost-groups', restaurantId] }),
  })
}

// ── Recipes ────────────────────────────────────────────────────
export function useRecipes(activeOnly = true) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<BatchRecipe[]>({
    queryKey: ['recipes', restaurantId, activeOnly],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/recipes`, { params: { active: activeOnly } }).then(r => r.data),
  })
}

export function useRecipe(id: number | null) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<RecipeDetailDto>({
    queryKey: ['recipe', restaurantId, id],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/recipes/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export function useCreateRecipe() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (body: Partial<BatchRecipe>) =>
      api.post(`/restaurants/${restaurantId}/recipes`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes', restaurantId] }),
  })
}

export function useUpdateRecipe(id: number) {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (body: Partial<BatchRecipe>) =>
      api.put(`/restaurants/${restaurantId}/recipes/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipe', restaurantId, id] })
      qc.invalidateQueries({ queryKey: ['recipes', restaurantId] })
    },
  })
}

export function useDeleteRecipe() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/restaurants/${restaurantId}/recipes/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes', restaurantId] }),
  })
}

// ── Menu Items ─────────────────────────────────────────────────
export function useMenuItems(costGroupId?: number) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<MenuItem[]>({
    queryKey: ['menu-items', restaurantId, costGroupId],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/menu-items`, { params: { costGroupId } }).then(r => r.data),
    staleTime: 2 * 60_000,
  })
}

export function useCostCard(menuItemId: number | null) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<CostCardDto>({
    queryKey: ['cost-card', restaurantId, menuItemId],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/menu-items/${menuItemId}/cost-card`).then(r => r.data),
    enabled: !!menuItemId,
  })
}

export function useCreateMenuItem() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (body: Partial<MenuItem>) =>
      api.post(`/restaurants/${restaurantId}/menu-items`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-items', restaurantId] }),
  })
}

export function useUpdateMenuItem(id: number) {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (body: Partial<MenuItem>) =>
      api.put(`/restaurants/${restaurantId}/menu-items/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items', restaurantId] })
      qc.invalidateQueries({ queryKey: ['cost-card', restaurantId, id] })
    },
  })
}

export function useDeleteMenuItem() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/restaurants/${restaurantId}/menu-items/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-items', restaurantId] }),
  })
}

// ── Search & Utils ─────────────────────────────────────────────
export function useSearchIngredients(query: string) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<any[]>({
    queryKey: ['search-ingredients', restaurantId, query],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/ingredients/search`, { params: { q: query } }).then(r => r.data),
    enabled: query.length > 1,
  })
}

export function useUpdateCostingLines(id: number) {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (lines: any[]) =>
      api.post(`/restaurants/${restaurantId}/menu-config/${id}/linkage`, lines).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cost-card', restaurantId, id] })
    },
  })
}

export function useUpdateMenuItemHeader(id: number) {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (body: Partial<MenuItem>) =>
      api.put(`/restaurants/${restaurantId}/menu-items/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items', restaurantId] })
      qc.invalidateQueries({ queryKey: ['cost-card', restaurantId, id] })
    },
  })
}
