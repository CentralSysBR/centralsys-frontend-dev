import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://192.168.0.248:3333',
});

// Interceptor para anexar o Token JWT em todas as chamadas automáticas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@centralsys:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Opcional: Interceptor de resposta para debugar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sessão expirada ou token inválido.");
      // Opcional: localStorage.clear(); window.location.href = "/";
    }
    return Promise.reject(error);
  }
);