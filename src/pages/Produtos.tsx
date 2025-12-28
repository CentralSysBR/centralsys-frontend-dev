import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Plus, Package, 
  Loader2, Barcode, X, Save, Camera
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
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

  // Modais
  const [isModalEntradaOpen, setIsModalEntradaOpen] = useState(false);
  const [isModalNovoOpen, setIsModalNovoOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Estados de Operação
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [isSalvando, setIsSalvando] = useState(false);

  // Calculadora de Custo e Novo Produto
  const [modoCusto, setModoCusto] = useState<'unitario' | 'lote'>('unitario');
  const [valorLote, setValorLote] = useState<number>(0);
  const [qtdLote, setQtdLote] = useState<number>(1);
  const [formNovo, setFormNovo] = useState({
    nome: '',
    categoria: 'Geral',
    codigoBarras: '',
    precoVenda: 0,
    precoCusto: 0,
    quantidadeEstoque: 0
  });

  // Estados de Entrada (Reposição)
  const [qtdEntrada, setQtdEntrada] = useState<number>(0);
  const [novoPrecoVenda, setNovoPrecoVenda] = useState<number>(0);

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

  // Lógica do Scanner
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (isScannerOpen) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scanner.render(
        (decodedText) => {
          handleBarcodeScanned(decodedText);
          scanner?.clear();
          setIsScannerOpen(false);
        },
        () => {}
      );
    }

    return () => {
      scanner?.clear();
    };
  }, [isScannerOpen]);

  async function handleBarcodeScanned(code: string) {
    const existente = produtos.find(p => p.codigoBarras === code);

    if (existente) {
      abrirEntrada(existente);
      return;
    }

    try {
      const response = await api.get(`/produtos/gtin/${code}`);

      if (response?.data?.data) {
        const produto = response.data.data;

        setFormNovo({
          nome: produto.nome || '',
          categoria: produto.categoria || 'Geral',
          codigoBarras: produto.codigoBarras || code,
          precoVenda: 0,
          precoCusto: 0,
          quantidadeEstoque: 0
        });
      } else {
        setFormNovo(prev => ({ ...prev, codigoBarras: code }));
      }
    } catch {
      setFormNovo(prev => ({ ...prev, codigoBarras: code }));
    }

    setIsModalNovoOpen(true);
  }

  // Calculadora de Custo Unitário
  useEffect(() => {
    if (modoCusto === 'lote' && qtdLote > 0) {
      setFormNovo(prev => ({
        ...prev,
        precoCusto: valorLote / qtdLote
      }));
    }
  }, [valorLote, qtdLote, modoCusto]);

  function abrirEntrada(produto: Produto) {
    setProdutoSelecionado(produto);
    setNovoPrecoVenda(Number(produto.precoVenda));
    setQtdEntrada(0);
    setIsModalEntradaOpen(true);
  }

  async function confirmarEntrada() {
    if (!produtoSelecionado) return;

    try {
      setIsSalvando(true);
      await api.patch(`/produtos/${produtoSelecionado.id}/estoque`, {
        quantidadeAdicionada: Number(qtdEntrada) || 0,
        novoPrecoVenda: Number(novoPrecoVenda)
      });
      setIsModalEntradaOpen(false);
      await carregarProdutos();
    } catch {
      alert("Erro ao atualizar estoque.");
    } finally {
      setIsSalvando(false);
    }
  }

  async function salvarNovoProduto() {
    if (!formNovo.nome || formNovo.precoVenda <= 0) {
      alert("Nome e Preço de Venda são obrigatórios.");
      return;
    }

    try {
      setIsSalvando(true);
      await api.post('/produtos', formNovo);
      setIsModalNovoOpen(false);
      await carregarProdutos();
    } catch {
      alert("Erro ao cadastrar produto.");
    } finally {
      setIsSalvando(false);
    }
  }

  const normalizarTexto = (txt: string) =>
    txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const produtosFiltrados = produtos.filter(p => {
    const termo = normalizarTexto(busca);
    return (
      normalizarTexto(p.nome).includes(termo) ||
      (p.codigoBarras && p.codigoBarras.includes(busca))
    );
  });

  const podeSalvarEntrada =
    produtoSelecionado &&
    (qtdEntrada > 0 ||
      novoPrecoVenda !== Number(produtoSelecionado.precoVenda));

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-1">
              <ArrowLeft size={24} className="text-[#1A2B3C]" />
            </button>
            <h1 className="text-xl font-bold text-[#1A2B3C]">Estoque</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="p-2 bg-blue-50 text-blue-600 rounded-xl active:scale-95 transition-all"
            >
              <Camera size={24} />
            </button>
            <button
              onClick={() => setIsModalNovoOpen(true)}
              className="p-2 bg-[#1A2B3C] text-white rounded-xl active:scale-95 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nome ou código..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-2 border-transparent focus:border-[#1A2B3C] focus:bg-white rounded-xl outline-none transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </header>

      {/* TODO O RESTO DO JSX SEGUE EXATAMENTE IGUAL AO SEU ARQUIVO ORIGINAL */}
      {/* LISTA, MODAIS, SCANNER, ENTRADA, CADASTRO — SEM NENHUMA ALTERAÇÃO */}

    </div>
  );
}
