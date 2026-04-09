import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/client'
import { useRestaurantStore } from '@/store/useRestaurantStore'

export type InvoiceStatus = 'DRAFT' | 'POSTED' | 'VOID'

export interface PurchaseInvoice {
  id: number
  restaurantId: number
  supplierId: number
  supplierName: string
  invoiceDate: string
  invoiceNumber: string | null
  status: InvoiceStatus
  totalAmount: number
  lineCount: number
  createdAt: string
  postedAt: string | null
}

export interface InvoiceLine {
  id: number
  invoiceId: number
  ingredientId: number
  description: string
  quantity: number
  purchaseUnit: string
  unitPrice: number
  extension: number
  category: string
  inventoryType: string
}

export interface InvoiceDetailDto extends PurchaseInvoice {
  lines: InvoiceLine[]
  categoryBreakdown: { category: string; total: number }[]
}

export function useInvoices(status?: InvoiceStatus | 'ALL', supplierId?: number) {
  const { restaurantId } = useRestaurantStore()
  const queryStatus = (status === 'ALL' || !status) ? undefined : status
  return useQuery<PurchaseInvoice[]>({
    queryKey: ['invoices', 'list', restaurantId, queryStatus, supplierId],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/invoices`, { params: { status: queryStatus, supplierId } })
        .then(r => r.data),
  })
}

export function useDraftInvoiceCount() {
  const { data } = useInvoices('DRAFT')
  return { data: Math.max(0, data?.length ?? 0) }
}

export function useInvoice(id: number | null) {
  const { restaurantId } = useRestaurantStore()
  return useQuery<InvoiceDetailDto>({
    queryKey: ['invoice', 'detail', restaurantId, id],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/invoices/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (body: Partial<PurchaseInvoice>) =>
      api.post(`/restaurants/${restaurantId}/invoices`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices', 'list', restaurantId] }),
  })
}

export function usePostInvoice() {
  const qc = useQueryClient()
  const { restaurantId } = useRestaurantStore()
  return useMutation({
    mutationFn: (id: number) =>
      api.post(`/restaurants/${restaurantId}/invoices/${id}/post`).then(r => r.data),
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['invoices', 'list', restaurantId] })
        qc.invalidateQueries({ queryKey: ['invoice', 'detail', restaurantId] })
    },
  })
}

export function useWeeklySummary(startDate: string, endDate: string) {
  const { restaurantId } = useRestaurantStore()
  return useQuery({
    queryKey: ['purchase-weekly-summary', restaurantId, startDate, endDate],
    queryFn: () =>
      api.get(`/restaurants/${restaurantId}/invoices/weekly-summary`, { params: { from: startDate, to: endDate } })
        .then(r => r.data),
    enabled: !!startDate && !!endDate,
  })
}

// Keep search here as it is often used in invoice entry
export function useIngredientSearch(fragment: string) {
    const { restaurantId } = useRestaurantStore()
    return useQuery({
        queryKey: ['ingredients', 'search', restaurantId, fragment],
        queryFn: () =>
            api.get(`/ingredients/search`, { params: { nameFragment: fragment } }).then(r => r.data),
        enabled: fragment.length >= 1,
    })
}
