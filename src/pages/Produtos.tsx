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

  const [codigoLido, setCodigoLido] = useState<string | null>(null);

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

    scanner.render((decodedText) => {
      setCodigoLido(decodedText);
      scanner?.clear();
      setIsScannerOpen(false);
    }, () => {});
  }

  return () => {
    scanner?.clear();
  };
}, [isScannerOpen]);


  // Barcode scanner
async function handleBarcodeScanned(code: string) {
  // 1. Produto já existe no estoque
  const existente = produtos.find(p => p.codigoBarras === code);
  if (existente) {
    abrirEntrada(existente);
    return;
  }

  // 2. Reset do formulário antes de preencher
  let novoForm = {
    nome: '',
    categoria: 'Geral',
    codigoBarras: code,
    precoVenda: 0,
    precoCusto: 0,
    quantidadeEstoque: 0
  };

  // 3. Busca no backend via GTIN
  try {
    const response = await api.get(`/produtos/gtin/${code}`);
    const data = response.data?.data;

    if (data) {
      novoForm = {
        ...novoForm,
        nome: data.nome || '',
        categoria: data.categoria || 'Geral'
      };
    }
  } catch (error) {
    // GTIN não encontrado → segue manual
  }

  // 4. Atualiza estado UMA ÚNICA VEZ
  setFormNovo(novoForm);

  // 5. Abre o modal depois do estado pronto
  setIsModalNovoOpen(true);
}

  useEffect(() => {
  if (!codigoLido) return;

  async function processarCodigo() {
    // Produto já existente
    const existente = produtos.find(p => p.codigoBarras === codigoLido);
    if (existente) {
      abrirEntrada(existente);
      setCodigoLido(null);
      return;
    }

    let novoForm = {
      nome: '',
      categoria: 'Geral',
      codigoBarras: codigoLido,
      precoVenda: 0,
      precoCusto: 0,
      quantidadeEstoque: 0
    };

    try {
      const response = await api.get(`/produtos/gtin/${codigoLido}`);
      const data = response.data?.data;

      if (data) {
        novoForm = {
          ...novoForm,
          nome: data.nome || '',
          categoria: data.categoria || 'Geral'
        };
      }
    } catch {
      // GTIN não encontrado → segue manual
    }

    setFormNovo(novoForm);
    setIsModalNovoOpen(true);
    setCodigoLido(null);
  }

  processarCodigo();
}, [codigoLido, produtos]);

  // Calculadora de Custo Unitário
  useEffect(() => {
    if (modoCusto === 'lote' && qtdLote > 0) {
      setFormNovo(prev => ({ ...prev, precoCusto: valorLote / qtdLote }));
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
    return normalizarTexto(p.nome).includes(termo) ||
      (p.codigoBarras && p.codigoBarras.includes(busca));
  });

  const podeSalvarEntrada =
    produtoSelecionado &&
    (qtdEntrada > 0 || novoPrecoVenda !== Number(produtoSelecionado.precoVenda));

  return (
<div className="min-h-screen bg-[#F8FAFC] pb-20">

      <header className="bg-white border-b sticky top-0 z-30 px-4 py-4 shadow-sm">

        <div className="flex items-center justify-between mb-4 max-w-4xl mx-auto">

          <div className="flex items-center gap-3">

            <button onClick={() => navigate('/dashboard')} className="p-1"><ArrowLeft size={24} className="text-[#1A2B3C]" /></button>

            <h1 className="text-xl font-bold text-[#1A2B3C]">Estoque</h1>

          </div>

          <div className="flex gap-2">

            <button onClick={() => setIsScannerOpen(true)} className="p-2 bg-blue-50 text-blue-600 rounded-xl active:scale-95 transition-all">

              <Camera size={24} />

            </button>

            <button onClick={() => setIsModalNovoOpen(true)} className="p-2 bg-[#1A2B3C] text-white rounded-xl active:scale-95 transition-all">

              <Plus size={24} />

            </button>

          </div>

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

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${produto.quantidadeEstoque <= 5 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>

                      ESTOQUE: {produto.quantidadeEstoque}

                    </span>

                  </div>

                </div>

                <div className="text-right text-[#1A2B3C]">

                  <p className="font-black">R$ {Number(produto.precoVenda).toFixed(2)}</p>

                  <p className="text-[10px] text-blue-600 font-bold uppercase">Ajustar</p>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>



      {/* SCANNER MODAL */}

      {isScannerOpen && (

        <div className="fixed inset-0 bg-black z-[100] flex flex-col">

          <div className="p-6 flex justify-between items-center text-white">

            <h2 className="font-bold text-lg">Escanear Código</h2>

            <button onClick={() => setIsScannerOpen(false)} className="p-2 bg-white/10 rounded-full"><X size={28}/></button>

          </div>

          <div className="flex-1 flex items-center justify-center p-4">

            <div id="reader" className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"></div>

          </div>

        </div>

      )}



      {/* MODAL NOVO PRODUTO */}

      {isModalNovoOpen && (

        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">

          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">

            <div className="flex justify-between items-center">

              <h2 className="text-xl font-bold text-[#1A2B3C]">Cadastrar Produto</h2>

              <button onClick={() => setIsModalNovoOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>

            </div>



            <div className="space-y-4">

              <div className="space-y-1">

                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Identificação</label>

                <input 

                  placeholder="Nome do Produto" 

                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-[#1A2B3C] transition-all"

                  value={formNovo.nome}

                  onChange={e => setFormNovo({...formNovo, nome: e.target.value})}

                />

                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">

                  <Barcode size={20} className="text-gray-400"/>

                  <input 

                    placeholder="Código de Barras" 

                    className="bg-transparent outline-none flex-1 text-sm font-mono"

                    value={formNovo.codigoBarras}

                    onChange={e => setFormNovo({...formNovo, codigoBarras: e.target.value})}

                  />

                </div>

              </div>



              <div className="space-y-2">

                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Custo Unitário</label>

                <div className="flex gap-1 p-1.5 bg-gray-100 rounded-2xl">

                  <button onClick={() => setModoCusto('unitario')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${modoCusto === 'unitario' ? 'bg-white text-[#1A2B3C] shadow-sm' : 'text-gray-500'}`}>Por Unidade</button>

                  <button onClick={() => setModoCusto('lote')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${modoCusto === 'lote' ? 'bg-white text-[#1A2B3C] shadow-sm' : 'text-gray-500'}`}>Por Lote</button>

                </div>



                {modoCusto === 'lote' ? (

                  <div className="grid grid-cols-2 gap-3">

                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">

                      <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Valor Total</p>

                      <input type="number" className="bg-transparent w-full font-bold outline-none" value={valorLote || ''} onChange={e => setValorLote(Number(e.target.value))} />

                    </div>

                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">

                      <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Qtd no Lote</p>

                      <input type="number" className="bg-transparent w-full font-bold outline-none" value={qtdLote || ''} onChange={e => setQtdLote(Number(e.target.value))} />

                    </div>

                  </div>

                ) : (

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">

                    <input type="number" placeholder="0,00" className="bg-transparent w-full font-bold outline-none" value={formNovo.precoCusto || ''} onChange={e => setFormNovo({...formNovo, precoCusto: Number(e.target.value)})} />

                  </div>

                )}

                <div className="flex justify-between px-2 text-[11px]">

                  <span className="text-gray-400 italic">Custo por unidade:</span>

                  <span className="font-bold text-blue-600">R$ {formNovo.precoCusto.toFixed(2)}</span>

                </div>

              </div>



              <div className="grid grid-cols-2 gap-4">

                <div className="space-y-1">

                  <label className="text-[10px] font-bold text-green-600 uppercase ml-2">Venda (R$)</label>

                  <input type="number" className="w-full p-4 bg-green-50 rounded-2xl outline-none border border-green-100 font-black text-green-700" value={formNovo.precoVenda || ''} onChange={e => setFormNovo({...formNovo, precoVenda: Number(e.target.value)})} />

                </div>

                <div className="space-y-1">

                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Estoque Inicial</label>

                  <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-gray-100 font-bold" value={formNovo.quantidadeEstoque || ''} onChange={e => setFormNovo({...formNovo, quantidadeEstoque: Number(e.target.value)})} />

                </div>

              </div>

            </div>



            <button onClick={salvarNovoProduto} disabled={isSalvando} className="w-full bg-[#1A2B3C] text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">

              {isSalvando ? <Loader2 className="animate-spin" /> : <Save size={20}/>}

              Finalizar Cadastro

            </button>

          </div>

        </div>

      )}



      {/* MODAL AJUSTE/ENTRADA (Mantenha conforme sua lógica anterior) */}

      {isModalEntradaOpen && produtoSelecionado && (

        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">

          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 p-6 space-y-6">

            <div className="flex justify-between items-center">

              <h2 className="font-bold text-lg text-[#1A2B3C]">Ajuste de Produto</h2>

              <button onClick={() => setIsModalEntradaOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>

            </div>

            

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">

              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Produto</p>

              <p className="font-bold text-[#1A2B3C]">{produtoSelecionado.nome}</p>

            </div>



            <div className="grid grid-cols-2 gap-4">

              <div className="bg-gray-50 p-4 rounded-2xl text-center">

                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Atual</p>

                <p className="text-2xl font-black text-gray-300">{produtoSelecionado.quantidadeEstoque}</p>

              </div>

              <div className="bg-green-50 p-4 rounded-2xl text-center border-2 border-green-500">

                <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Entrada (+)</p>

                <input type="number" autoFocus className="w-full bg-transparent text-center text-3xl font-black text-green-700 outline-none" value={qtdEntrada || ''} onChange={(e) => setQtdEntrada(Math.max(0, Number(e.target.value)))} />

              </div>

            </div>



            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">

              <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">Novo Preço de Venda (R$)</p>

              <input type="number" step="0.01" className="w-full bg-transparent text-xl font-bold text-[#1A2B3C] outline-none" value={novoPrecoVenda} onChange={(e) => setNovoPrecoVenda(Number(e.target.value))} />

            </div>



            <button onClick={confirmarEntrada} disabled={isSalvando || !podeSalvarEntrada} className="w-full bg-[#1A2B3C] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-30">

              {isSalvando ? <Loader2 className="animate-spin" /> : <Save size={20} />}

              Confirmar Alterações

            </button>

          </div>

        </div>

      )}

    </div>
  );
}
