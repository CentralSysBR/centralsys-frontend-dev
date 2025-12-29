import { useEffect, useState } from "react";
import { getRelatoriosDashboard } from "../services/relatorios";
import type { RelatoriosDashboardResponse } from "../types/relatorios";
import { ResumoFinanceiroCard } from "../components/relatorios/ResumoFinanceiroCard";
import { TopProdutosCard } from "../components/relatorios/TopProdutosCard";
import { EstoqueCriticoCard } from "../components/relatorios/EstoqueCriticoCard";


export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<RelatoriosDashboardResponse | null>(null);
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

  if (!dados) {
  return <p>Nenhum dado de relatório disponível.</p>;
}


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>

     
  <div className="p-6 space-y-6">
    <h1 className="text-2xl font-bold">Relatórios</h1>

    <ResumoFinanceiroCard financeiro={dados.financeiro} />

    <TopProdutosCard produtos={dados.topProdutos} />

    <EstoqueCriticoCard itens={dados.estoque.itensCriticos} />
  </div>

    </div>
  );
}
