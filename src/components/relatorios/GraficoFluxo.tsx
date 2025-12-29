import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FluxoDia {
  data: string;
  total: number;
}

interface Props {
  dados: FluxoDia[];
}

export function GraficoFluxo({ dados }: Props) {
  if (!dados || dados.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Sem dados de fluxo no período selecionado.
      </p>
    );
  }

  return (
    <section className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2">Evolução do Faturamento</h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={dados}>
          <XAxis dataKey="data" />
          <YAxis />
          <Tooltip
            formatter={(value?: number) =>
              value !== undefined
                ? `R$ ${value.toFixed(2)}`
                : "R$ 0,00"
            }
          />
          <Line
            type="monotone"
            dataKey="total"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
