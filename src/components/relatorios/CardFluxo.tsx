interface Props {
  total: number;
  media: number;
  diasComVenda: number;
  diasSemVenda: number;
  insights: string[];
}

export function CardFluxo({
  total,
  media,
  diasComVenda,
  diasSemVenda,
  insights,
}: Props) {
  return (
    <section className="bg-blue-50 p-5 rounded-xl border border-blue-200 space-y-2">
      <h2 className="font-bold text-blue-800">
        Fluxo de faturamento
      </h2>

      <p className="text-3xl font-black text-blue-700">
        R$ {total.toFixed(2)}
      </p>

      <p className="text-sm text-blue-700">
        Média diária: R$ {media.toFixed(2)}
      </p>

      <div className="text-xs text-blue-700">
        <p>📅 Dias com venda: {diasComVenda}</p>
        <p>🚫 Dias sem venda: {diasSemVenda}</p>
      </div>

      {insights.length > 0 && (
        <div className="pt-2 space-y-1">
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
