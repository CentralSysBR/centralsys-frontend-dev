import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {

  ArrowLeft,
  Calendar,
  CheckSquare,
  History,
  LayoutDashboard,
  Loader2,
  Menu,
  MessageSquare,
  Package,
  ShoppingCart,
  Calculator,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  X,
} from "lucide-react";

import { sideMenuItems } from "../components/layout";

import { SideMenuList } from "../components/layout";

import logo from "../assets/logo_full_color.svg";
import { api } from "../services/api";
import { formatCurrencyBR } from "../utils/formatCurrencyBR";
import { useAuth } from "../contexts/AuthContext";

type Filtro = "TUDO" | "VENDAS" | "DESPESAS";

interface Venda {
  id: string;
  valorTotalCentavos: number;
  metodoPagamento: string;
  criadoEm: string;
  status?: string;
  usuario?: { nome: string };
  _count?: { itens: number };
}

interface Despesa {
  id: string;
  descricao: string;
  valorCentavos: number;
  formaPagamento: string;
  status: string;
  dataDespesa: string;
}

type Lancamento =
  | { tipo: "VENDA"; id: string; data: string; valorCentavos: number; metodo: string; titulo: string }
  | { tipo: "DESPESA"; id: string; data: string; valorCentavos: number; metodo: string; titulo: string };

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function DashboardVendas() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("TUDO");

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);

  const menuItems = sideMenuItems;

useEffect(() => {
    async function carregar() {
      setLoading(true);
      try {
        const [vRes, dRes] = await Promise.all([api.get("/vendas"), api.get("/despesas")]);
        const v = (vRes.data?.data ?? []) as Venda[];
        const d = (dRes.data?.data ?? []) as Despesa[];

        // Excluir canceladas aqui: vendas somente FINALIZADA; despesas != CANCELADA
        const vOk = v.filter((x) => (x.status ? x.status === "FINALIZADA" : true));
        const dOk = d.filter((x) => x.status !== "CANCELADA");

        // Últimos 30 dias (client-side)
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const v30 = vOk.filter((x) => new Date(x.criadoEm) >= since);
        const d30 = dOk.filter((x) => new Date(x.dataDespesa) >= since);

        setVendas(v30);
        setDespesas(d30);
      } catch (e) {
        console.error("Erro ao carregar histórico:", e);
        setVendas([]);
        setDespesas([]);
      } finally {
        setLoading(false);
      }
    }
    void carregar();
  }, []);

  const totalVendasCentavos = useMemo(
    () => vendas.reduce((acc, v) => acc + (Number.isFinite(v.valorTotalCentavos) ? Number(v.valorTotalCentavos) : 0), 0),
    [vendas]
  );
  const totalDespesasCentavos = useMemo(
    () => despesas.reduce((acc, d) => acc + (Number.isFinite(d.valorCentavos) ? Number(d.valorCentavos) : 0), 0),
    [despesas]
  );

  const saldoCentavos = totalVendasCentavos - totalDespesasCentavos;

  const lancamentos: Lancamento[] = useMemo(() => {
    const list: Lancamento[] = [];
    for (const v of vendas) {
      list.push({
        tipo: "VENDA",
        id: v.id,
        data: v.criadoEm,
        valorCentavos: Number(v.valorTotalCentavos) || 0,
        metodo: v.metodoPagamento ?? "-",
        titulo: `Venda${v._count?.itens != null ? ` • ${v._count.itens} itens` : ""}`,
      });
    }
    for (const d of despesas) {
      list.push({
        tipo: "DESPESA",
        id: d.id,
        data: d.dataDespesa,
        valorCentavos: Number(d.valorCentavos) || 0,
        metodo: d.formaPagamento ?? "-",
        titulo: d.descricao,
      });
    }
    return list.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [vendas, despesas]);

  const lancamentosFiltrados = useMemo(() => {
    if (filtro === "VENDAS") return lancamentos.filter((l) => l.tipo === "VENDA");
    if (filtro === "DESPESAS") return lancamentos.filter((l) => l.tipo === "DESPESA");
    return lancamentos;
  }, [lancamentos, filtro]);

  const cardTitulo = filtro === "TUDO" ? "Saldo" : filtro === "VENDAS" ? "Total de Vendas" : "Total de Despesas";
  const cardValorCentavos = filtro === "TUDO" ? saldoCentavos : filtro === "VENDAS" ? totalVendasCentavos : totalDespesasCentavos;

  const cardColor =
    filtro === "TUDO" ? (cardValorCentavos < 0 ? "#ff3131" : "#2D6A4F") : "#1A2B3C";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav (logo + hamburger) */}
      <header className="fixed top-0 inset-x-0 bg-white border-b shadow-sm z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
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

      {/* Sidebar */}
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
                  <span className="text-white/90">{item.icon}</span>
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

      <main className="pt-[64px] pb-16 px-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-xl bg-white border hover:bg-gray-50 active:scale-95 transition"
              aria-label="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-black text-[#1A2B3C]">Histórico</h1>
          </div>

          <section className="bg-white border rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">{cardTitulo}</div>
            <div className="mt-2 text-3xl font-black" style={{ color: cardColor }}>
              {formatCurrencyBR(cardValorCentavos)}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-gray-500 font-semibold">Últimos Lançamentos</div>

              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value as Filtro)}
                className="text-xs font-bold border rounded-xl px-3 py-2 bg-white"
                aria-label="Filtro"
              >
                <option value="TUDO">Tudo</option>
                <option value="VENDAS">Vendas</option>
                <option value="DESPESAS">Despesas</option>
              </select>
            </div>
          </section>

          {loading ? (
            <div className="bg-white border rounded-2xl p-4 flex items-center gap-3 text-sm text-gray-600">
              <Loader2 className="animate-spin" size={18} />
              Carregando...
            </div>
          ) : (
            <div className="space-y-2">
              {lancamentosFiltrados.length === 0 ? (
                <div className="bg-white border rounded-2xl p-4 text-sm text-gray-600">
                  Nenhum lançamento encontrado no período.
                </div>
              ) : (
                lancamentosFiltrados.map((l) => {
                  const isVenda = l.tipo === "VENDA";
                  return (
                    <div
                      key={`${l.tipo}-${l.id}`}
                      className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className="text-[10px] font-black px-2 py-1 rounded-full"
                            style={{ background: isVenda ? "#2D6A4F22" : "#ff313122", color: isVenda ? "#2D6A4F" : "#ff3131" }}
                          >
                            {isVenda ? "Entrada" : "Saída"}
                          </div>
                          <div className="text-sm font-bold text-[#1A2B3C] truncate">{l.titulo}</div>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                          <Calendar size={14} />
                          <span>{new Date(l.data).toLocaleString("pt-BR")}</span>
                        </div>

                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-semibold">Forma:</span> {l.metodo}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-black" style={{ color: isVenda ? "#2D6A4F" : "#ff3131" }}>
                          {isVenda ? formatCurrencyBR(l.valorCentavos) : `-${formatCurrencyBR(l.valorCentavos)}`}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}