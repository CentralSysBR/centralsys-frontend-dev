import { api } from "./api";

export interface LucroFinanceiro {
  faturamento: number;
  custoTotal: number;
  lucro: number;
  margemPercentual: number;
}

export interface RelatorioLucroResponse {
  lucro: LucroFinanceiro;
  periodo: {
    inicio: string;
    fim: string;
  };
}

/* ======================
   FLUXO FINANCEIRO
====================== */

export interface FluxoDia {
  data: string;
  faturamento: number;
}

export interface RelatorioFluxoResponse {
  totalPeriodo: number;
  mediaDiaria: number;
  diasComVenda: number;
  diasSemVenda: number;
  serie: FluxoDia[];
  insights: string[];
  periodo: {
    inicio: string;
    fim: string;
  };
}

/* ======================
   REQUESTS
====================== */

export async function getRelatoriosDashboard() {
  const response = await api.get("/relatorios/dashboard");
  return response.data;
}

export async function getRelatorioLucro(): Promise<RelatorioLucroResponse> {
  const response = await api.get("/relatorios/financeiro/lucro");
  return response.data.data;
}

export async function getRelatorioFluxo(): Promise<RelatorioFluxoResponse> {
  const response = await api.get("/relatorios/financeiro/fluxo");
  return response.data.data;
}
