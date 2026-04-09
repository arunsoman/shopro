import { apiGet, apiPost, apiPut, apiDelete } from "./client"
import type { Supplier } from "../types"

const BASE = (restaurantId: number) => `/restaurants/${restaurantId}/suppliers`

export const listSuppliers = (restaurantId: number): Promise<Supplier[]> =>
  apiGet(BASE(restaurantId))

export const searchSuppliers = (restaurantId: number, query: string): Promise<Supplier[]> =>
  apiGet(`${BASE(restaurantId)}/search?q=${query}`)

export const createSupplier = (restaurantId: number, data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> =>
  apiPost(BASE(restaurantId), data)

export const updateSupplier = (restaurantId: number, id: number, data: Partial<Supplier>): Promise<Supplier> =>
  apiPut(`${BASE(restaurantId)}/${id}`, data)

export const deactivateSupplier = (restaurantId: number, id: number): Promise<void> =>
  apiDelete(`${BASE(restaurantId)}/${id}`)
