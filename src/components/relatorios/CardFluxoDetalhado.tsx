interface Props {
  entradas: number;
  despesas: number;
  custos: number;
  saldo: number;
}

export function CardFluxoDetalhado({
  entradas,
  despesas,
  custos,
  saldo,
}: Props) {
  const negativo = saldo < 0;

  return (
    <div className="bg-white p-4 rounded shadow space-y-2">
      <h2 className="font-semibold">Fluxo Financeiro Detalhado</h2>

      <p>Entradas (Vendas): R$ {entradas.toFixed(2)}</p>

      <p className="text-red-600">
        Saídas (Despesas): R$ {despesas.toFixed(2)}
      </p>

      <p className="text-orange-600">
        Custos Operacionais: R$ {custos.toFixed(2)}
      </p>

      <hr />

      <p
        className={`font-bold ${
          negativo ? "text-red-700" : "text-green-700"
        }`}
      >
        Saldo Líquido: R$ {saldo.toFixed(2)}
      </p>

      {negativo && (
        <p className="text-sm text-red-500">
          ⚠️ Atenção: suas saídas superaram as entradas neste período
        </p>
      )}
    </div>
  );
}
