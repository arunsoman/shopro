import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/client'
import { useRestaurantStore } from '@/store/useRestaurantStore'

export interface Supplier {
  id: number
  restaurantId: number
  name: string
  contactName: string | null
  phone: string | null
  email: string | null
  accountNumber: string | null
  active: boolean
  createdAt: string
}

export function useSuppliers(activeOnly = true) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<Supplier[]>({
    queryKey: ['suppliers', restaurantId, activeOnly],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/suppliers`, { params: { activeOnly } }).then(r => r.data),
    staleTime: 5 * 60_000,
  })
}

export function useSupplierSearch(fragment: string) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<Supplier[]>({
    queryKey: ['suppliers', 'search', restaurantId, fragment],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/suppliers/search`, { params: { nameFragment: fragment } }).then(r => r.data),
    enabled: fragment.length >= 1,
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (body: Partial<Supplier>) =>
      api.post(`/restaurants/${restaurantId}/suppliers`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers', restaurantId] }),
  })
}

export function useUpdateSupplier() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Supplier> & { id: number }) =>
      api.put(`/restaurants/${restaurantId}/suppliers/${id}`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers', restaurantId] }),
  })
}

export function useDeactivateSupplier() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/restaurants/${restaurantId}/suppliers/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers', restaurantId] }),
  })
}