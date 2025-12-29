import { useState } from "react";
import { criarVenda } from "../services/vendas";
import { useCaixa } from "../components/contexts/CaixaContext";

/* ======================
   TIPOS
====================== */

interface ItemVenda {
  produtoId: string;
  quantidade: number;
}

type MetodoPagamento =
  | "DINHEIRO"
  | "CREDITO"
  | "DEBITO"
  | "PIX";

/* ======================
   COMPONENT
====================== */

export default function CriarVenda() {
  const { caixaAtivo, carregando } = useCaixa();

  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [metodoPagamento, setMetodoPagamento] =
    useState<MetodoPagamento>("DINHEIRO");

  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  /* ======================
     GUARDS DE RENDER
  ====================== */

  if (carregando) {
    return <p>Verificando caixa...</p>;
  }

  if (!caixaAtivo) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-semibold">
          Nenhum caixa aberto. Abra um caixa para realizar vendas.
        </p>
      </div>
    );
  }

  /* ======================
     ACTION
  ====================== */

  async function finalizarVenda() {
    // 🔒 Guard explícito (TS + domínio)
    if (!caixaAtivo) {
      setErro("Nenhum caixa ativo.");
      return;
    }

    if (itens.length === 0) {
      setErro("Adicione ao menos um item à venda.");
      return;
    }

    try {
      setErro(null);
      setSalvando(true);

      await criarVenda({
        caixaId: caixaAtivo.id,
        metodoPagamento,
        itens,
      });

      // 🔜 Futuro:
      // - limpar itens
      // - navegar para detalhe
      // - recarregar caixa
    } catch {
      setErro("Erro ao realizar venda");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Nova Venda</h1>

      {/* UI de itens virá depois */}

      {erro && <p className="text-red-500">{erro}</p>}

      <button
        onClick={finalizarVenda}
        disabled={salvando}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {salvando ? "Finalizando..." : "Finalizar Venda"}
      </button>
    </div>
  );
}
