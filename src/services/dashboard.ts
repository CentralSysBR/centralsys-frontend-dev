import { api } from "./api";

export type DashboardAdminOverview = {
  caixa: {
    status: "ABERTO" | "FECHADO";
    valorInicialCentavos: number | null;
    valorAtualCentavos: number | null;
  };
  hoje: {
    entradasCentavos: number;
    despesasCentavos: number;
    lucroCentavos: number;
  };
  produtos: {
    emFalta: number;
    estoqueBaixo: number;
    parados: number;
  };
};

export async function fetchDashboardAdminOverview(): Promise<DashboardAdminOverview> {
  const res = await api.get("/dashboard/admin/overview");
  return res.data.data as DashboardAdminOverview;
}
