import { useEffect, useState } from "react";
import {
  getRelatoriosDashboard,
  getRelatorioLucro,
  type RelatorioLucroResponse
} from "../services/relatorios";

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<any>(null);
  const [lucro, setLucro] = useState<RelatorioLucroResponse | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const [dashboard, lucroResp] = await Promise.all([
          getRelatoriosDashboard(),
          getRelatorioLucro()
        ]);

        setDados(dashboard.data);
        setLucro(lucroResp);
      } catch {
        setErro("Erro ao carregar relatórios.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (loading) return <p>Carregando relatórios...</p>;
  if (erro || !dados || !lucro) return <p>{erro}</p>;

  const margemTexto =
    lucro.lucro.margemPercentual >= 0
      ? `De cada R$ 100 vendidos, você fica com R$ ${lucro.lucro.margemPercentual.toFixed(
          0
        )}`
      : "Você está vendendo com prejuízo";

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>

      {/* 💰 QUANTO SOBRA */}
      <section className="bg-green-50 p-5 rounded-xl border border-green-200">
        <h2 className="font-bold text-green-800 mb-1">
          Quanto sobra pra você
        </h2>

        <p className="text-3xl font-black text-green-700">
          R$ {lucro.lucro.lucro.toFixed(2)}
        </p>

        <p className="text-sm text-green-700 mt-1">
          {margemTexto}
        </p>
      </section>

      {/* Financeiro */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Resumo Financeiro</h2>
        <p>Total faturado: R$ {dados.financeiro.faturamentoTotal}</p>
        <p>Vendas realizadas: {dados.financeiro.totalVendas}</p>
      </section>

      {/* Top Produtos */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Top Produtos</h2>
        <ul>
          {dados.topProdutos.map((p: any, i: number) => (
            <li key={i}>
              {p.nome} — R$ {p.totalFaturado}
            </li>
          ))}
        </ul>
      </section>

      {/* Estoque */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Estoque Crítico</h2>
        <ul>
          {dados.estoque.itensCriticos.map((p: any, i: number) => (
            <li key={i}>
              {p.nome} — {p.qtd}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
