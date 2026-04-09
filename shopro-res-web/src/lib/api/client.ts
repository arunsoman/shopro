import axios from 'axios'
import { useRestaurantStore } from '@/store/useRestaurantStore'
 
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: { 
    'Content-Type': 'application/json',
    'X-Device-Fingerprint': 'shopro-res-web-client'
  },
  timeout: 15000,
})
 
api.interceptors.request.use((config) => {
  const { authToken, restaurantId } = useRestaurantStore.getState()
  
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  
  if (restaurantId) {
    config.headers['X-Restaurant-Id'] = restaurantId.toString()
  }
  
  return config
})
 
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useRestaurantStore.getState().clearAuth()
    }
    return Promise.reject(err)
  }
)
 
export const apiClient = api
export default api
 