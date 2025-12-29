import { api } from "./api";

/* ======================
   BASE API
====================== */

export interface ApiPeriodo {
  inicio: string;
  fim: string;
}

export interface ApiMeta {
  periodo?: ApiPeriodo;
}

export interface ApiResponse<T> {
  status: "success";
  data: T;
  meta?: ApiMeta;
  insights?: string[];
}

/* ======================
   LUCRO
====================== */

export interface LucroFinanceiro {
  faturamento: number;
  custoTotal: number;
  lucro: number;
  margemPercentual: number;
}

/* ======================
   FLUXO FINANCEIRO
====================== */

export interface FluxoDia {
  data: string;
  total: number;
}

export interface FluxoFinanceiro {
  totalPeriodo: number;
  mediaDiaria: number;
  dias: FluxoDia[];
}

/* ======================
   DASHBOARD
====================== */

export interface DashboardRelatorios {
  financeiro: {
    faturamentoTotal: number;
    totalVendas: number;
    ticketMedio: number;
    porMetodo: {
      metodo: string;
      valor: number;
    }[];
  };
  topProdutos: {
    nome: string;
    quantidade: number;
    totalFaturado: number;
  }[];
  estoque: {
    totalItens: number;
    alertaEstoqueBaixo: number;
    valorTotalEstoque: number;
    itensCriticos: {
      nome: string;
      qtd: number;
    }[];
  };
}

/* ======================
   REQUESTS
====================== */

export async function getRelatoriosDashboard(): Promise<
  ApiResponse<DashboardRelatorios>
> {
  const response = await api.get("/relatorios/dashboard");
  return response.data;
}

export async function getRelatorioLucro(): Promise<
  ApiResponse<LucroFinanceiro>
> {
  const response = await api.get("/relatorios/financeiro/lucro");
  return response.data;
}

export async function getRelatorioFluxo(): Promise<
  ApiResponse<FluxoFinanceiro>
> {
  const response = await api.get("/relatorios/financeiro/fluxo");
  return response.data;
}
