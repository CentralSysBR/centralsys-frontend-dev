import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3333',
});

// Interceptor para anexar o Token JWT em todas as chamadas automáticas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@centralsys:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});