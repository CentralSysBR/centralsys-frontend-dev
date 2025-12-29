import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getVendas } from "../services/vendas";
import type { Venda } from "../services/vendas";

export default function Vendas() {
  const navigate = useNavigate();

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);

        const resp = await getVendas(page, 10);

        setVendas(resp.data);
        setTotal(resp.meta?.paginacao?.total ?? 0);
      } catch {
        setErro("Erro ao carregar vendas.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [page]);

  if (loading) return <p>Carregando vendas...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Vendas</h1>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Data</th>
            <th className="p-2">Vendedor</th>
            <th className="p-2">Itens</th>
            <th className="p-2">Pagamento</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>

        <tbody>
          {vendas.map((venda) => (
            <tr
              key={venda.id}
              onClick={() => navigate(`/vendas/${venda.id}`)}
              className="border-b cursor-pointer hover:bg-gray-50"
            >
              <td className="p-2">
                {new Date(venda.criadoEm).toLocaleDateString()}
              </td>

              <td className="p-2">{venda.usuario.nome}</td>

              <td className="p-2">
  {venda._count?.itens ?? venda.itens.length}
</td>


              <td className="p-2">{venda.metodoPagamento}</td>

              <td className="p-2 font-semibold">
                R$ {Number(venda.valorTotal).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINAÇÃO */}
      <div className="flex gap-2 items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <span>
          Página {page} de {Math.max(1, Math.ceil(total / 10))}
        </span>

        <button
          disabled={page * 10 >= total}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
