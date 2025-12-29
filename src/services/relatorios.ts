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

export async function getRelatoriosDashboard() {
  const response = await api.get("/relatorios/dashboard");
  return response.data;
}

export async function getRelatorioLucro(): Promise<RelatorioLucroResponse> {
  const response = await api.get("/relatorios/financeiro/lucro");
  return response.data.data;
}
