import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getVendaDetalhe, type Venda } from "../services/vendas";

export default function VendaDetalhe() {
  const { id } = useParams<{ id: string }>();

  const [venda, setVenda] = useState<Venda | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        if (!id) return;
        const data = await getVendaDetalhe(id);
        setVenda(data);
      } catch {
        setErro("Erro ao carregar venda.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [id]);

  if (loading) return <p>Carregando venda...</p>;
  if (erro || !venda) return <p>{erro}</p>;

  return (
    <div className="p-6 space-y-6">
      <Link to="/vendas" className="text-blue-600 underline">
        ← Voltar para vendas
      </Link>

      <h1 className="text-2xl font-bold">
        Venda #{venda.id.slice(0, 8)}
      </h1>

      <section className="bg-white p-4 rounded shadow space-y-1">
        <p><strong>Data:</strong> {new Date(venda.criadoEm).toLocaleString()}</p>
        <p><strong>Vendedor:</strong> {venda.usuario.nome}</p>
        <p><strong>Pagamento:</strong> {venda.metodoPagamento}</p>
        <p className="font-semibold">
          Total: R$ {Number(venda.valorTotal).toFixed(2)}
        </p>
      </section>

      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Itens da Venda</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Produto</th>
              <th className="text-right p-2">Qtd</th>
              <th className="text-right p-2">Unitário</th>
              <th className="text-right p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {venda.itens.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.produto.nome}</td>
                <td className="p-2 text-right">{item.quantidade}</td>
                <td className="p-2 text-right">
                  R$ {Number(item.precoUnitario).toFixed(2)}
                </td>
                <td className="p-2 text-right font-semibold">
                  R$ {Number(item.precoTotal).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
