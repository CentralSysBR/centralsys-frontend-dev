import { useEffect, useState } from "react";
import { Plus, XCircle } from "lucide-react";
import { api } from "../services/api";
import { ModalNovaDespesa } from "../components/ModalNovaDespesa";

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  status: string;
  dataDespesa: string;
}

export default function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  async function carregarDespesas() {
    try {
      setLoading(true);
      const res = await api.get("/despesas");
      setDespesas(res.data.data);
    } catch (error) {
      console.error("Erro ao carregar despesas", error);
    } finally {
      setLoading(false);
    }
  }

  async function cancelarDespesa(id: string) {
    const confirmar = confirm("Deseja realmente cancelar esta despesa?");
    if (!confirmar) return;

    try {
      await api.patch(`/despesas/${id}/cancelar`);
      carregarDespesas();
    } catch (error) {
      alert("Erro ao cancelar despesa");
    }
  }

  useEffect(() => {
    carregarDespesas();
  }, []);

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[#1A2B3C]">
          Despesas
        </h1>

        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold text-sm"
        >
          <Plus size={18} /> Nova Despesa
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Descrição</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Forma</th>
              <th className="p-4">Status</th>
              <th className="p-4">Data</th>
              <th className="p-4"></th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Carregando despesas...
                </td>
              </tr>
            )}

            {!loading && despesas.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Nenhuma despesa registrada
                </td>
              </tr>
            )}

            {despesas.map((despesa) => (
              <tr key={despesa.id} className="border-t">
                <td className="p-4 font-medium">{despesa.descricao}</td>
                <td className="p-4 text-center font-bold text-red-600">
                  R$ {despesa.valor.toFixed(2)}
                </td>
                <td className="p-4 text-center">
                  {despesa.formaPagamento}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      despesa.status === "CANCELADA"
                        ? "bg-gray-200 text-gray-500"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {despesa.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {new Date(despesa.dataDespesa).toLocaleDateString()}
                </td>
                <td className="p-4 text-center">
                  {despesa.status !== "CANCELADA" && (
                    <button
                      onClick={() => cancelarDespesa(despesa.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <ModalNovaDespesa
          onClose={() => setModalAberto(false)}
          onSucesso={carregarDespesas}
        />
      )}
    </div>
  );
}
