import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";

import logo from "../assets/logo_full_color.svg";
import { useAuth } from "../contexts/AuthContext";
import { SideMenuList, sideMenuItems } from "../components/layout";

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
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [dashboard, setDashboard] =
    useState<ApiResponse<DashboardRelatorios> | null>(null);

  const [lucroResp, setLucroResp] =
    useState<ApiResponse<LucroFinanceiro> | null>(null);

  const [fluxoResp, setFluxoResp] =
    useState<ApiResponse<FluxoFinanceiro> | null>(null);

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

    void carregar();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-600">Carregando relatórios...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-red-600">{erro}</p>
      </div>
    );
  }

  if (!dashboard || !lucroResp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-600">Dados incompletos.</p>
      </div>
    );
  }

  const { financeiro, topProdutos, estoque } = dashboard.data;

  const lucro = lucroResp.data;
  const margemPercentual =
    typeof lucro.margemPercentual === "number" ? lucro.margemPercentual : 0;

  const insightLucro =
    margemPercentual > 0 && margemPercentual < 20
      ? "Você vende bem, mas sua margem está baixa"
      : margemPercentual < 0
      ? "Você está vendendo com prejuízo"
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 inset-x-0 bg-white border-b shadow-sm z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <img src={logo} alt="CentralSys" className="h-7" />
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition"
            aria-label="Abrir menu"
            type="button"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-[#1A2B3C] shadow-2xl p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="text-white font-black text-lg">Menu</div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition text-white"
                aria-label="Fechar menu"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <SideMenuList
              items={sideMenuItems}
              onSelect={(path) => {
                navigate(path);
                setIsMenuOpen(false);
              }}
            />

            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
                navigate("/");
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-black"
              type="button"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      )}

      <div className="pt-[80px] p-6 space-y-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-[#1A2B3C]">Relatórios</h1>

        <CardLucro
          lucro={lucro.lucro}
          margem={margemPercentual}
          insight={insightLucro}
        />

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

        <section className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Resumo Financeiro</h2>
          <p>Total faturado: {formatCurrencyBR(financeiro.faturamentoTotal)}</p>
          <p>Vendas realizadas: {financeiro.totalVendas}</p>
        </section>

        <section className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Top Produtos</h2>
          <ul className="space-y-1">
            {topProdutos.map((p, i) => (
              <li key={i} className="text-sm text-gray-700">
                {p.nome} — {formatCurrencyBR(p.totalFaturadoCentavos)}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Estoque Crítico</h2>
          <ul className="space-y-1">
            {estoque.itensCriticos.map((p, i) => (
              <li key={i} className="text-sm text-gray-700">
                {p.nome} — {p.qtd}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
