import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RestaurantStore {
  restaurantId: number
  restaurantName: string
  authToken: string | null
  setAuth: (token: string, restaurantId: number, name: string) => void
  clearAuth: () => void
}

export const useRestaurantStore = create<RestaurantStore>()(
  persist(
    (set) => ({
      restaurantId: 1,
      restaurantName: 'Bistro Verde',
      authToken: null,
      setAuth: (token, restaurantId, name) =>
        set({ authToken: token, restaurantId, restaurantName: name }),
      clearAuth: () => set({ authToken: null }),
    }),
    { name: 'restaurant-store' }
  )
)