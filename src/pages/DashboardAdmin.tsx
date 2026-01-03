import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Calculator, History, Loader2, Lock, LogOut, Menu, Package, ShoppingCart, Unlock, X } from "lucide-react";

import logo from "../assets/logo_full_color.svg";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { fetchDashboardAdminOverview, type DashboardAdminOverview } from "../services/dashboard";
import { formatCurrencyBR } from "../utils/formatCurrencyBR";
import { maskCurrencyInputBR } from "../utils/maskCurrencyInputBR";
import { parseCurrencyBR } from "../utils/parseCurrencyBR";
import { ModalFecharCaixa } from "../components/ModalFecharCaixa";

type OpenCaixaState =
  | { open: false }
  | { open: true; valorInput: string; loading: boolean; error: string | null };

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const { usuario, empresa, logout } = useAuth();

  const [now, setNow] = useState(() => new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [data, setData] = useState<DashboardAdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fecharCaixaOpen, setFecharCaixaOpen] = useState(false);
  const [caixaIdToFechar, setCaixaIdToFechar] = useState<string | null>(null);

  const [abrirCaixa, setAbrirCaixa] = useState<OpenCaixaState>({ open: false });

  const empresaNome = empresa?.nome ?? "—";
  const caixaStatus = data?.caixa.status ?? "FECHADO";

  const menuItems = [
    { title: "PDV / Vendas", icon: <ShoppingCart size={24} />, path: "/pdv" },
    { title: "Histórico", icon: <History size={24} />, path: "/historico-vendas" },
    { title: "Produtos", icon: <Package size={24} />, path: "/produtos" },
    { title: "Caixa", icon: <Calculator size={24} />, path: "/caixa" },
  ];

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const overview = await fetchDashboardAdminOverview();
      setData(overview);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 403) {
        navigate("/pdv", { replace: true });
        return;
      }
      setError("Não foi possível carregar o dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!usuario) return;
    if (usuario.papel !== "ADMIN") navigate("/pdv", { replace: true });
  }, [usuario, navigate]);

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const lucroHoje = useMemo(() => formatCurrencyBR(data?.hoje.lucroCentavos), [data?.hoje.lucroCentavos]);
  const entradasHoje = useMemo(() => formatCurrencyBR(data?.hoje.entradasCentavos), [data?.hoje.entradasCentavos]);
  const saidasHoje = useMemo(() => formatCurrencyBR(data?.hoje.despesasCentavos), [data?.hoje.despesasCentavos]);

  const totalEmCaixa = useMemo(() => {
    if (data?.caixa.status !== "ABERTO") return formatCurrencyBR(0);
    return formatCurrencyBR(data.caixa.valorAtualCentavos);
  }, [data]);

  const valorInicialCaixa = useMemo(() => formatCurrencyBR(data?.caixa.valorInicialCentavos), [data?.caixa.valorInicialCentavos]);

  async function handleChipCaixaClick() {
    if (loading) return;

    if (caixaStatus === "FECHADO") {
      setAbrirCaixa({ open: true, valorInput: "", loading: false, error: null });
      return;
    }

    try {
      const res = await api.get("/caixas/aberto");
      const caixa = res.data?.data as { id?: string } | null;
      if (!caixa?.id) {
        setError("Não foi possível identificar o caixa aberto.");
        return;
      }
      setCaixaIdToFechar(caixa.id);
      setFecharCaixaOpen(true);
    } catch {
      setError("Não foi possível abrir o fechamento de caixa.");
    }
  }

  async function submitAbrirCaixa() {
    if (!abrirCaixa.open) return;

    const valorInicialCentavos = parseCurrencyBR(abrirCaixa.valorInput);
    if (!Number.isInteger(valorInicialCentavos) || valorInicialCentavos < 0) {
      setAbrirCaixa({ ...abrirCaixa, error: "Informe um valor inicial válido." });
      return;
    }

    setAbrirCaixa({ ...abrirCaixa, loading: true, error: null });
    try {
      await api.post("/caixas/abrir", { valorInicialCentavos });
      setAbrirCaixa({ open: false });
      await load();
    } catch (e: any) {
      setAbrirCaixa({
        ...abrirCaixa,
        loading: false,
        error: e?.response?.data?.message || "Não foi possível abrir o caixa.",
      });
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Barra de navegação fixa (logo + hamburger) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img src={logo} alt="CentralSys" className="h-9 w-auto" />

          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden text-gray-600"
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar / Drawer */}
        <aside
          className={classNames(
            "fixed inset-y-0 left-0 z-40 w-64 bg-[#1A2B3C] text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-6 lg:hidden flex justify-between items-center border-b border-gray-700">
            <span className="font-bold">Menu Principal</span>
            <button onClick={() => setIsMenuOpen(false)} aria-label="Fechar menu">
              <X size={24} />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.title}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium hover:bg-white/10"
              >
                <span className="text-white/90">{item.icon}</span>
                <span>{item.title}</span>
              </button>
            ))}

            <div className="pt-10 space-y-2">
              <p className="px-4 text-[10px] font-bold text-gray-400 uppercase">Gestão de Caixa</p>

              {caixaStatus === "ABERTO" ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    void handleChipCaixaClick();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-orange-200 hover:bg-orange-500/10"
                >
                  <Lock size={20} /> Fechar Expediente
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    void handleChipCaixaClick();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-green-200 hover:bg-green-500/10"
                >
                  <Unlock size={20} /> Abrir Caixa
                </button>
              )}
            </div>

            <div className="pt-10 space-y-2">
              <p className="px-4 text-[10px] font-bold text-gray-400 uppercase">Sessão</p>
              <button
                onClick={() => void handleLogout()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-200 hover:bg-red-500/10"
              >
                <LogOut size={20} /> Sair
              </button>
            </div>
          </nav>
        </aside>

        {isMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMenuOpen(false)} />
        )}

        {/* Conteúdo */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Área de título (abaixo da barra de navegação, acima dos cards) */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl lg:text-2xl font-black text-[#1A2B3C] truncate">{empresaNome}</h1>
              <p className="text-xs text-gray-500 mt-1">{now.toLocaleString("pt-BR")}</p>
            </div>

            <button
              onClick={() => void handleChipCaixaClick()}
              className={classNames(
                "shrink-0 px-3 py-2 rounded-full text-xs font-bold border flex items-center gap-2",
                caixaStatus === "ABERTO"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              )}
              title={caixaStatus === "ABERTO" ? "Fechar caixa" : "Abrir caixa"}
            >
              {caixaStatus === "ABERTO" ? <Unlock size={14} /> : <Lock size={14} />}
              {caixaStatus === "ABERTO" ? "Caixa aberto" : "Caixa fechado"}
            </button>
          </div>

          {loading && (
            <div className="bg-white border rounded-2xl p-4 flex items-center gap-3 text-sm text-gray-600">
              <Loader2 className="animate-spin" size={18} />
              Carregando dashboard...
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5" />
              <div className="flex-1">{error}</div>
              <button onClick={() => void load()} className="text-red-700 underline font-medium">
                Tentar de novo
              </button>
            </div>
          )}

          {!loading && !error && data && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <section className="bg-white border rounded-2xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">Lucro de hoje</div>
                <div className="mt-2 text-3xl font-black text-[#1A2B3C]">{lucroHoje}</div>
                <div className="mt-3 flex justify-between text-xs text-gray-600">
                  <span>Entradas: {entradasHoje}</span>
                  <span>Saídas: {saidasHoje}</span>
                </div>
              </section>

              <section className="bg-white border rounded-2xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">Total em caixa</div>
                <div className="mt-2 text-3xl font-black text-[#1A2B3C]">{totalEmCaixa}</div>
                {data.caixa.status === "ABERTO" ? (
                  <div className="mt-3 text-xs text-gray-600">Valor inicial: {valorInicialCaixa}</div>
                ) : (
                  <div className="mt-3 text-xs text-gray-600">Caixa fechado</div>
                )}
              </section>

              <section className="bg-white border rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-gray-500">Produtos</div>
                  <button onClick={() => navigate("/produtos")} className="text-xs font-semibold text-[#1A2B3C] underline">
                    Ver estoque
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <span className="text-gray-700">Em falta</span>
                    <span className="font-bold text-[#1A2B3C]">{data.produtos.emFalta}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <span className="text-gray-700">Estoque baixo</span>
                    <span className="font-bold text-[#1A2B3C]">{data.produtos.estoqueBaixo}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <span className="text-gray-700">Parados</span>
                    <span className="font-bold text-[#1A2B3C]">{data.produtos.parados}</span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>

        {abrirCaixa.open && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-5 border-b">
                <div className="text-lg font-black text-[#1A2B3C]">Abrir caixa</div>
                <div className="text-xs text-gray-500 mt-1">Informe o valor inicial.</div>
              </div>

              <div className="p-5 space-y-3">
                <label className="block text-xs font-semibold text-gray-600">Valor inicial</label>
                <input
                  value={abrirCaixa.valorInput}
                  onChange={(e) =>
                    setAbrirCaixa({ ...abrirCaixa, valorInput: maskCurrencyInputBR(e.target.value), error: null })
                  }
                  placeholder="R$ 0,00"
                  className="w-full border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1A2B3C]/20"
                />

                {abrirCaixa.error && <div className="text-xs text-red-600">{abrirCaixa.error}</div>}

                <button
                  onClick={() => void submitAbrirCaixa()}
                  disabled={abrirCaixa.loading}
                  className="w-full bg-[#1A2B3C] text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {abrirCaixa.loading && <Loader2 className="animate-spin" size={16} />}
                  Abrir caixa
                </button>

                <button
                  onClick={() => setAbrirCaixa({ open: false })}
                  disabled={abrirCaixa.loading}
                  className="w-full border py-4 rounded-2xl font-bold text-sm text-[#1A2B3C] disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {fecharCaixaOpen && caixaIdToFechar && (
          <div className="fixed inset-0 z-50">
            <ModalFecharCaixa
              caixaId={caixaIdToFechar}
              onClose={() => setFecharCaixaOpen(false)}
              onSucesso={() => void load()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
