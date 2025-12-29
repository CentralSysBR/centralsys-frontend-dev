import { api } from "./api";

/* ======================
   TIPOS
====================== */

export interface VendaItem {
  id: string;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
  produto: {
    nome: string;
  };
}

export interface Venda {
  id: string;
  criadoEm: string;
  valorTotal: number;
  metodoPagamento: string;

  usuario: {
    nome: string;
  };

  itens: VendaItem[];

  _count?: {
    itens: number;
  };
}

interface ApiResponse<T> {
  status: "success";
  data: T;
  meta?: {
    paginacao?: {
      total: number;
      pagina: number;
      paginasTotais: number;
    };
  };
}

/* ======================
   LISTAR VENDAS
====================== */

export async function getVendas(pagina = 1, limite = 10) {
  const response = await api.get<ApiResponse<Venda[]>>(
    `/vendas?pagina=${pagina}&limite=${limite}`
  );

  return response.data;
}

/* ======================
   CRIAR VENDA
====================== */

interface CriarVendaInput {
  caixaId: string;
  metodoPagamento: string;
  itens: {
    produtoId: string;
    quantidade: number;
  }[];
}

export async function criarVenda(data: CriarVendaInput) {
  const response = await api.post<ApiResponse<Venda>>("/vendas", data);
  return response.data.data;
}

/* ======================
   DETALHE DA VENDA
====================== */

export async function getVendaDetalhe(id: string) {
  const response = await api.get<ApiResponse<Venda>>(`/vendas/${id}`);
  return response.data.data;
}
