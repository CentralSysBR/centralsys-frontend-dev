import { useEffect, useState } from "react";
import { getRelatoriosDashboard } from "../services/relatorios";

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const response = await getRelatoriosDashboard();
        setDados(response.data);
      } catch (e) {
        setErro("Erro ao carregar relatórios.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (loading) return <p>Carregando relatórios...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>

      {/* Financeiro */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Resumo Financeiro</h2>
        <p>Total: R$ {dados.financeiro.total}</p>
        <p>Vendas: {dados.financeiro.quantidade}</p>
      </section>

      {/* Top Produtos */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Top Produtos</h2>
        <ul>
          {dados.topProdutos.map((p: any) => (
            <li key={p.id}>
              {p.nome} — {p.totalVendido}
            </li>
          ))}
        </ul>
      </section>

      {/* Estoque */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Estoque Crítico</h2>
        <ul>
          {dados.estoque.itensCriticos.map((p: any) => (
            <li key={p.id}>
              {p.nome} — {p.quantidade}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
