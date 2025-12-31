import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { api } from "../services/api";

/* =========================
   Utils – mesma lógica padrão BR
========================= */
function formatarMoedaBR(valor: string) {
    const apenasNumeros = valor.replace(/\D/g, "");
    const numero = Number(apenasNumeros) / 100;

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function moedaParaNumero(valor: string) {
    return Number(
        valor
            .replace(/\./g, "")
            .replace(",", ".")
            .replace(/[^\d.-]/g, "")
    );
}

/* =========================
   Component
========================= */

interface Props {
    onClose: () => void;
    onSucesso: () => void;
}

export function ModalNovaDespesa({ onClose, onSucesso }: Props) {
    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState(""); // string mascarada
    const [formaPagamento, setFormaPagamento] = useState("DINHEIRO");
    const [saiDoCaixa, setSaiDoCaixa] = useState(true);
    const [dataDespesa, setDataDespesa] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (formaPagamento !== "DINHEIRO") {
            setSaiDoCaixa(false);
        }
    }, [formaPagamento]);

    async function salvar() {
        const valorNumerico = moedaParaNumero(valor);

        if (!descricao || valorNumerico <= 0) {
            alert("Preencha descrição e valor corretamente");
            return;
        }

        try {
            setLoading(true);

            await api.post("/despesas", {
                descricao,
                valor: valorNumerico,
                formaPagamento,
                saiDoCaixa,
                dataDespesa,
            });

            onSucesso();
            onClose();
        } catch (error) {
            alert("Erro ao criar despesa");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-[#1A2B3C]">
                        Nova Despesa
                    </h2>
                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Descrição */}
                    <div>
                        <label className="text-xs font-bold text-gray-500">
                            Descrição
                        </label>
                        <input
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            className="w-full mt-1 p-3 rounded-xl border"
                            placeholder="Ex: Conta de luz"
                        />
                    </div>

                    {/* Valor com máscara BR */}
                    <div>
                        <label className="text-xs font-bold text-gray-500">
                            Valor
                        </label>
                        <input
                            value={valor}
                            onChange={(e) =>
                                setValor(formatarMoedaBR(e.target.value))
                            }
                            className="w-full mt-1 p-3 rounded-xl border"
                            placeholder="R$ 0,00"
                            inputMode="numeric"
                        />
                    </div>

                    {/* Forma de pagamento */}
                    <div>
                        <label className="text-xs font-bold text-gray-500">
                            Forma de Pagamento
                        </label>
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

                    {/* Sai do caixa */}
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={saiDoCaixa}
                                disabled={formaPagamento !== "DINHEIRO"}
                                onChange={(e) => setSaiDoCaixa(e.target.checked)}
                                className="accent-orange-600 disabled:opacity-50"
                            />
                            Sai do caixa
                        </label>
                    </div>

                    {/* Data */}
                    <div>
                        <label className="text-xs font-bold text-gray-500">
                            Data
                        </label>
                        <input
                            type="date"
                            value={dataDespesa}
                            onChange={(e) => setDataDespesa(e.target.value)}
                            className="w-full mt-1 p-3 rounded-xl border"
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border text-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={salvar}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                        {loading ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
