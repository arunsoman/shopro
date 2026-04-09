import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "../api/invoices.api"
import type { InvoiceListParams, CreateDraftRequest, UpsertLineRequest } from "../types"

export const invoiceKeys = {
  all: (restaurantId: number) => ['restaurants', restaurantId, 'invoices'] as const,
  lists: (restaurantId: number) => [...invoiceKeys.all(restaurantId), 'list'] as const,
  list: (restaurantId: number, params: InvoiceListParams) => [...invoiceKeys.lists(restaurantId), params] as const,
  details: (restaurantId: number) => [...invoiceKeys.all(restaurantId), 'detail'] as const,
  detail: (restaurantId: number, id: number) => [...invoiceKeys.details(restaurantId), id] as const,
  summaries: (restaurantId: number) => [...invoiceKeys.all(restaurantId), 'summary'] as const,
  weekly: (restaurantId: number, weekStart: string) => [...invoiceKeys.summaries(restaurantId), 'weekly', weekStart] as const,
  trends: (restaurantId: number, category: string, weeks: number) => [...invoiceKeys.summaries(restaurantId), 'trend', category, weeks] as const,
  dashboard: (restaurantId: number, date: string) => ['restaurants', restaurantId, 'purchasing-dashboard', date] as const,
}

export const useInvoices = (restaurantId: number, params: InvoiceListParams) =>
  useQuery({
    queryKey: invoiceKeys.list(restaurantId, params),
    queryFn: () => api.listInvoices(restaurantId, params),
  })

export const useInvoiceDetail = (restaurantId: number, id: number) =>
  useQuery({
    queryKey: invoiceKeys.detail(restaurantId, id),
    queryFn: () => api.getInvoiceDetail(restaurantId, id),
    enabled: !!id,
  })

export const useCreateInvoiceDraft = (restaurantId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDraftRequest) => api.createDraft(restaurantId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invoiceKeys.lists(restaurantId) }),
  })
}

export const usePostInvoice = (restaurantId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.postInvoice(restaurantId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists(restaurantId) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(restaurantId, id) })
    },
  })
}

export const useUpsertInvoiceLine = (restaurantId: number, invoiceId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpsertLineRequest) => api.upsertLine(restaurantId, invoiceId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(restaurantId, invoiceId) }),
  })
}

export const useRemoveInvoiceLine = (restaurantId: number, invoiceId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lineId: number) => api.removeLine(restaurantId, invoiceId, lineId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(restaurantId, invoiceId) }),
  })
}

export const useUpdateInvoiceHeader = (restaurantId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateDraftRequest> }) => api.updateInvoiceHeader(restaurantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(restaurantId, id) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists(restaurantId) })
    },
  })
}

export const useWeeklySummary = (restaurantId: number, weekStart: string) =>
  useQuery({
    queryKey: invoiceKeys.weekly(restaurantId, weekStart),
    queryFn: () => api.getWeeklySummary(restaurantId, weekStart),
  })

export const usePurchasingDashboard = (restaurantId: number, date: string) =>
  useQuery({
    queryKey: invoiceKeys.dashboard(restaurantId, date),
    queryFn: () => api.getPurchasingDashboard(restaurantId, date),
  })
