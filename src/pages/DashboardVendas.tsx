import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  ShoppingBag,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronRight,
} from "lucide-react";

import { api } from "../services/api";
import { formatCurrencyBR } from "../utils/formatCurrencyBR";

type FiltroLancamentos = "TUDO" | "VENDAS" | "DESPESAS";

interface Venda {
  id: string;
  status: "EM_PROGRESSO" | "FINALIZADA" | "CANCELADA";
  valorTotalCentavos: number;
  metodoPagamento: string;
  criadoEm: string;
  usuario?: { nome: string };
  _count?: { itens: number };
}

interface Despesa {
  id: string;
  descricao: string;
  valorCentavos: number;
  formaPagamento: string;
  status: "QUITADA" | "PARCELADA" | "RECORRENTE" | "CANCELADA";
  dataDespesa: string;
}

type Lancamento = {
  id: string;
  tipo: "VENDA" | "DESPESA";
  data: Date;
  valorCentavos: number;
  titulo: string;
  subtitulo: string;
  statusLabel?: string;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function fetchVendasPeriodo(inicio: Date, fim: Date) {
  const limit = 100;
  const maxPages = 20;

  const vendas: Venda[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const res = await api.get("/vendas", { params: { page, limit } });
    const chunk = (res.data?.data ?? []) as Venda[];

    if (!Array.isArray(chunk) || chunk.length === 0) break;

    vendas.push(...chunk);

    const last = chunk[chunk.length - 1];
    const lastDate = last?.criadoEm ? new Date(last.criadoEm) : null;

    if (chunk.length < limit) break;
    if (lastDate && lastDate < inicio) break;
  }

  return vendas.filter((v) => {
    if (v.status !== "FINALIZADA") return false;
    const dt = new Date(v.criadoEm);
    return dt >= inicio && dt <= fim;
  });
}

async function fetchDespesasPeriodo(inicio: Date, fim: Date) {
  const limit = 100;
  const res = await api.get("/despesas", {
    params: {
      page: 1,
      limit,
      dataInicio: inicio.toISOString(),
      dataFim: fim.toISOString(),
    },
  });

  const despesas = (res.data?.data ?? []) as Despesa[];
  if (!Array.isArray(despesas)) return [];

  return despesas.filter((d) => d.status !== "CANCELADA");
}

export default function DashboardVendas() {
  const navigate = useNavigate();

  const [filtro, setFiltro] = useState<FiltroLancamentos>("TUDO");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);

  const inicioPeriodo = useMemo(() => startOfDay(daysAgo(30)), []);
  const fimPeriodo = useMemo(() => endOfDay(new Date()), []);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setErro(null);

      try {
        const [v, d] = await Promise.all([
          fetchVendasPeriodo(inicioPeriodo, fimPeriodo),
          fetchDespesasPeriodo(inicioPeriodo, fimPeriodo),
        ]);

        setVendas(v);
        setDespesas(d);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar o histórico.");
      } finally {
        setLoading(false);
      }
    }

    void carregar();
  }, [inicioPeriodo, fimPeriodo]);

  const lancamentos: Lancamento[] = useMemo(() => {
    const vendasLanc: Lancamento[] = vendas.map((v) => ({
      id: v.id,
      tipo: "VENDA",
      data: new Date(v.criadoEm),
      valorCentavos: v.valorTotalCentavos,
      titulo: "Venda",
      subtitulo: `${v._count?.itens ?? 0} itens • ${v.usuario?.nome ?? "—"}`,
      statusLabel: v.metodoPagamento,
    }));

    const despesasLanc: Lancamento[] = despesas.map((d) => ({
      id: d.id,
      tipo: "DESPESA",
      data: new Date(d.dataDespesa),
      valorCentavos: d.valorCentavos,
      titulo: d.descricao,
      subtitulo: `Despesa • ${d.formaPagamento}`,
      statusLabel: d.status,
    }));

    const all = [...vendasLanc, ...despesasLanc].sort((a, b) => b.data.getTime() - a.data.getTime());

    if (filtro === "VENDAS") return all.filter((x) => x.tipo === "VENDA");
    if (filtro === "DESPESAS") return all.filter((x) => x.tipo === "DESPESA");
    return all;
  }, [vendas, despesas, filtro]);

  const totalVendas = useMemo(
    () => vendas.reduce((acc, v) => acc + Number(v.valorTotalCentavos || 0), 0),
    [vendas]
  );

  const totalDespesas = useMemo(
    () => despesas.reduce((acc, d) => acc + Number(d.valorCentavos || 0), 0),
    [despesas]
  );

  const cardPrincipal = useMemo(() => {
    if (filtro === "VENDAS") return { titulo: "Total de Vendas", valorCentavos: totalVendas };
    if (filtro === "DESPESAS") return { titulo: "Total de Despesas", valorCentavos: totalDespesas };
    return { titulo: "Saldo", valorCentavos: totalVendas - totalDespesas };
  }, [filtro, totalVendas, totalDespesas]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>

          <h1 className="text-xl font-black text-gray-800">Histórico</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <section className="bg-white border rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">{cardPrincipal.titulo}</p>
          <h2 className="text-3xl font-black mt-1">{formatCurrencyBR(cardPrincipal.valorCentavos)}</h2>
          <p className="text-xs text-gray-500 mt-2">Últimos 30 dias</p>
        </section>

        <div className="flex items-center justify-between mt-6 mb-2">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <ShoppingBag size={18} /> Últimos Lançamentos
          </h3>

          <select
            className="border rounded-xl px-3 py-2 text-sm bg-white"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as FiltroLancamentos)}
            aria-label="Filtrar lançamentos"
          >
            <option value="TUDO">Tudo</option>
            <option value="VENDAS">Vendas</option>
            <option value="DESPESAS">Despesas</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[#2D6A4F]" size={32} />
          </div>
        ) : erro ? (
          <div className="text-center py-20 text-gray-500">
            <p>{erro}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lancamentos.map((l) => (
              <div
                key={`${l.tipo}-${l.id}`}
                className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">{l.titulo}</p>
                      <p className="text-xs text-gray-500 truncate">{l.subtitulo}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500">
                        {l.data.toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 min-w-0">
                      {l.tipo === "VENDA" ? (
                        <ArrowUpCircle size={16} className="text-[#2D6A4F]" />
                      ) : (
                        <ArrowDownCircle size={16} className="text-[#ff3131]" />
                      )}
                      <span className="truncate">{l.statusLabel ?? ""}</span>
                    </div>

                    <p className="font-black text-gray-900">
                      {formatCurrencyBR(l.valorCentavos)}
                    </p>
                  </div>
                </div>

                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </div>
            ))}

            {lancamentos.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p>Nenhum lançamento encontrado.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
