import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrencyBR } from "../../utils/formatCurrencyBR";

interface Props {
  lucro: number;
  margem: number;
  variacao?: number | null;
  insight?: string | null;
}

export function CardLucro({ lucro, margem, variacao, insight }: Props) {
  const variacaoSafe = typeof variacao === "number" ? variacao : 0;
  const margemSafe = typeof margem === "number" ? margem : 0;

  const temVariacao = typeof variacao === "number";
  const positivo = variacaoSafe >= 0;

  return (
    <section className="bg-green-50 p-5 rounded-xl border border-green-200 space-y-1">
      <h2 className="font-bold text-green-800">
        Quanto sobra pra você
      </h2>

      <p className="text-3xl font-black text-green-700">
        {formatCurrencyBR(lucro)}
      </p>

      {temVariacao && (
        <div className="flex items-center gap-1 text-sm">
          {positivo ? (
            <ArrowUpRight className="text-green-600" size={16} />
          ) : (
            <ArrowDownRight className="text-red-600" size={16} />
          )}

          <span className={positivo ? "text-green-700" : "text-red-700"}>
            {Math.abs(variacaoSafe).toFixed(1)}% em relação ao período anterior
          </span>
        </div>
      )}

      <p className="text-xs text-green-700">
        De cada R$ 100 vendidos, você fica com R$ {margemSafe.toFixed(0)}
      </p>

      {insight && (
        <p className="mt-2 text-sm font-semibold text-orange-700">
          💡 {insight}
        </p>
      )}
    </section>
  );
}
