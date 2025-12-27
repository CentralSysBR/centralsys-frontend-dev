import axios from 'axios';

// Prioriza a variável de ambiente do Vite, caso contrário usa o IP local
const baseURL = import.meta.env.VITE_API_URL || 'http://192.168.0.248:3333';

export const api = axios.create({
  baseURL,
});

// Interceptor para anexar o Token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@centralsys:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de resposta para tratar expiração de sessão
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sessão expirada ou token inválido.");
      localStorage.removeItem('@centralsys:token');
      localStorage.removeItem('@centralsys:user');
      // window.location.href = "/"; // Opcional: Redirecionar para login
    }
    return Promise.reject(error);
  }
);