import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  lucro: number;
  margem: number;
  variacao?: number | null;
  insight?: string | null;
}

export function CardLucro({ lucro, margem, variacao, insight }: Props) {
  const temVariacao = typeof variacao === "number";
  const positivo = temVariacao && variacao >= 0;

  return (
    <section className="bg-green-50 p-5 rounded-xl border border-green-200 space-y-1">
      <h2 className="font-bold text-green-800">
        Quanto sobra pra você
      </h2>

      <p className="text-3xl font-black text-green-700">
        R$ {lucro.toFixed(2)}
      </p>

      {temVariacao && (
        <div className="flex items-center gap-1 text-sm">
          {positivo ? (
            <ArrowUpRight className="text-green-600" size={16} />
          ) : (
            <ArrowDownRight className="text-red-600" size={16} />
          )}

          <span className={positivo ? "text-green-700" : "text-red-700"}>
            {Math.abs(variacao).toFixed(1)}% em relação ao período anterior
          </span>
        </div>
      )}

      <p className="text-xs text-green-700">
        De cada R$ 100 vendidos, você fica com R$ {margem.toFixed(0)}
      </p>

      {insight && (
        <p className="mt-2 text-sm font-semibold text-orange-700">
          💡 {insight}
        </p>
      )}
    </section>
  );
}
