import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Plus, Package, AlertTriangle, 
  ChevronRight, Loader2, Barcode, X, Save, TrendingUp 
} from 'lucide-react';
import { api } from '../services/api';

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  precoVenda: number;
  precoCusto?: number;
  quantidadeEstoque: number;
  codigoBarras?: string;
}

export default function Produtos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtroEstoque, setFiltroEstoque] = useState<'todos' | 'baixo'>('todos');

  // Estados do Modal de Entrada
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [qtdEntrada, setQtdEntrada] = useState<number>(0);
  const [novoPrecoVenda, setNovoPrecoVenda] = useState<number>(0);
  const [isSalvando, setIsSalvando] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      setLoading(true);
      const response = await api.get('/produtos');
      setProdutos(response.data.data.produtos || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  }

  const normalizarTexto = (txt: string) => 
    txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const produtosFiltrados = produtos.filter(p => {
    const termo = normalizarTexto(busca);
    return normalizarTexto(p.nome).includes(termo) || (p.codigoBarras && p.codigoBarras.includes(busca));
  });

  function abrirEntrada(produto: Produto) {
    setProdutoSelecionado(produto);
    setNovoPrecoVenda(Number(produto.precoVenda));
    setQtdEntrada(0);
    setIsModalOpen(true);
  }

  async function confirmarEntrada() {
  if (!produtoSelecionado) return;

  // Garantir que enviamos um número, mesmo que seja 0
  const qtdParaEnviar = Number(qtdEntrada) || 0;
  const precoParaEnviar = Number(novoPrecoVenda);

  const houveMudancaPreco = precoParaEnviar !== Number(produtoSelecionado.precoVenda);
  const houveEntradaEstoque = qtdParaEnviar > 0;

  // Se nada mudou, nem faz a requisição
  if (!houveMudancaPreco && !houveEntradaEstoque) return;

  try {
    setIsSalvando(true);
    await api.patch(`/produtos/${produtoSelecionado.id}/estoque`, {
      quantidadeAdicionada: qtdParaEnviar, // Agora envia 0 se estiver vazio
      novoPrecoVenda: precoParaEnviar
    });

    setIsModalOpen(false);
    await carregarProdutos(); 
  } catch (error) {
    console.error(error);
    alert("Erro ao atualizar o produto. Verifique se a quantidade é um número válido.");
  } finally {
    setIsSalvando(false);
  }
}

  // Lógica para habilitar o botão: tem que ter mudado o preço OU ter adicionado estoque
  const podeSalvar = produtoSelecionado && (
    qtdEntrada > 0 || novoPrecoVenda !== Number(produtoSelecionado.precoVenda)
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <header className="bg-white border-b sticky top-0 z-30 px-4 pt-4 pb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-1">
              <ArrowLeft size={24} className="text-[#1A2B3C]" />
            </button>
            <h1 className="text-xl font-bold text-[#1A2B3C]">Estoque</h1>
          </div>
          <button 
            onClick={() => alert("Fluxo de cadastro completo em breve!")}
            className="p-2 bg-gray-100 rounded-xl text-[#1A2B3C]"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome ou código..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-2 border-transparent focus:border-[#1A2B3C] focus:bg-white rounded-xl outline-none transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20 text-gray-400"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {produtosFiltrados.map(produto => (
              <div 
                key={produto.id}
                onClick={() => abrirEntrada(produto)}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${produto.quantidadeEstoque <= 5 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A2B3C]">{produto.nome}</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      produto.quantidadeEstoque <= 5 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      ESTOQUE: {produto.quantidadeEstoque}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#2D6A4F]">R$ {Number(produto.precoVenda).toFixed(2)}</p>
                  <p className="text-[10px] text-blue-600 font-bold uppercase">Ajustar</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL DE AJUSTE/ENTRADA */}
      {isModalOpen && produtoSelecionado && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <h2 className="font-bold text-lg text-[#1A2B3C]">Ajuste de Produto</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                <X size={20}/>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Produto Selecionado</p>
                <p className="font-bold text-[#1A2B3C]">{produtoSelecionado.nome}</p>
                {produtoSelecionado.codigoBarras && (
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                    <Barcode size={12} /> {produtoSelecionado.codigoBarras}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Atual</p>
                  <p className="text-2xl font-black text-gray-400 text-center">{produtoSelecionado.quantidadeEstoque}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-500">
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest text-center mb-1">Entrada (+)</p>
                  <input 
                    type="number"
                    autoFocus
                    className="w-full bg-transparent text-center text-3xl font-black text-green-700 outline-none"
                    value={qtdEntrada || ''}
                    onChange={(e) => setQtdEntrada(Math.max(0, Number(e.target.value)))}
                  />
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                   <p className="text-[10px] font-bold text-blue-600 uppercase">Novo Preço de Venda (R$)</p>
                   {novoPrecoVenda !== Number(produtoSelecionado.precoVenda) && (
                     <span className="flex items-center text-[10px] text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded animate-pulse">
                       <TrendingUp size={10} className="mr-1" /> ALTERADO
                     </span>
                   )}
                </div>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full bg-transparent text-xl font-bold text-[#1A2B3C] outline-none"
                  value={novoPrecoVenda}
                  onChange={(e) => setNovoPrecoVenda(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between p-2 text-sm bg-gray-50 rounded-xl">
                <span className="text-gray-500">Novo estoque final:</span>
                <span className="font-black text-lg text-[#1A2B3C]">
                  {produtoSelecionado.quantidadeEstoque + qtdEntrada} un.
                </span>
              </div>

              <button 
                onClick={confirmarEntrada}
                disabled={isSalvando || !podeSalvar}
                className="w-full bg-[#1A2B3C] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale transition-all shadow-lg active:scale-95"
              >
                {isSalvando ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Confirmar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}