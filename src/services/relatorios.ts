import { api } from "./api";

export async function getRelatoriosDashboard(params?: {
  inicio?: string;
  fim?: string;
}) {
  const response = await api.get("/relatorios/dashboard", {
    params,
  });

  return response.data;
}
