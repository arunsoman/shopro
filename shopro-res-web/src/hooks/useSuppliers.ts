import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "../api/suppliers.api"
import type { Supplier } from "../types"

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: (restaurantId: number) => [...supplierKeys.all, 'list', restaurantId] as const,
  search: (restaurantId: number, query: string) => [...supplierKeys.all, 'search', restaurantId, query] as const,
}

export const useSuppliers = (restaurantId: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: supplierKeys.lists(restaurantId),
    queryFn: () => api.listSuppliers(restaurantId),
    enabled: options?.enabled ?? true,
  })

export const useSearchSuppliers = (restaurantId: number, query: string) =>
  useQuery({
    queryKey: supplierKeys.search(restaurantId, query),
    queryFn: () => api.searchSuppliers(restaurantId, query),
    enabled: query.length > 1,
  })

export const useCreateSupplier = (restaurantId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => 
      api.createSupplier(restaurantId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.lists(restaurantId) }),
  })
}

export const useUpdateSupplier = (restaurantId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Supplier> }) => 
      api.updateSupplier(restaurantId, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.lists(restaurantId) }),
  })
}
