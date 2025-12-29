import type { ResumoFinanceiro } from "../../types/relatorios";

interface Props {
  financeiro: ResumoFinanceiro;
}

export function ResumoFinanceiroCard({ financeiro }: Props) {
  return (
    <section className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2">Resumo Financeiro</h2>

      <p>
        Total: R$ {financeiro.faturamentoTotal.toFixed(2)}
      </p>
      <p>
        Vendas: {financeiro.totalVendas}
      </p>
      <p>
        Ticket Médio: R$ {financeiro.ticketMedio.toFixed(2)}
      </p>
    </section>
  );
}
