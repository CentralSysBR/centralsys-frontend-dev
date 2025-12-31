import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, ShoppingCart, Loader2,
  AlertCircle, Camera, X
} from 'lucide-react';
import { api } from '../services/api';
import { ModalFinalizarVenda } from '../components/ModalFinalizarVenda';
import { ReciboVenda } from '../components/ReciboVenda';
import { ProductCard } from '../components/ProductCard';
import { PDVBarcodeScanner } from '../components/PDVBarcodeScanner';

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  precoVenda: number;
  quantidadeEstoque: number;
  codigoBarras?: string;
  imagemUrl?: string;
}

interface ItemCarrinho extends Produto {
  quantidade: number;
}

export default function PDV() {
  const navigate = useNavigate();

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const SHOW_CATEGORIAS_PDV = false;

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFinalizando, setIsFinalizando] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [caixaId, setCaixaId] = useState<string | null>(null);

  const [isModalPagamentoOpen, setIsModalPagamentoOpen] = useState(false);
  const [showRecibo, setShowRecibo] = useState(false);
  const [dadosVendaFinalizada, setDadosVendaFinalizada] = useState<any>(null);

  const normalizarTexto = (txt: string) =>
    txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  useEffect(() => {
    async function inicializarDados() {
      try {
        setLoading(true);
        // Busca produtos e status do caixa simultaneamente
        const [resProdutos, resCaixa] = await Promise.all([
          api.get('/produtos'),
          api.get('/caixas') // Usando a rota base para filtrar o aberto
        ]);

        setProdutos(resProdutos.data.data || []);

        const caixas = resCaixa.data.data || [];
        const caixaAberto = caixas.find((c: any) => c.status === 'ABERTO');
        if (caixaAberto) setCaixaId(caixaAberto.id);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    inicializarDados();
  }, []);
  

  const categorias = ['Todos', ...new Set(produtos.map(p => p.categoria))];
  const totalVenda = carrinho.reduce((sum, item) => sum + (Number(item.precoVenda) * item.quantidade), 0);
  const totalItens = carrinho.reduce((a, b) => a + b.quantidade, 0);
  function handleBarcodeScanned(codigo: string) {
    const produto = produtos.find(p => p.codigoBarras === codigo);

    if (!produto) {
      alert('Produto não encontrado.');
      return;
    }

    adicionarAoCarrinho(produto);
  }
  function adicionarAoCarrinho(produto: Produto) {
    if (!caixaId) {
      alert("Atenção: Você precisa abrir o caixa antes de iniciar uma venda.");
      return;
    }
    setCarrinho(prev => {
      const existe = prev.find(item => item.id === produto.id);
      if (existe) {
        return prev.map(item => item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item);
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
    setBusca('');
  }

  function removerDoCarrinho(produtoId: string) {
    setCarrinho(prev => {
      const item = prev.find(i => i.id === produtoId);
      if (item && item.quantidade > 1) {
        return prev.map(i => i.id === produtoId ? { ...i, quantidade: i.quantidade - 1 } : i);
      }
      return prev.filter(i => i.id !== produtoId);
    });
  }

  async function handleConfirmarVenda(metodo: string, recebido?: number, troco?: number) {
    if (!caixaId) {
      alert("Erro: Caixa não identificado.");
      return;
    }

    try {
      setIsFinalizando(true);
      const payload = {
        caixaId: caixaId,
        metodoPagamento: metodo,
        itens: carrinho.map(item => ({
          produtoId: item.id,
          quantidade: item.quantidade
        }))
      };

      const response = await api.post('/vendas', payload);

      setDadosVendaFinalizada({
        id: response.data.data.id,
        itens: [...carrinho],
        total: totalVenda,
        metodoPagamento: metodo,
        valorRecebido: recebido,
        troco: troco
      });

      setIsModalPagamentoOpen(false);
      setShowRecibo(true);

    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao processar venda.");
    } finally {
      setIsFinalizando(false);
    }
  }

  function resetarPDV() {
    setCarrinho([]);
    setDadosVendaFinalizada(null);
    setShowRecibo(false);
    // Após a venda, voltamos para o dashboard para garantir atualização de estados
    window.location.replace('/dashboard');
  }

  const produtosExibidos = produtos
    .filter(p => {
      const bateCategoria = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva;
      return bateCategoria && normalizarTexto(p.nome).includes(normalizarTexto(busca));
    })
    .sort((a, b) => {
      const qtdA = carrinho.find(i => i.id === a.id)?.quantidade || 0;
      const qtdB = carrinho.find(i => i.id === b.id)?.quantidade || 0;

      // Produtos no carrinho vêm primeiro
      if (qtdA > 0 && qtdB === 0) return -1;
      if (qtdA === 0 && qtdB > 0) return 1;

      return 0;
    });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <header className="bg-white border-b sticky top-0 z-30 px-4 pt-4 pb-2 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-[#1A2B3C]" />
            </button>
            <h1 className="text-xl font-bold text-[#1A2B3C]">Nova Venda</h1>
          </div>
          <div className={`text-[10px] font-black px-3 py-1 rounded-full tracking-tighter ${caixaId ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {caixaId ? '● CAIXA OPERACIONAL' : '○ CAIXA FECHADO'}
          </div>
        </div>

        {!caixaId && !loading && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-pulse">
            <AlertCircle size={20} />
            <p className="text-xs font-bold uppercase">É necessário abrir o caixa para vender.</p>
            <button
              onClick={() => navigate('/caixa')}
              className="ml-auto bg-red-600 text-white text-[10px] px-3 py-1.5 rounded-lg font-black"
            >
              ABRIR AGORA
            </button>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar produto..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-2 border-transparent focus:border-[#2D6A4F] focus:bg-white rounded-xl outline-none transition-all text-base"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="p-2 bg-blue-50 text-blue-600 rounded-xl"
          >
            <Camera size={24} />
          </button>
        </div>
        {SHOW_CATEGORIAS_PDV && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${categoriaAtiva === cat ? 'bg-[#1A2B3C] text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

      </header>

      <main className="p-4 max-w-lg mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-sm font-medium">Carregando catálogo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {produtosExibidos.map(produto => {
              const qtd = carrinho.find(i => i.id === produto.id)?.quantidade || 0;
              return (
                <div key={produto.id} className="relative">
                  {qtd > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removerDoCarrinho(produto.id);
                      }}
                      className="absolute -top-2 -left-2 bg-red-500 text-white w-6 h-6 rounded-lg flex items-center justify-center shadow-md active:scale-90 z-10"
                    >
                      ✕
                    </button>
                  )}

                  <ProductCard
                    id={produto.id}
                    nome={produto.nome}
                    precoVenda={produto.precoVenda}
                    quantidadeEstoque={produto.quantidadeEstoque}
                    imagemUrl={produto.imagemUrl}
                    quantidadeNoCarrinho={qtd}
                    disabled={!caixaId}
                    mode="pdv"
                    onClick={() => adicionarAoCarrinho(produto)}
                  />
                </div>

              );
            })}
          </div>
        )}
      </main>

      {carrinho.length > 0 && !showRecibo && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] z-40">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Total</span>
              <span className="text-2xl font-black text-[#1A2B3C]">R$ {totalVenda.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setIsModalPagamentoOpen(true)}
              disabled={!caixaId || isFinalizando}
              className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg ${caixaId ? 'bg-[#2D6A4F] text-white shadow-green-100' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
            >
              {caixaId ? (
                <>
                  <ShoppingCart size={22} />
                  <span>Finalizar ({totalItens})</span>
                </>
              ) : (
                <span>Abrir Caixa Necessário</span>
              )}
            </button>
          </div>
        </footer>
      )}

      <ModalFinalizarVenda
        isOpen={isModalPagamentoOpen}
        onClose={() => setIsModalPagamentoOpen(false)}
        carrinho={carrinho}
        totalVenda={totalVenda}
        onConfirm={handleConfirmarVenda}
        isFinalizando={isFinalizando}
      />

      {showRecibo && dadosVendaFinalizada && (
        <ReciboVenda
          vendaId={dadosVendaFinalizada.id}
          itens={dadosVendaFinalizada.itens}
          total={dadosVendaFinalizada.total}
          metodoPagamento={dadosVendaFinalizada.metodoPagamento}
          valorRecebido={dadosVendaFinalizada.valorRecebido}
          troco={dadosVendaFinalizada.troco}
          onFinalizar={resetarPDV}
        />
      )}
      
      <PDVBarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(codigo: string) => {
          handleBarcodeScanned(codigo);
        }}
      />
    </div>
  );
}