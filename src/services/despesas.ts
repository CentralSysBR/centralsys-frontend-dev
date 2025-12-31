import { api } from "./api";

export async function getDespesasDashboard(
  inicio: Date,
  fim: Date
) {
  const res = await api.get("/despesas/dashboard", {
    params: { inicio, fim },
  });

  return res.data;
}
