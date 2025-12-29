export interface ResumoFinanceiro {
  faturamentoTotal: number;
  totalVendas: number;
  ticketMedio: number;
}

export interface TopProduto {
  id: string;
  nome: string;
  totalVendido: number;
}

export interface EstoqueCriticoItem {
  id: string;
  nome: string;
  quantidade: number;
}

export interface RelatoriosDashboardResponse {
  financeiro: ResumoFinanceiro;
  topProdutos: TopProduto[];
  estoque: {
    itensCriticos: EstoqueCriticoItem[];
  };
  periodo: {
    inicio: string;
    fim: string;
  };
}
