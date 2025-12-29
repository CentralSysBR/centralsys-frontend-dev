import { api } from "./api";

/* ======================
   BASE
====================== */

export interface ApiResponse<T> {
  status: "success";
  data: T;
  meta?: {
    paginacao?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

/* ======================
   PRODUTO
====================== */

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  codigoBarras?: string;
  imagemUrl?: string;
  precoVenda: number;
  precoCusto?: number;
  quantidadeEstoque: number;
}

/* ======================
   GTIN
====================== */

export interface ProdutoGTIN {
  nome: string;
  codigoBarras: string;
  marca?: string;
  categoria?: string;
  imagemUrl?: string;
  unidadeVenda?: "UNIDADE" | "CAIXA";
}

/* ======================
   REQUESTS
====================== */

export async function getProdutos(params?: {
  busca?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Produto[]>> {
  const response = await api.get("/produtos", { params });
  return response.data;
}

export async function getProdutoPorGTIN(
  codigo: string
): Promise<ApiResponse<ProdutoGTIN>> {
  const response = await api.get(`/produtos/gtin/${codigo}`);
  return response.data;
}

export async function createProduto(data: Partial<Produto>) {
  const response = await api.post("/produtos", data);
  return response.data;
}

export async function updateProduto(id: string, data: Partial<Produto>) {
  const response = await api.put(`/produtos/${id}`, data);
  return response.data;
}

export async function updateEstoqueProduto(
  id: string,
  quantidadeAdicionada: number,
  novoPrecoVenda?: number
) {
  const response = await api.patch(`/produtos/${id}/estoque`, {
    quantidadeAdicionada,
    novoPrecoVenda,
  });
  return response.data;
}

export async function deleteProduto(id: string) {
  await api.delete(`/produtos/${id}`);
}
