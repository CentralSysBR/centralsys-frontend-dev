import { api } from "./api";

/* ======================
   TIPOS
====================== */

export interface CaixaAberto {
  id: string;
  status: "ABERTO" | "FECHADO";
  abertoEm: string;
}

/* ======================
   SERVICE
====================== */

/**
 * Retorna o caixa Aberto do usuário logado
 * ou null se não houver caixa aberto
 */
export default async function getCaixaAberto(): Promise<CaixaAberto | null> {
  const resp = await api.get("/caixas/aberto");


  return resp.data?.data ?? null;
}
