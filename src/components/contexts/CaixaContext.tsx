import { createContext, useContext, useEffect, useState } from "react";
import getCaixaAberto from "../../services/caixa";

/* ======================
   TIPOS
====================== */

export interface CaixaAberto {
  id: string;
  status: "ABERTO" | "FECHADO";
  abertoEm: string;
}

interface CaixaContextData {
  CaixaAberto: CaixaAberto | null;
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
  const [CaixaAberto, setCaixaAberto] = useState<CaixaAberto | null>(null);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    try {
      setCarregando(true);

      const caixa = await getCaixaAberto();

      // 🔒 Garantia explícita de tipo
      if (caixa && caixa.status === "ABERTO") {
        setCaixaAberto(caixa);
      } else {
        setCaixaAberto(null);
      }
    } catch {
      setCaixaAberto(null);
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
        CaixaAberto,
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
