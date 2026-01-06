import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, ShoppingCart, Loader2,
  AlertCircle, Camera
} from 'lucide-react';
import { api } from '../services/api';
import { ModalFinalizarVenda } from '../components/ModalFinalizarVenda';
import { ReciboVenda } from '../components/ReciboVenda';
import { ProductCard } from '../components/ProductCard';
import { PDVBarcodeScanner } from '../components/PDVBarcodeScanner';
import { formatCurrencyBR } from '../utils/formatCurrencyBR';

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  precoVendaCentavos: number;
  quantidadeEstoque: number;
  codigoBarras?: string;
  imagemUrl?: string;
}

interface ItemCarrinho extends Produto {
  quantidade: number;
}

const SCAN_COOLDOWN_MS = 1200;

export default function PDV() {
  const navigate = useNavigate();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFinalizando, setIsFinalizando] = useState(false);
  const [caixaId, setCaixaId] = useState<string | null>(null);

  const [isModalPagamentoOpen, setIsModalPagamentoOpen] = useState(false);
  const [showRecibo, setShowRecibo] = useState(false);
  const [dadosVendaFinalizada, setDadosVendaFinalizada] = useState<any>(null);

  // 🔒 Controle de leitura
  const barcodeLockRef = useRef(false);
  const lastScanAtRef = useRef(0);

  const normalizarTexto = (txt: string) =>
    txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const normalizarCodigo = (codigo: string) =>
    codigo.replace(/\D/g, '').trim();

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const [resProdutos, resCaixa] = await Promise.all([
          api.get('/produtos'),
          api.get('/caixas/aberto'),
        ]);

        setProdutos(resProdutos.data.data || []);

        const caixaAberto = resCaixa.data.data;
        setCaixaId(caixaAberto?.status === 'ABERTO' ? caixaAberto.id : null);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  function handleBarcodeScanned(rawCodigo: string) {
    const agora = Date.now();

    if (barcodeLockRef.current) return;
    if (agora - lastScanAtRef.current < SCAN_COOLDOWN_MS) return;

    barcodeLockRef.current = true;
    lastScanAtRef.current = agora;

    const codigo = normalizarCodigo(rawCodigo);

    const produto = produtos.find(
      p => p.codigoBarras && normalizarCodigo(p.codigoBarras) === codigo
    );

    if (!produto) {
      alert('Produto não encontrado.');
    } else {
      adicionarAoCarrinho(produto);
    }

    setTimeout(() => {
      barcodeLockRef.current = false;
    }, SCAN_COOLDOWN_MS);
  }

  function adicionarAoCarrinho(produto: Produto) {
    if (!caixaId) {
      alert('Abra o caixa antes de vender.');
      return;
    }

    setCarrinho(prev => {
      const existente = prev.find(i => i.id === produto.id);
      if (existente) {
        return prev.map(i =>
          i.id === produto.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });

    setBusca('');
  }

  function removerDoCarrinho(produtoId: string) {
    setCarrinho(prev => {
      const item = prev.find(i => i.id === produtoId);
      if (item && item.quantidade > 1) {
        return prev.map(i =>
          i.id === produtoId
            ? { ...i, quantidade: i.quantidade - 1 }
            : i
        );
      }
      return prev.filter(i => i.id !== produtoId);
    });
  }

  const totalVenda = carrinho.reduce(
    (sum, item) => sum + item.precoVendaCentavos * item.quantidade,
    0
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">Nova Venda</h1>
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="p-2 bg-blue-50 text-blue-600 rounded-xl"
          >
            <Camera size={24} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl"
          />
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {loading ? (
          <Loader2 className="animate-spin mx-auto mt-20" />
        ) : (
          produtos
            .filter(p =>
              normalizarTexto(p.nome).includes(normalizarTexto(busca))
            )
            .map(produto => {
              const qtd = carrinho.find(i => i.id === produto.id)?.quantidade || 0;
              return (
                <ProductCard
                  key={produto.id}
                  {...produto}
                  quantidadeNoCarrinho={qtd}
                  mode="pdv"
                  onClick={() => adicionarAoCarrinho(produto)}
                />
              );
            })
        )}
      </main>

      <PDVBarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
      />
    </div>
  );
}
