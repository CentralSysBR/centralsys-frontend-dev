import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

/**
 * Separate client WITHOUT interceptors to avoid infinite loops when refreshing.
 */
const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<void> | null = null;
let refreshDisabled = false;

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/me")
  );
}

async function refreshSessionOnce(): Promise<void> {
  if (refreshDisabled) throw new Error("refresh_disabled");
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh")
      .then(() => {
        refreshDisabled = false;
      })
      .catch((err) => {
        refreshDisabled = true; // stop thrashing until explicit login
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  await refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as RetriableRequest | undefined;

    // Never refresh on auth endpoints (prevents recursion / infinite loops)
    if (status !== 401 || !original || original._retry || isAuthEndpoint(original.url)) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      await refreshSessionOnce();
      return api(original);
    } catch {
      return Promise.reject(error);
    }
  }
);

/**
 * 🔍 Busca produto por GTIN (Bluesoft via backend)
 */
export async function buscarProdutoPorGTIN(gtin: string) {
  const response = await api.get(`/produtos/gtin/${gtin}`);
  return response.data;
}
