import { api } from "./api";

import type { RelatoriosDashboardResponse } from "../types/relatorios";

export async function getRelatoriosDashboard(params?: {
  inicio?: string;
  fim?: string;
}): Promise<{ status: string; data: RelatoriosDashboardResponse }> {
  const response = await api.get("/relatorios/dashboard", {
    params,
  });

  return response.data;
}
