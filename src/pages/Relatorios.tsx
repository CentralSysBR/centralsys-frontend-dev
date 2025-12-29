import { useEffect, useState } from "react";

import {
  getRelatoriosDashboard,
  getRelatorioLucro,
  getRelatorioFluxo,
  type ApiResponse,
  type DashboardRelatorios,
  type LucroFinanceiro,
  type FluxoFinanceiro,
} from "../services/relatorios";

import { CardLucro } from "../components/relatorios";
import { CardFluxo } from "../components/relatorios/CardFluxo";
import { GraficoFluxo } from "../components/relatorios/GraficoFluxo";

export default function Relatorios() {
  /* ======================
     ESTADOS
  ====================== */
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [dashboard, setDashboard] =
    useState<ApiResponse<DashboardRelatorios> | null>(null);

  const [lucroResp, setLucroResp] =
    useState<ApiResponse<LucroFinanceiro> | null>(null);

  const [fluxoResp, setFluxoResp] =
    useState<ApiResponse<FluxoFinanceiro> | null>(null);

  /* ======================
     EFFECT
  ====================== */
  useEffect(() => {
    async function carregar() {
      try {
        const [dashboardData, lucroData, fluxoData] = await Promise.all([
          getRelatoriosDashboard(),
          getRelatorioLucro(),
          getRelatorioFluxo(),
        ]);

        setDashboard(dashboardData);
        setLucroResp(lucroData);
        setFluxoResp(fluxoData);
      } catch (e) {
        console.error("[Relatorios] erro ao carregar", e);
        setErro("Erro ao carregar relatórios.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  /* ======================
     GUARDS
  ====================== */
  if (loading) return <p>Carregando relatórios...</p>;
  if (erro) return <p>{erro}</p>;
  if (!dashboard || !lucroResp) return <p>Dados incompletos.</p>;

  /* ======================
     NORMALIZAÇÃO
  ====================== */
  const { financeiro, topProdutos, estoque } = dashboard.data;

  const lucro = lucroResp.data;
  const margemPercentual = lucro.margemPercentual;

  const insightLucro =
    margemPercentual > 0 && margemPercentual < 20
      ? "Você vende bem, mas sua margem está baixa"
      : margemPercentual < 0
      ? "Você está vendendo com prejuízo"
      : null;

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>

      {/* 💰 LUCRO */}
      <CardLucro
        lucro={lucro.lucro}
        margem={margemPercentual}
        insight={insightLucro}
      />

      {/* 📈 FLUXO FINANCEIRO */}
      {fluxoResp && (
        <>
          <CardFluxo
            total={fluxoResp.data.totalPeriodo}
            media={fluxoResp.data.mediaDiaria}
            insights={fluxoResp.insights ?? []}
          />

          <GraficoFluxo dados={fluxoResp.data.dias} />
        </>
      )}

      {/* 📊 RESUMO FINANCEIRO */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Resumo Financeiro</h2>
        <p>Total faturado: R$ {financeiro.faturamentoTotal}</p>
        <p>Vendas realizadas: {financeiro.totalVendas}</p>
      </section>

      {/* 🏆 TOP PRODUTOS */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Top Produtos</h2>
        <ul>
          {topProdutos.map((p, i) => (
            <li key={i}>
              {p.nome} — R$ {p.totalFaturado}
            </li>
          ))}
        </ul>
      </section>

      {/* 📦 ESTOQUE */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Estoque Crítico</h2>
        <ul>
          {estoque.itensCriticos.map((p, i) => (
            <li key={i}>
              {p.nome} — {p.qtd}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
