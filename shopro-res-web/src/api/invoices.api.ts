import { apiGet, apiPost, apiPut, apiDelete } from "./client"
import type { 
  PurchaseInvoice, 
  InvoiceListParams, 
  CreateDraftRequest, 
  UpsertLineRequest,
  WeeklySummaryDto,
  SpendBySupplierDto,
  CategoryTrendPoint,
  ProofAlertDto,
  PurchasingDashboardDto
} from "../types"

const getBase = (restaurantId: number) => `/restaurants/${restaurantId}/invoices`
const getRestaurantBase = (restaurantId: number) => `/restaurants/${restaurantId}`

export const listInvoices = (restaurantId: number, params: InvoiceListParams): Promise<PurchaseInvoice[]> => {
  // Filter out undefined or null values from params
  const cleanParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      cleanParams[key] = String(value);
    }
  });
  
  const query = new URLSearchParams(cleanParams).toString()
  return apiGet(`${getBase(restaurantId)}${query ? `?${query}` : ''}`)
}

export const getInvoiceDetail = (restaurantId: number, id: number): Promise<PurchaseInvoice> =>
  apiGet(`${getBase(restaurantId)}/${id}`)

export const createDraft = (restaurantId: number, data: CreateDraftRequest): Promise<PurchaseInvoice> =>
  apiPost(getBase(restaurantId), data)

export const postInvoice = (restaurantId: number, id: number): Promise<PurchaseInvoice> =>
  apiPost(`${getBase(restaurantId)}/${id}/post`)

export const voidInvoice = (restaurantId: number, id: number): Promise<PurchaseInvoice> =>
  apiPost(`${getBase(restaurantId)}/${id}/void`)

export const upsertLine = (restaurantId: number, invoiceId: number, data: UpsertLineRequest): Promise<PurchaseInvoice> =>
  apiPut(`${getBase(restaurantId)}/${invoiceId}/lines`, data)

export const removeLine = (restaurantId: number, invoiceId: number, lineId: number): Promise<PurchaseInvoice> =>
  apiDelete(`${getBase(restaurantId)}/${invoiceId}/lines/${lineId}`)

export const updateInvoiceHeader = (restaurantId: number, id: number, data: Partial<CreateDraftRequest>): Promise<PurchaseInvoice> =>
  apiPut(`${getBase(restaurantId)}/${id}`, data)

export const getWeeklySummary = (restaurantId: number, weekStart: string): Promise<WeeklySummaryDto> =>
  apiGet(`${getBase(restaurantId)}/summary/weekly?weekStart=${weekStart}`)

export const getSpendBySupplier = (restaurantId: number, from: string, to: string): Promise<SpendBySupplierDto[]> =>
  apiGet(`${getBase(restaurantId)}/summary/supplier?from=${from}&to=${to}`)

export const getCategoryTrend = (restaurantId: number, category: string, weeks: number): Promise<CategoryTrendPoint[]> =>
  apiGet(`${getBase(restaurantId)}/summary/trend?category=${category}&weeks=${weeks}`)

export const getProofAlerts = (restaurantId: number): Promise<ProofAlertDto[]> =>
  apiGet(`${getBase(restaurantId)}/alerts/proof`)

export const getPurchasingDashboard = (restaurantId: number, date: string): Promise<PurchasingDashboardDto> =>
  apiGet(`${getRestaurantBase(restaurantId)}/dashboard?date=${date}`)
