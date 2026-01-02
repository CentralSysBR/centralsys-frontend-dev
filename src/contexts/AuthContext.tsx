import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

export type AuthUsuario = {
  id: string;
  nome: string;
  email: string;
  papel: string;
};

export type AuthEmpresa = {
  id: string;
  nome: string;
};

type AuthState = {
  usuario: AuthUsuario | null;
  empresa: AuthEmpresa | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchMe(): Promise<{ usuario: AuthUsuario; empresa: AuthEmpresa }> {
  const { data } = await api.get("/auth/me");
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<AuthUsuario | null>(null);
  const [empresa, setEmpresa] = useState<AuthEmpresa | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    const me = await fetchMe();
    setUsuario(me.usuario);
    setEmpresa(me.empresa);
  }

  async function login(email: string, password: string) {
    await api.post("/auth/login", { email, password });
    await refreshMe();
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      setUsuario(null);
      setEmpresa(null);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } catch {
        setUsuario(null);
        setEmpresa(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ usuario, empresa, loading, login, logout, refreshMe }),
    [usuario, empresa, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
