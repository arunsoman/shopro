import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const experimentApi = {
  create: async (restaurantId: number, data: any) => {
    const response = await axios.post(`${API_BASE}/restaurants/${restaurantId}/analytics/experiments`, data, {
      headers: { 'X-User-Id': '00000000-0000-0000-0000-000000000000' } // Placeholder for actual user ID
    });
    return response.data;
  },
  list: async (restaurantId: number) => {
    const response = await axios.get(`${API_BASE}/restaurants/${restaurantId}/analytics/experiments`);
    return response.data;
  },
  getById: async (restaurantId: number, id: string) => {
    const response = await axios.get(`${API_BASE}/restaurants/${restaurantId}/analytics/experiments/${id}`);
    return response.data;
  },
  start: async (restaurantId: number, id: string) => {
    await axios.post(`${API_BASE}/restaurants/${restaurantId}/analytics/experiments/${id}/start`);
  },
  rollback: async (restaurantId: number, id: string, reason: string) => {
    await axios.post(`${API_BASE}/restaurants/${restaurantId}/analytics/experiments/${id}/rollback`, reason);
  }
};
