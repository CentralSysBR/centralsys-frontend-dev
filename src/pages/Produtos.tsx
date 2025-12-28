import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Plus,
  Package,
  Loader2,
  Barcode,
  X,
  Save,
  Camera
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
  imagemUrl?: string;
}

interface ProdutoGTINResponse {
  nome: string;
  marca?: string;
  categoria?: string;
  codigoBarras: string;
  imagemUrl?: string;
  unidadeVenda?: string;
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

  // Estados de operação
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [isSalvando, setIsSalvando] = useState(false);

  // Novo produto
  const [modoCusto, setModoCusto] = useState<'unitario' | 'lote'>('unitario');
  const [valorLote, setValorLote] = useState(0);
  const [qtdLote, setQtdLote] = useState(1);

  const [formNovo, setFormNovo] = useState({
    nome: '',
    categoria: 'Geral',
    codigoBarras: '',
    imagemUrl: '',
    precoVenda: 0,
    precoCusto: 0,
    quantidadeEstoque: 0
  });

  // Entrada / ajuste
  const [qtdEntrada, setQtdEntrada] = useState(0);
  const [novoPrecoVenda, setNovoPrecoVenda] = useState(0);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      setLoading(true);
      const response = await api.get('/produtos');
      setProdutos(response.data.data.produtos || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  }

  // Scanner
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScannerOpen) {
      scanner = new Html5QrcodeScanner(
        'reader',
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

  async function handleBarcodeScanned(codigo: string) {
    const existente = produtos.find(p => p.codigoBarras === codigo);
    if (existente) {
      abrirEntrada(existente);
      return;
    }

    try {
      const response = await api.get(`/produtos/gtin/${codigo}`);
      const gtin: ProdutoGTINResponse | undefined = response.data?.data;

      if (gtin) {
        setFormNovo({
          nome: gtin.nome ?? '',
          categoria: gtin.categoria ?? 'Geral',
          codigoBarras: gtin.codigoBarras ?? codigo,
          imagemUrl: gtin.imagemUrl ?? '',
          precoVenda: 0,
          precoCusto: 0,
          quantidadeEstoque: 0
        });
      } else {
        setFormNovo(prev => ({
          ...prev,
          codigoBarras: codigo
        }));
      }

      setIsModalNovoOpen(true);
    } catch {
      setFormNovo(prev => ({
        ...prev,
        codigoBarras: codigo
      }));
      setIsModalNovoOpen(true);
    }
  }

  // Calculadora custo por lote
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
        quantidadeAdicionada: qtdEntrada,
        novoPrecoVenda
      });
      setIsModalEntradaOpen(false);
      await carregarProdutos();
    } catch {
      alert('Erro ao atualizar estoque.');
    } finally {
      setIsSalvando(false);
    }
  }

  async function salvarNovoProduto() {
    if (!formNovo.nome || formNovo.precoVenda <= 0) {
      alert('Nome e Preço de Venda são obrigatórios.');
      return;
    }

    try {
      setIsSalvando(true);
      await api.post('/produtos', formNovo);
      setIsModalNovoOpen(false);
      await carregarProdutos();
    } catch {
      alert('Erro ao cadastrar produto.');
    } finally {
      setIsSalvando(false);
    }
  }

  const normalizarTexto = (txt: string) =>
    txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

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
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-1">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">Estoque</h1>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setIsScannerOpen(true)} className="p-2 bg-blue-50 rounded-xl">
              <Camera size={24} />
            </button>
            <button onClick={() => setIsModalNovoOpen(true)} className="p-2 bg-[#1A2B3C] text-white rounded-xl">
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            placeholder="Buscar por nome ou código..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
      </header>

      {/* LISTAGEM */}
      <main className="p-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {produtosFiltrados.map(produto => (
              <div
                key={produto.id}
                onClick={() => abrirEntrada(produto)}
                className="bg-white p-4 rounded-2xl flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    {produto.imagemUrl ? (
                      <img src={produto.imagemUrl} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold">{produto.nome}</h3>
                    <span className="text-xs text-gray-500">
                      Estoque: {produto.quantidadeEstoque}
                    </span>
                  </div>
                </div>

                <div className="font-bold">
                  R$ {produto.precoVenda.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Scanner */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black z-50">
          <div id="reader" className="w-full h-full" />
        </div>
      )}

      {/* Modal Novo Produto */}
      {isModalNovoOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4">
            <h2 className="text-xl font-bold">Cadastrar Produto</h2>

            {formNovo.imagemUrl && (
              <img
                src={formNovo.imagemUrl}
                className="w-32 h-32 mx-auto rounded-xl object-cover"
              />
            )}

            <input
              placeholder="Nome do Produto"
              className="w-full p-3 bg-gray-50 rounded-xl"
              value={formNovo.nome}
              onChange={e => setFormNovo({ ...formNovo, nome: e.target.value })}
            />

            <input
              placeholder="Código de Barras"
              className="w-full p-3 bg-gray-50 rounded-xl"
              value={formNovo.codigoBarras}
              onChange={e => setFormNovo({ ...formNovo, codigoBarras: e.target.value })}
            />

            <button
              onClick={salvarNovoProduto}
              disabled={isSalvando}
              className="w-full bg-[#1A2B3C] text-white py-4 rounded-xl"
            >
              {isSalvando ? <Loader2 className="animate-spin" /> : 'Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
