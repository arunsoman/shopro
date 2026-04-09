import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../../../api/purchaseOrders.api";
import type { CreatePORequest, POListParams } from "../../../types/purchaseOrder.types";

export const poKeys = {
  all: (restaurantId: number) => ['restaurants', restaurantId, 'purchase-orders'] as const,
  lists: (restaurantId: number) => [...poKeys.all(restaurantId), 'list'] as const,
  list: (restaurantId: number, params: POListParams) => [...poKeys.lists(restaurantId), params] as const,
  details: (restaurantId: number) => [...poKeys.all(restaurantId), 'detail'] as const,
  detail: (restaurantId: number, id: number) => [...poKeys.details(restaurantId), id] as const,
  matches: (restaurantId: number) => [...poKeys.all(restaurantId), 'match'] as const,
  match: (restaurantId: number, id: number) => [...poKeys.matches(restaurantId), id] as const,
};

export const usePurchaseOrders = (restaurantId: number, params: POListParams) =>
  useQuery({
    queryKey: poKeys.list(restaurantId, params),
    queryFn: () => api.listPurchaseOrders(restaurantId, params),
  });

export const usePurchaseOrderDetail = (restaurantId: number, id: number) =>
  useQuery({
    queryKey: poKeys.detail(restaurantId, id),
    queryFn: () => api.getPurchaseOrder(restaurantId, id),
    enabled: !!id,
  });

export const useCreatePurchaseOrder = (restaurantId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePORequest) => api.createPurchaseOrder(restaurantId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: poKeys.lists(restaurantId) }),
  });
};

export const useUpdatePOStatus = (restaurantId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.updatePOStatus(restaurantId, id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: poKeys.lists(restaurantId) });
      queryClient.invalidateQueries({ queryKey: poKeys.detail(restaurantId, id) });
    },
  });
};

export const useDeletePurchaseOrder = (restaurantId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deletePurchaseOrder(restaurantId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: poKeys.lists(restaurantId) }),
  });
};

export const useMatchBundle = (restaurantId: number, id: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: poKeys.match(restaurantId, id),
    queryFn: () => api.getMatchBundle(restaurantId, id),
    enabled: !!id && !!restaurantId && (options?.enabled ?? true),
  });
