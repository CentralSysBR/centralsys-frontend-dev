import { api } from "./api";

/* ======================
   TIPOS
====================== */

export interface CaixaAtivo {
  id: string;
  status: "ABERTO" | "FECHADO";
  abertoEm: string;
}

/* ======================
   SERVICE
====================== */

/**
 * Retorna o caixa ativo do usuário logado
 * ou null se não houver caixa aberto
 */
export default async function getCaixaAtivo(): Promise<CaixaAtivo | null> {
  const resp = await api.get("/caixa/ativo");

  // contrato esperado:
  // { data: CaixaAtivo | null }
  return resp.data?.data ?? null;
}
