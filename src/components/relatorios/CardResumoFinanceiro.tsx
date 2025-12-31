import type { ResumoFinanceiro } from "../../types/relatorios";
import { formatCurrencyBR } from '../../utils/formatCurrencyBR';


interface Props {
  financeiro: ResumoFinanceiro;
}

export function CardResumoFinanceiro({ financeiro }: Props) {
  return (
    <section className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2">Resumo Financeiro</h2>

      <p>
        Total: {formatCurrencyBR(financeiro.faturamentoTotal)}
      </p>
      <p>
        Vendas: {financeiro.totalVendas}
      </p>
      <p>
        Ticket Médio: {formatCurrencyBR(financeiro.ticketMedio)}
      </p>

    </section>
  );
}
