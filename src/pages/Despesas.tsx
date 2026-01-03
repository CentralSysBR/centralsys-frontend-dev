import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { api } from "../services/api";
import { ModalNovaDespesa } from "../components/ModalNovaDespesa";
import { formatCurrencyBR } from "../utils/formatCurrencyBR";

interface Despesa {
  id: string;
  descricao: string;
  valorCentavos: number;
  formaPagamento: string;
  status: string;
  dataDespesa: string;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data: any = error.response?.data;
    return data?.message || data?.error || fallback;
  }
  return fallback;
}

export default function Despesas() {
  const navigate = useNavigate();

  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [mostrarCanceladas, setMostrarCanceladas] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const despesasVisiveis = useMemo(() => {
    if (mostrarCanceladas) return despesas;
    return despesas.filter((x) => x.status !== "CANCELADA");
  }, [despesas, mostrarCanceladas]);

  async function carregarDespesas() {
    try {
      setErro(null);
      setLoading(true);
      const res = await api.get("/despesas");
      setDespesas(res.data.data);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Erro ao carregar despesas."));
    } finally {
      setLoading(false);
    }
  }

  async function cancelarDespesa(id: string) {
    const confirmar = window.confirm("Deseja cancelar esta despesa?");
    if (!confirmar) return;

    try {
      setErro(null);
      await api.patch(`/despesas/${id}/cancelar`);
      await carregarDespesas();
    } catch (error) {
      setErro(getApiErrorMessage(error, "Erro ao cancelar despesa."));
      window.alert(getApiErrorMessage(error, "Erro ao cancelar despesa."));
    }
  }

  useEffect(() => {
    void carregarDespesas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft size={22} className="text-gray-700" />
            </button>

            <h1 className="text-xl font-black text-[#1A2B3C] truncate">Despesas</h1>
          </div>

          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold text-sm"
          >
            <Plus size={18} /> Nova Despesa
          </button>
        </div>

        <div className="max-w-md mx-auto mt-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
            <input
              type="checkbox"
              checked={mostrarCanceladas}
              onChange={(e) => setMostrarCanceladas(e.target.checked)}
            />
            Mostrar canceladas
          </label>
        </div>
      </header>

      <main className="p-4 pb-24">
        <div className="max-w-md mx-auto space-y-3">
          {erro && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl p-3">
              {erro}
            </div>
          )}

          {loading && (
            <div className="bg-white border rounded-2xl p-4 text-sm text-gray-600">
              Carregando despesas...
            </div>
          )}

          {!loading && despesasVisiveis.length === 0 && (
            <div className="bg-white border rounded-2xl p-4 text-sm text-gray-600">
              Nenhuma despesa encontrada.
            </div>
          )}

          {!loading &&
            despesasVisiveis.map((despesa) => {
              const cancelada = despesa.status === "CANCELADA";
              const data = new Date(despesa.dataDespesa).toLocaleDateString("pt-BR");

              return (
                <button
                  key={despesa.id}
                  type="button"
                  onClick={() => {
                    if (!cancelada) void cancelarDespesa(despesa.id);
                  }}
                  className={[
                    "w-full text-left bg-white border rounded-2xl p-4 shadow-sm",
                    "active:scale-[0.99] transition",
                    cancelada ? "opacity-70" : "hover:bg-gray-50",
                  ].join(" ")}
                >
                  {/* Linha 1 */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold text-[#1A2B3C] truncate">
                      {despesa.descricao}
                    </div>
                    <div className="text-xs text-gray-500 shrink-0">{data}</div>
                  </div>

                  {/* Linha 2 */}
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                    <div className="font-black text-red-600 shrink-0">
                      {formatCurrencyBR(despesa.valorCentavos)}
                    </div>

                    <div className="text-gray-700 truncate text-center flex-1">
                      {despesa.formaPagamento}
                    </div>

                    <div className="shrink-0">
                      <span
                        className={[
                          "px-2 py-1 rounded-full text-xs font-bold",
                          cancelada
                            ? "bg-gray-200 text-gray-600"
                            : "bg-green-100 text-green-700",
                        ].join(" ")}
                      >
                        {despesa.status}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>

        {modalAberto && (
          <ModalNovaDespesa
            onClose={() => setModalAberto(false)}
            onSucesso={carregarDespesas}
          />
        )}
      </main>
    </div>
  );
}
