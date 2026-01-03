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
import { formatCurrencyBR } from "../utils/formatCurrencyBR";

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function Relatorios() {
  /* ======================
     ESTADOS
  ====================== */
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={24} />, path: "/dashboard" },
    { title: "PDV / Vendas", icon: <ShoppingCart size={24} />, path: "/pdv" },
    { title: "Histórico", icon: <History size={24} />, path: "/historico-vendas" },
    { title: "Produtos", icon: <Package size={24} />, path: "/produtos" },
    { title: "Caixa", icon: <Calculator size={24} />, path: "/caixa" },
    { title: "Despesas", icon: <AlertCircle size={24} />, path: "/despesas" },
    { title: "Relatórios", icon: <LayoutDashboard size={24} />, path: "/relatorios" },
    { title: "Mensagens", icon: <MessageSquare size={24} />, path: "/mensagens", disabled: true, badge: "Em breve" },
    { title: "Tarefas", icon: <CheckSquare size={24} />, path: "/tarefas", disabled: true, badge: "Em breve" },
  ] as const;
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
  const margemPercentual = typeof lucro.margemPercentual === "number" ? lucro.margemPercentual : 0;

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
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 inset-x-0 bg-white border-b shadow-sm z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <img src={logo} alt="CentralSys" className="h-7" />
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-[#1A2B3C] shadow-2xl p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="text-white font-black text-lg">Menu</div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition text-white"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => {
                    if ((item as any).disabled) return;
                    navigate((item as any).path);
                    setIsMenuOpen(false);
                  }}
                  className={classNames(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium hover:bg-white/10 text-white",
                    (item as any).disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="text-white/90">{(item as any).icon}</span>
                  <span className="flex-1 text-left">{item.title}</span>
                  {(item as any).badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/80 font-bold">
                      {(item as any).badge}
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-black"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-[80px] p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-[#1A2B3C]">Relatórios</h1>

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
        <p>Total faturado: {formatCurrencyBR(financeiro.faturamentoTotal)}</p>
        <p>Vendas realizadas: {financeiro.totalVendas}</p>
      </section>

      {/* 🏆 TOP PRODUTOS */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Top Produtos</h2>
        <ul>
          {topProdutos.map((p, i) => (
            <li key={i}>
              {p.nome} — {formatCurrencyBR(p.totalFaturadoCentavos)}
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
    </div>
  );
}
