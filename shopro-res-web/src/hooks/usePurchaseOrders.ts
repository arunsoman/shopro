import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/purchaseOrders.api";
import type { CreatePORequest, POListParams } from "../types/purchaseOrder.types";

export const poKeys = {
  all: (restaurantId: number) => ['restaurants', restaurantId, 'purchase-orders'] as const,
  lists: (restaurantId: number) => [...poKeys.all(restaurantId), 'list'] as const,
  list: (restaurantId: number, params: POListParams) => [...poKeys.lists(restaurantId), params] as const,
  details: (restaurantId: number) => [...poKeys.all(restaurantId), 'detail'] as const,
  detail: (restaurantId: number, id: number) => [...poKeys.details(restaurantId), id] as const,
  matchBundles: (restaurantId: number) => [...poKeys.all(restaurantId), 'match-bundle'] as const,
  matchBundle: (restaurantId: number, id: number) => [...poKeys.matchBundles(restaurantId), id] as const,
};

export const usePurchaseOrders = (restaurantId: number, params: Omit<POListParams, 'restaurantId'> = {}) =>
  useQuery({
    queryKey: poKeys.list(restaurantId, { restaurantId, ...params }),
    queryFn: () => api.listPurchaseOrders(restaurantId, { restaurantId, ...params }),
    enabled: !!restaurantId,
  });

export const usePurchaseOrder = (restaurantId: number, id: number) =>
  useQuery({
    queryKey: poKeys.detail(restaurantId, id),
    queryFn: () => api.getPurchaseOrder(restaurantId, id),
    enabled: !!restaurantId && !!id,
  });

export const useCreatePurchaseOrder = (restaurantId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePORequest) => api.createPurchaseOrder(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: poKeys.lists(restaurantId) });
    },
  });
};

export const useUpdatePOStatus = (restaurantId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.updatePOStatus(restaurantId, id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: poKeys.detail(restaurantId, id) });
      queryClient.invalidateQueries({ queryKey: poKeys.lists(restaurantId) });
    },
  });
};

export const usePurchaseMatchBundle = (restaurantId: number, id: number) =>
  useQuery({
    queryKey: poKeys.matchBundle(restaurantId, id),
    queryFn: () => api.getMatchBundle(restaurantId, id),
    enabled: !!restaurantId && !!id,
  });
