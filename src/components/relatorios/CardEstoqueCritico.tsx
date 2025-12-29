import type { EstoqueCriticoItem } from "../../types/relatorios";

interface Props {
  itens: EstoqueCriticoItem[];
}

export function CardEstoqueCritico({ itens }: Props) {
  return (
    <section className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2">Estoque Crítico</h2>

      <ul>
        {itens.map((p) => (
          <li key={p.id}>
            {p.nome} — {p.quantidade}
          </li>
        ))}
      </ul>
    </section>
  );
}
