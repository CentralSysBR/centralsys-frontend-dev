import type { TopProduto } from "../../types/relatorios";

interface Props {
  produtos: TopProduto[];
}

export function CardTopProdutos({ produtos }: Props) {
  return (
    <section className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2">Top Produtos</h2>

      <ul>
        {produtos.map((p) => (
          <li key={p.id}>
            {p.nome} — {p.totalVendido}
          </li>
        ))}
      </ul>
    </section>
  );
}
