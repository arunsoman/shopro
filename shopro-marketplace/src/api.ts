import axios from 'axios';
import { loadingManager } from './lib/LoadingManager';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for JWT injection and loading state
api.interceptors.request.use((config) => {
  loadingManager.startRequest();
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  loadingManager.stopRequest();
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  loadingManager.stopRequest();
  return response;
}, (error) => {
  loadingManager.stopRequest();
  return Promise.reject(error);
});

export default api;
