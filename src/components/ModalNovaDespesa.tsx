import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { api } from "../services/api";

/* =========================
   Utils – padrão BR (input em centavos)
========================= */
function formatarMoedaBR(valor: string) {
  const apenasNumeros = valor.replace(/\D/g, "");
  const numero = Number(apenasNumeros) / 100;

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function moedaParaCentavos(valor: string) {
  // Mantém contrato do backend: dinheiro sempre em centavos (Int).
  const apenasNumeros = valor.replace(/\D/g, "");
  return apenasNumeros ? Number(apenasNumeros) : 0;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data: any = error.response?.data;
    return data?.message || data?.error || data?.details?.message || fallback;
  }
  return fallback;
}

/* =========================
   Component
========================= */

interface Props {
  onClose: () => void;
  onSucesso: () => void;
}

type CaixaAbertoResponse = null | {
  id: string;
  status: "ABERTO" | "FECHADO";
  valorAtualCentavos: number;
  valorInicialCentavos: number;
};

export function ModalNovaDespesa({ onClose, onSucesso }: Props) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("DINHEIRO");
  const [saiDoCaixa, setSaiDoCaixa] = useState(false);
  const [dataDespesa, setDataDespesa] = useState(() => new Date().toISOString().slice(0, 10));

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [valorEmCaixaCentavos, setValorEmCaixaCentavos] = useState<number | null>(null);

  const valorCentavos = useMemo(() => moedaParaCentavos(valor), [valor]);

  const podeSaiDoCaixa = useMemo(() => {
    if (formaPagamento !== "DINHEIRO") return false;
    if (valorEmCaixaCentavos == null) return false;
    if (valorCentavos <= 0) return false;
    return valorCentavos <= valorEmCaixaCentavos;
  }, [formaPagamento, valorCentavos, valorEmCaixaCentavos]);

  useEffect(() => {
    async function carregarCaixaAberto() {
      try {
        const res = await api.get("/caixas/aberto");
        const caixa = (res.data?.data ?? null) as CaixaAbertoResponse;
        if (!caixa || caixa.status !== "ABERTO") {
          setValorEmCaixaCentavos(null);
          return;
        }
        setValorEmCaixaCentavos(caixa.valorAtualCentavos);
      } catch {
        setValorEmCaixaCentavos(null);
      }
    }

    void carregarCaixaAberto();
  }, []);

  useEffect(() => {
    // Mantém regra atual: só DINHEIRO pode sair do caixa
    if (formaPagamento !== "DINHEIRO") setSaiDoCaixa(false);
  }, [formaPagamento]);

  useEffect(() => {
    // Regra nova: caixa não pode ficar negativo
    if (!podeSaiDoCaixa) setSaiDoCaixa(false);
  }, [podeSaiDoCaixa]);

  async function salvar() {
    setErro(null);

    if (!descricao || valorCentavos <= 0) {
      setErro("Preencha descrição e valor corretamente.");
      return;
    }

    if (saiDoCaixa && !podeSaiDoCaixa) {
      setErro("Valor maior que o disponível em caixa. Desmarque “Sai do caixa” ou reduza o valor.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/despesas", {
        descricao,
        valorCentavos,
        formaPagamento,
        saiDoCaixa,
        dataDespesa,
      });

      onSucesso();
      onClose();
    } catch (error) {
      setErro(getApiErrorMessage(error, "Erro ao criar despesa."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-[#1A2B3C]">Nova Despesa</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Descrição */}
          <div>
            <label className="text-xs font-bold text-gray-500">Descrição</label>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border"
              placeholder="Ex: Conta de luz"
            />
          </div>

          {/* Valor */}
          <div>
            <label className="text-xs font-bold text-gray-500">Valor</label>
            <input
              value={valor}
              onChange={(e) => setValor(formatarMoedaBR(e.target.value))}
              className="w-full mt-1 p-3 rounded-xl border"
              placeholder="R$ 0,00"
              inputMode="numeric"
            />
          </div>

          {/* Forma de pagamento */}
          <div>
            <label className="text-xs font-bold text-gray-500">Forma de Pagamento</label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border"
            >
              <option value="DINHEIRO">Dinheiro</option>
              <option value="PIX">PIX</option>
              <option value="DEBITO">Débito</option>
              <option value="CREDITO">Crédito</option>
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="text-xs font-bold text-gray-500">Data</label>
            <input
              type="date"
              value={dataDespesa}
              onChange={(e) => setDataDespesa(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border"
            />
          </div>

          {/* Sai do caixa */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm select-none">
              <input
                type="checkbox"
                checked={saiDoCaixa}
                disabled={!podeSaiDoCaixa}
                onChange={(e) => setSaiDoCaixa(e.target.checked)}
                className="accent-orange-600 disabled:opacity-50"
              />
              Sai do caixa
            </label>

            {formaPagamento === "DINHEIRO" && valorEmCaixaCentavos != null && valorCentavos > 0 && valorCentavos > valorEmCaixaCentavos && (
              <p className="text-xs text-orange-700">
                Valor maior que o disponível em caixa.
              </p>
            )}

            {formaPagamento === "DINHEIRO" && valorEmCaixaCentavos == null && (
              <p className="text-xs text-gray-500">
                Caixa fechado. “Sai do caixa” fica indisponível.
              </p>
            )}
          </div>

          {erro && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              {erro}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full p-3 rounded-xl border font-bold text-sm disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              onClick={() => void salvar()}
              disabled={loading}
              className="w-full p-3 rounded-xl bg-[#1A2B3C] text-white font-bold text-sm disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
