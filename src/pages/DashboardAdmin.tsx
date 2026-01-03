import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ShoppingCart, Wallet, Loader2, AlertCircle, Lock, Unlock } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { fetchDashboardAdminOverview, type DashboardAdminOverview } from "../services/dashboard";
import { formatCurrencyBR } from "../utils/formatCurrencyBR";
import { api } from "../services/api";
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
  const { usuario, empresa } = useAuth();

  const [now, setNow] = useState(() => new Date());

  const [data, setData] = useState<DashboardAdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fecharCaixaOpen, setFecharCaixaOpen] = useState(false);
  const [caixaIdToFechar, setCaixaIdToFechar] = useState<string | null>(null);

  const [abrirCaixa, setAbrirCaixa] = useState<OpenCaixaState>({ open: false });

  const caixaStatus = data?.caixa.status ?? "FECHADO";

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const overview = await fetchDashboardAdminOverview();
      setData(overview);
    } catch {
      setError("Não foi possível carregar o dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!usuario) return;
    if (usuario.papel !== "ADMIN") navigate("/pdv", { replace: true });
  }, [usuario, navigate]);

  const empresaNome = empresa?.nome ?? "—";

  const lucroHoje = useMemo(() => formatCurrencyBR(data?.hoje.lucroCentavos), [data?.hoje.lucroCentavos]);
  const entradasHoje = useMemo(() => formatCurrencyBR(data?.hoje.entradasCentavos), [data?.hoje.entradasCentavos]);
  const saidasHoje = useMemo(() => formatCurrencyBR(data?.hoje.despesasCentavos), [data?.hoje.despesasCentavos]);

  const totalEmCaixa = useMemo(() => {
    if (data?.caixa.status !== "ABERTO") return formatCurrencyBR(0);
    return formatCurrencyBR(data.caixa.valorAtualCentavos);
  }, [data]);

  const valorInicialCaixa = useMemo(() => formatCurrencyBR(data?.caixa.valorInicialCentavos), [data?.caixa.valorInicialCentavos]);

  async function handleChipCaixaClick() {
    if (loading || !data) return;

    if (data.caixa.status === "FECHADO") {
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
    } catch {
      setAbrirCaixa({ ...abrirCaixa, loading: false, error: "Não foi possível abrir o caixa." });
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 bg-white border-b shadow-sm z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-gray-500">CentralSys</div>
            <div className="text-sm font-semibold text-[#1A2B3C] truncate">{empresaNome}</div>
            <div className="text-xs text-gray-500">{now.toLocaleString("pt-BR")}</div>
          </div>

          <button
            onClick={handleChipCaixaClick}
            className={classNames(
              "shrink-0 px-3 py-2 rounded-full text-xs font-semibold border flex items-center gap-2",
              caixaStatus === "ABERTO" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"
            )}
            title={caixaStatus === "ABERTO" ? "Fechar caixa" : "Abrir caixa"}
          >
            {caixaStatus === "ABERTO" ? <Unlock size={14} /> : <Lock size={14} />}
            {caixaStatus === "ABERTO" ? "Caixa aberto" : "Caixa fechado"}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="pt-[84px] pb-[92px] px-4">
        <div className="max-w-md mx-auto space-y-4">
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
            <>
              {/* Lucro */}
              <section className="bg-white border rounded-2xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">Lucro de hoje</div>
                <div className="mt-2 text-3xl font-black text-[#1A2B3C]">{lucroHoje}</div>
                <div className="mt-3 flex justify-between text-xs text-gray-600">
                  <span>Entradas: {entradasHoje}</span>
                  <span>Saídas: {saidasHoje}</span>
                </div>
              </section>

              {/* Caixa */}
              <section className="bg-white border rounded-2xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">Total em caixa</div>
                <div className="mt-2 text-3xl font-black text-[#1A2B3C]">{totalEmCaixa}</div>
                {data.caixa.status === "ABERTO" ? (
                  <div className="mt-3 text-xs text-gray-600">Valor inicial: {valorInicialCaixa}</div>
                ) : (
                  <div className="mt-3 text-xs text-gray-600">
                    Caixa fechado. Toque em <span className="font-semibold">“Caixa fechado”</span> no topo para abrir.
                  </div>
                )}
              </section>

              {/* Produtos */}
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
            </>
          )}
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t z-20">
        <div className="max-w-md mx-auto px-4 py-3 grid grid-cols-3 gap-2">
          <button
            onClick={() => navigate("/produtos")}
            className="rounded-2xl border bg-gray-50 py-3 flex flex-col items-center justify-center gap-1 text-xs font-semibold text-[#1A2B3C]"
          >
            <Package size={18} />
            Estoque
          </button>
          <button
            onClick={() => navigate("/pdv")}
            className="rounded-2xl border bg-gray-50 py-3 flex flex-col items-center justify-center gap-1 text-xs font-semibold text-[#1A2B3C]"
          >
            <ShoppingCart size={18} />
            PDV
          </button>
          <button
            onClick={() => navigate("/caixa")}
            className="rounded-2xl border bg-gray-50 py-3 flex flex-col items-center justify-center gap-1 text-xs font-semibold text-[#1A2B3C]"
          >
            <Wallet size={18} />
            Caixa
          </button>
        </div>
      </nav>

      {/* Modal abrir caixa */}
      {abrirCaixa.open && (
        <div className="fixed inset-0 z-30 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b">
              <div className="text-lg font-black text-[#1A2B3C]">Abrir caixa</div>
              <div className="text-xs text-gray-500 mt-1">Informe o valor inicial em dinheiro (centavos).</div>
            </div>

            <div className="p-5 space-y-3">
              <label className="block text-xs font-semibold text-gray-600">Valor inicial</label>
              <input
                value={abrirCaixa.valorInput}
                onChange={(e) => setAbrirCaixa({ ...abrirCaixa, valorInput: maskCurrencyInputBR(e.target.value), error: null })}
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

      {/* Modal fechar caixa */}
      {fecharCaixaOpen && caixaIdToFechar && (
        <div className="fixed inset-0 z-30">
          <ModalFecharCaixa
            caixaId={caixaIdToFechar}
            onClose={() => setFecharCaixaOpen(false)}
            onSucesso={() => void load()}
          />
        </div>
      )}
    </div>
  );
}
