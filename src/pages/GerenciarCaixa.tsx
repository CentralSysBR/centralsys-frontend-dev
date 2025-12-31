import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowLeft, Play, StopCircle, DollarSign, Loader2, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { api } from '../services/api';
import { ModalFecharCaixa } from '../components/ModalFecharCaixa';
import { ModalMovimentacaoCaixa } from '../components/ModalMovimentacaoCaixa';
import { formatCurrencyBR } from '../utils/formatCurrencyBR';
interface Caixa {
  id: string;
  status: 'ABERTO' | 'FECHADO';
  valorInicial: number;
  valorAtual?: number; 
  abertoEm: string;
}

export default function GerenciarCaixa() {
  const navigate = useNavigate();
  const [CaixaAberto, setCaixaAberto] = useState<Caixa | null>(null);
  const [loading, setLoading] = useState(true);
  const [valorInicial, setValorInicial] = useState('');
  const [isModalFecharOpen, setIsModalFecharOpen] = useState(false);
  const [isModalMovimentarOpen, setIsModalMovimentarOpen] = useState(false);
  const [isFinalizando, setIsFinalizando] = useState(false);

  useEffect(() => {
    fetchCaixaStatus();
  }, []);

  async function fetchCaixaStatus() {
    try {
      setLoading(true);
      const response = await api.get('/caixas/aberto');
      setCaixaAberto(response.data.data || null);
    } catch (error) {
      console.error("Erro ao buscar status do caixa:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAbrirCaixa() {
    const valor = parseFloat(valorInicial);
    if (isNaN(valor) || valor < 0) {
      alert("Informe um valor inicial válido.");
      return;
    }

    try {
      setIsFinalizando(true);
      await api.post('/caixas/abrir', { valorInicial: valor });
      await fetchCaixaStatus();
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao abrir caixa");
    } finally {
      setIsFinalizando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-1">
            <ArrowLeft size={24} className="text-[#1A2B3C]" />
          </button>
          <h1 className="text-xl font-bold text-[#1A2B3C]">Gestão de Caixa</h1>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold">Sincronizando caixa...</p>
          </div>
        ) : !CaixaAberto ? (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 text-center space-y-6">
            <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center text-blue-600 mx-auto">
              <Calculator size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1A2B3C]">Caixa Fechado</h2>
              <p className="text-gray-400 font-medium">Inicie o turno para começar a vender</p>
            </div>
            
            <div className="max-w-xs mx-auto">
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Fundo de Gaveta (R$)</label>
              <input 
                type="number"
                placeholder="0.00"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-center text-2xl font-black text-[#1A2B3C] outline-none focus:border-blue-500 transition-all"
                value={valorInicial}
                onChange={(e) => setValorInicial(e.target.value)}
              />
            </div>

            <button 
              onClick={handleAbrirCaixa}
              disabled={isFinalizando}
              className="w-full bg-[#1A2B3C] text-white py-5 rounded-2xl font-bold shadow-xl shadow-gray-200 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Play size={20} fill="currentColor" /> Abrir Caixa Agora
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#1A2B3C] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest">Turno em Andamento</p>
                </div>
                
                <p className="text-white/50 text-[10px] font-black uppercase mb-1">Saldo Atual em Dinheiro</p>
                <h2 className="text-5xl font-black mb-4 tracking-tighter">
                    {formatCurrencyBR(CaixaAberto.valorAtual ?? CaixaAberto.valorInicial)}
                </h2>

                <div className="flex items-center gap-2 text-white/40">
                    <Wallet size={14} />
                    <p className="text-[11px] font-bold uppercase">
                        Fundo Inicial: <span className="text-white/70">{formatCurrencyBR(CaixaAberto.valorInicial)}</span>
                    </p>
                </div>
              </div>
              <Calculator className="absolute -right-6 -bottom-6 text-white/5 w-40 h-40" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => navigate('/pdv')} className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all">
                <div className="bg-green-50 p-4 rounded-2xl text-green-600"><DollarSign size={32} /></div>
                <span className="font-black text-sm uppercase text-[#1A2B3C]">Vender</span>
              </button>
              
              <button onClick={() => setIsModalMovimentarOpen(true)} className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all">
                <div className="bg-orange-50 p-4 rounded-2xl text-orange-600 flex gap-1">
                    <ArrowUpCircle size={20} />
                    <ArrowDownCircle size={20} />
                </div>
                <span className="font-black text-sm uppercase text-[#1A2B3C]">Sangria/Reforço</span>
              </button>
            </div>

            <button 
              onClick={() => setIsModalFecharOpen(true)}
              className="w-full mt-6 flex items-center justify-center gap-2 text-gray-400 font-bold p-5 rounded-2xl border-2 border-dashed border-gray-200 text-xs hover:text-red-500 hover:border-red-200 transition-all"
            >
              <StopCircle size={18} /> Encerrar Turno e Fechar Caixa
            </button>
          </div>
        )}
      </main>

      {isModalFecharOpen && CaixaAberto && (
        <ModalFecharCaixa 
          caixaId={CaixaAberto.id} 
          onClose={() => setIsModalFecharOpen(false)} 
        />
      )}

      {isModalMovimentarOpen && CaixaAberto && (
        <ModalMovimentacaoCaixa 
          isOpen={isModalMovimentarOpen}
          caixaId={CaixaAberto.id}
          onClose={() => setIsModalMovimentarOpen(false)}
          onSucesso={fetchCaixaStatus}
        />
      )}
    </div>
  );
}