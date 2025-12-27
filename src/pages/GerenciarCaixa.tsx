import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowLeft, Play, StopCircle, History, DollarSign, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { ModalFecharCaixa } from '../components/ModalFecharCaixa';

interface Caixa {
  id: string;
  status: 'ABERTO' | 'FECHADO';
  valorInicial: number;
  abertoEm: string;
}

export default function GerenciarCaixa() {
  const navigate = useNavigate();
  const [caixaAtivo, setCaixaAtivo] = useState<Caixa | null>(null);
  const [loading, setLoading] = useState(true);
  const [valorInicial, setValorInicial] = useState('');
  const [isModalFecharOpen, setIsModalFecharOpen] = useState(false);
  const [isFinalizando, setIsFinalizando] = useState(false);

  async function fetchCaixaStatus() {
    try {
      setLoading(true);
      const response = await api.get('/caixas');
      const caixas = response.data.data || [];
      const caixaAberto = caixas.find((c: Caixa) => c.status === 'ABERTO');
      setCaixaAtivo(caixaAberto || null);
    } catch (error) {
      console.error("Erro ao buscar status do caixa:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCaixaStatus(); }, []);

  async function handleAbrirCaixa(e: React.FormEvent) {
    e.preventDefault();
    if (isFinalizando || !valorInicial) return;
    try {
      setIsFinalizando(true);
      const response = await api.post('/caixas/abrir', {
        valorInicial: Number(valorInicial)
      });
      setCaixaAtivo(response.data.data);
      setValorInicial('');
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao abrir caixa");
    } finally {
      setIsFinalizando(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-[#1A2B3C] mb-2" size={32} />
        <p className="text-gray-500 font-medium">Sincronizando caixa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full">
          <ArrowLeft size={24} className="text-[#1A2B3C]" />
        </button>
        <h1 className="text-lg font-bold text-[#1A2B3C]">Gerenciar Caixa</h1>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {!caixaAtivo ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-4 text-center">
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Calculator size={40} />
            </div>
            <h2 className="text-2xl font-black text-[#1A2B3C] mb-2">Caixa Fechado</h2>
            <form onSubmit={handleAbrirCaixa} className="space-y-4 mt-6">
              <input 
                type="number"
                required
                placeholder="Valor Inicial R$"
                className="w-full text-2xl font-black p-5 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none"
                value={valorInicial}
                onChange={e => setValorInicial(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isFinalizando || !valorInicial}
                className="w-full bg-[#2D6A4F] text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isFinalizando ? <Loader2 className="animate-spin" /> : <Play size={22} />}
                Abrir Caixa
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="bg-[#1A2B3C] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase">Status: Aberto</span>
                    <p className="text-xs opacity-50 mt-4 mb-1 font-bold uppercase">Saldo Inicial</p>
                    <h2 className="text-5xl font-black italic">R$ {Number(caixaAtivo.valorInicial).toFixed(2)}</h2>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => navigate('/pdv')} className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center gap-3">
                <div className="bg-green-50 p-4 rounded-2xl text-green-600"><DollarSign size={32} /></div>
                <span className="font-black text-sm uppercase">Vender</span>
              </button>
              <button onClick={() => navigate('/historico-vendas')} className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center gap-3">
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><History size={32} /></div>
                <span className="font-black text-sm uppercase">Histórico</span>
              </button>
            </div>

            <button 
              onClick={() => setIsModalFecharOpen(true)}
              className="w-full mt-6 flex items-center justify-center gap-2 text-gray-400 font-bold p-5 rounded-2xl border-2 border-dashed border-gray-200 text-xs hover:text-red-500 transition-all"
            >
              <StopCircle size={18} /> Encerrar Turno e Fechar Caixa
            </button>
          </div>
        )}
      </main>

      {isModalFecharOpen && caixaAtivo && (
        <ModalFecharCaixa 
          caixaId={caixaAtivo.id}
          onSucesso={() => setCaixaAtivo(null)}
          onClose={() => setIsModalFecharOpen(false)}
        />
      )}
    </div>
  );
}