import { useEffect, useState } from "react";
import {
  getRelatoriosDashboard,
  getRelatorioLucro,
  type RelatorioLucroResponse
} from "../services/relatorios";

import { CardLucro } from "../components/relatorios";

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

  const margemPercentual = lucro.lucro.margemPercentual;

  const insightLucro =
    margemPercentual > 0 && margemPercentual < 20
      ? "Você vende bem, mas sua margem está baixa"
      : margemPercentual < 0
      ? "Você está vendendo com prejuízo"
      : null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>

      {/* 💰 LUCRO */}
      <CardLucro
  lucro={lucro.lucro.lucro}
  margem={margemPercentual}
  insight={insightLucro}
/>

      {/* 📊 FINANCEIRO */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Resumo Financeiro</h2>
        <p>Total faturado: R$ {dados.financeiro.faturamentoTotal}</p>
        <p>Vendas realizadas: {dados.financeiro.totalVendas}</p>
      </section>

      {/* 🏆 TOP PRODUTOS */}
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

      {/* 📦 ESTOQUE */}
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
