import { createContext, useContext, useEffect, useState } from "react";
import getCaixaAtivo from "../../services/caixa";

/* ======================
   TIPOS
====================== */

export interface CaixaAtivo {
  id: string;
  status: "ABERTO" | "FECHADO";
  abertoEm: string;
}

interface CaixaContextData {
  caixaAtivo: CaixaAtivo | null;
  carregando: boolean;
  recarregarCaixa: () => Promise<void>;
}

const CaixaContext = createContext<CaixaContextData>(
  {} as CaixaContextData
);

/* ======================
   PROVIDER
====================== */

export function CaixaProvider({ children }: { children: React.ReactNode }) {
  const [caixaAtivo, setCaixaAtivo] = useState<CaixaAtivo | null>(null);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    try {
      setCarregando(true);

      const caixa = await getCaixaAtivo();

      // 🔒 Garantia explícita de tipo
      if (caixa && caixa.status === "ABERTO") {
        setCaixaAtivo(caixa);
      } else {
        setCaixaAtivo(null);
      }
    } catch {
      setCaixaAtivo(null);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <CaixaContext.Provider
      value={{
        caixaAtivo,
        carregando,
        recarregarCaixa: carregar,
      }}
    >
      {children}
    </CaixaContext.Provider>
  );
}

/* ======================
   HOOK
====================== */

export function useCaixa() {
  return useContext(CaixaContext);
}
