import { formatCurrencyBR } from "../../utils/formatCurrencyBR";

interface Props {
  /** Centavos (Int) */
  entradas: number;
  /** Centavos (Int) */
  despesas: number;
  /** Centavos (Int) */
  custos: number;
  /** Centavos (Int) */
  saldo: number;
}

export function CardFluxoDetalhado({ entradas, despesas, custos, saldo }: Props) {
  const negativo = saldo < 0;

  return (
    <div className="bg-white p-4 rounded shadow space-y-2">
      <p>Entradas (Vendas): {formatCurrencyBR(entradas)}</p>
      <p className="text-red-600">Saídas (Despesas): {formatCurrencyBR(despesas)}</p>
      <p className="text-orange-600">Custos Operacionais: {formatCurrencyBR(custos)}</p>

      <hr />

      <p className={`font-bold ${negativo ? "text-red-700" : "text-green-700"}`}>
        Saldo Líquido: {formatCurrencyBR(saldo)}
      </p>

      {negativo && (
        <p className="text-sm text-red-500">
          ⚠️ Atenção: suas saídas superaram as entradas neste período
        </p>
      )}
    </div>
  );
}
