import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FluxoDia {
  data: string;
  faturamento: number;
}

interface Props {
  dados: FluxoDia[];
}

export function GraficoFluxo({ dados }: Props) {
  return (
    <section className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-3">Fluxo de Faturamento</h2>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="data" />
          <YAxis />

          <Tooltip
            formatter={(value) => {
              if (typeof value !== "number") return "R$ 0,00";
              return `R$ ${value.toFixed(2)}`;
            }}
          />

          <Line
            type="monotone"
            dataKey="faturamento"
            stroke="#16a34a"
            strokeWidth={3}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
