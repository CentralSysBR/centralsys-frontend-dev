import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, ShoppingCart, X, Loader2, ChevronRight 
} from 'lucide-react';
import { api } from '../services/api';

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  precoVenda: number;
  quantidadeEstoque: number;
}

interface ItemCarrinho extends Produto {
  quantidade: number;
}

export default function PDV() {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFinalizando, setIsFinalizando] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [caixaId, setCaixaId] = useState<string | null>(null);
  const [vendaSucesso, setVendaSucesso] = useState(false);

  const normalizarTexto = (txt: string) => 
    txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  function getQuantidadeNoCarrinho(produtoId: string) {
    const item = carrinho.find(item => item.id === produtoId);
    return item ? item.quantidade : 0;
  }

  useEffect(() => {
    async function inicializarDados() {
      try {
        setLoading(true);
        const [resProdutos, resCaixa] = await Promise.all([
          api.get('/produtos'),
          api.get('/caixas/aberto')
        ]);

        setProdutos(resProdutos.data.data.produtos || []);
        if (resCaixa.data.data) {
          setCaixaId(resCaixa.data.data.id);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do PDV:", error);
      } finally {
        setLoading(false);
      }
    }
    inicializarDados();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categorias = ['Todos', ...new Set(produtos.map(p => p.categoria))];

  const sugestoesDropdown = produtos.filter(p => {
    const termoBusca = normalizarTexto(busca);
    const nomeProduto = normalizarTexto(p.nome);
    return busca.length >= 2 && nomeProduto.includes(termoBusca);
  });

  const produtosExibidos = produtos.filter(p => {
    const bateCategoria = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva;
    const termoBusca = normalizarTexto(busca);
    const nomeProduto = normalizarTexto(p.nome);
    return bateCategoria && nomeProduto.includes(termoBusca);
  });

  function adicionarAoCarrinho(produto: Produto) {
    setCarrinho(prev => {
      const existe = prev.find(item => item.id === produto.id);
      if (existe) {
        return prev.map(item => 
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
    setBusca('');
    setShowDropdown(false);
  }

  // NOVA FUNÇÃO: Remover ou decrementar item
  function removerDoCarrinho(produtoId: string) {
    setCarrinho(prev => {
      const item = prev.find(i => i.id === produtoId);
      if (item && item.quantidade > 1) {
        return prev.map(i => i.id === produtoId ? { ...i, quantidade: i.quantidade - 1 } : i);
      }
      return prev.filter(i => i.id !== produtoId);
    });
  }

  async function handleFinalizar() {
    if (carrinho.length === 0) return;
    if (!caixaId) {
      alert("Erro: Nenhum caixa aberto encontrado. Abra o caixa antes de vender.");
      return;
    }

    try {
      setIsFinalizando(true);
      
      const payload = {
        caixaId: caixaId,
        metodoPagamento: "DINHEIRO",
        itens: carrinho.map(item => ({
          produtoId: item.id,
          quantidade: item.quantidade
        }))
      };

      await api.post('/vendas', payload);
      
      setVendaSucesso(true);
      setCarrinho([]);
      
      // Redirecionamento após 1.5 segundos para o Dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao processar venda.";
      alert(msg);
      setIsFinalizando(false);
    }
  }

  const totalVenda = carrinho.reduce((sum, item) => sum + (Number(item.precoVenda) * item.quantidade), 0);
  const totalItens = carrinho.reduce((a, b) => a + b.quantidade, 0);

  // Overlay de Sucesso
  if (vendaSucesso) {
    return (
      <div className="fixed inset-0 bg-[#2D6A4F] z-[100] flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="bg-white/20 p-6 rounded-full mb-6">
          <ShoppingCart size={64} className="animate-bounce" />
        </div>
        <h2 className="text-3xl font-black mb-2">Venda Realizada!</h2>
        <p className="opacity-80">Redirecionando para o dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <header className="bg-white border-b sticky top-0 z-30 px-4 pt-4 pb-2 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-1">
              <ArrowLeft size={24} className="text-[#1A2B3C]" />
            </button>
            <h1 className="text-xl font-bold text-[#1A2B3C]">Nova Venda</h1>
          </div>
          <div className={`text-[10px] font-bold px-3 py-1 rounded-full ${caixaId ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {caixaId ? 'CAIXA ABERTO' : 'CAIXA FECHADO'}
          </div>
        </div>
        
        <div className="relative mb-4" ref={dropdownRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Pesquisar produto..."
            className="w-full pl-10 pr-10 py-3 bg-gray-100 border-2 border-transparent focus:border-[#2D6A4F] focus:bg-white rounded-xl outline-none transition-all text-base"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && sugestoesDropdown.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-2xl rounded-xl border border-gray-100 max-h-72 overflow-y-auto z-50">
              {sugestoesDropdown.map(p => (
                <div key={p.id} className="p-4 border-b border-gray-50 flex justify-between items-center cursor-pointer" onClick={() => adicionarAoCarrinho(p)}>
                  <span className="font-bold text-[#1A2B3C]">{p.nome}</span>
                  <span className="font-bold text-[#2D6A4F]">R$ {Number(p.precoVenda).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                categoriaAtiva === cat ? 'bg-[#1A2B3C] text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Carregando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {produtosExibidos.map(produto => {
              const qtd = getQuantidadeNoCarrinho(produto.id);
              return (
                <div 
                  key={produto.id}
                  className={`flex items-center justify-between p-4 bg-white rounded-2xl border transition-all relative ${
                    qtd > 0 ? 'border-[#2D6A4F] ring-1 ring-[#2D6A4F]' : 'border-gray-100'
                  }`}
                >
                  {qtd > 0 && (
                    <button 
                      onClick={() => removerDoCarrinho(produto.id)}
                      className="absolute -top-2 -left-2 bg-red-500 text-white w-6 h-6 rounded-lg flex items-center justify-center shadow-md active:scale-90 transition-transform"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  )}
                  
                  <div className="flex-1" onClick={() => adicionarAoCarrinho(produto)}>
                    <h3 className="font-bold text-[#1A2B3C]">{produto.nome}</h3>
                    <p className="text-xs text-gray-400">Estoque: {produto.quantidadeEstoque}</p>
                    {qtd > 0 && (
                      <span className="text-[10px] font-black text-[#2D6A4F] uppercase tracking-tighter">
                        No carrinho: {qtd}x
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4" onClick={() => adicionarAoCarrinho(produto)}>
                    <p className="font-black text-[#2D6A4F]">R$ {Number(produto.precoVenda).toFixed(2)}</p>
                    <div className="bg-gray-50 p-2 rounded-xl text-gray-400">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {carrinho.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] z-40">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Total</span>
              <span className="text-2xl font-black text-[#1A2B3C]">R$ {totalVenda.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleFinalizar}
              disabled={isFinalizando || !caixaId}
              className="flex-1 bg-[#2D6A4F] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-transform"
            >
              {isFinalizando ? <Loader2 className="animate-spin" size={22} /> : <ShoppingCart size={22} />}
              <span>{isFinalizando ? 'Processando...' : `Finalizar (${totalItens})`}</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}