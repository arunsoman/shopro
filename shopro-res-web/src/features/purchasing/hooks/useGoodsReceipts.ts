import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../../../api/goodsReceipts.api";
import type { CreateGRNRequest } from "../../../types/goodsReceipt.types";

export const grnKeys = {
  all: (restaurantId: number) => ['restaurants', restaurantId, 'goods-receipts'] as const,
  lists: (restaurantId: number) => [...grnKeys.all(restaurantId), 'list'] as const,
  details: (restaurantId: number) => [...grnKeys.all(restaurantId), 'detail'] as const,
  detail: (restaurantId: number, id: number) => [...grnKeys.details(restaurantId), id] as const,
};

export const useGoodsReceipts = (restaurantId: number, params?: { supplierId?: number }) =>
  useQuery({
    queryKey: [...grnKeys.lists(restaurantId), params],
    queryFn: () => api.listGoodsReceipts(restaurantId, params),
    enabled: !!restaurantId,
  });

export const useGoodsReceiptDetail = (restaurantId: number, id: number) =>
  useQuery({
    queryKey: grnKeys.detail(restaurantId, id),
    queryFn: () => api.getGoodsReceipt(restaurantId, id),
    enabled: !!restaurantId && !!id,
  });

export const useCreateGoodsReceipt = (restaurantId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGRNRequest) => api.createGoodsReceipt(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grnKeys.lists(restaurantId) });
    },
  });
};

export const useFinaliseGoodsReceipt = (restaurantId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.finaliseGoodsReceipt(restaurantId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: grnKeys.lists(restaurantId) });
      queryClient.invalidateQueries({ queryKey: grnKeys.detail(restaurantId, id) });
      // Also invalidate ingredient list to show new onHand values
      queryClient.invalidateQueries({ queryKey: ['restaurants', restaurantId, 'ingredients'] });
    },
  });
};

export const useStaleGRNs = (restaurantId: number) =>
  useQuery({
    queryKey: [...grnKeys.all(restaurantId), 'stale'],
    queryFn: () => api.getStaleGRNs(restaurantId),
  });

export const useGRNConflicts = (restaurantId: number) =>
  useQuery({
    queryKey: [...grnKeys.all(restaurantId), 'conflicts'],
    queryFn: () => api.getGRNConflicts(restaurantId),
    enabled: !!restaurantId,
  });

export const useRaiseLineConflict = (restaurantId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ grnId, lineId, reason }: { grnId: number; lineId: number; reason: string }) =>
      api.raiseLineConflict(restaurantId, grnId, lineId, reason),
    onSuccess: (_, { grnId }) => {
      queryClient.invalidateQueries({ queryKey: grnKeys.detail(restaurantId, grnId) });
      queryClient.invalidateQueries({ queryKey: grnKeys.lists(restaurantId) });
    },
  });
};

export const useResolveLineConflict = (restaurantId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ grnId, lineId }: { grnId: number; lineId: number }) =>
      api.resolveLineConflict(restaurantId, grnId, lineId),
    onSuccess: (_, { grnId }) => {
      queryClient.invalidateQueries({ queryKey: grnKeys.detail(restaurantId, grnId) });
      queryClient.invalidateQueries({ queryKey: grnKeys.lists(restaurantId) });
    },
  });
};
