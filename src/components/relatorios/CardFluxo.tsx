import { formatCurrencyBR } from '../../utils/formatCurrencyBR';

interface Props {
  total: number;
  media: number;
  insights?: string[];
}

export function CardFluxo({ total, media, insights }: Props) {
  return (
    <section className="bg-blue-50 p-5 rounded-xl border border-blue-200 space-y-2">
      <h2 className="font-bold text-blue-800">
        Fluxo de Caixa (Entradas)
      </h2>

      <p className="text-3xl font-black text-blue-700">
        {formatCurrencyBR(total)}
      </p>

      <p className="text-sm text-blue-700">
        Média diária: {formatCurrencyBR(media)}
      </p>

      {insights && insights.length > 0 && (
        <div className="mt-2 space-y-1">
          {insights.map((insight, i) => (
            <p
              key={i}
              className="text-sm font-semibold text-orange-700"
            >
              💡 {insight}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
