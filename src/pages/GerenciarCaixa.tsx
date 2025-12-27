import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowLeft, Play, StopCircle, History, DollarSign } from 'lucide-react';
import { api } from '../services/api';

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

  // 1. Carregar status do caixa
  async function fetchCaixaStatus() {
    try {
      const response = await api.get('/caixas');
      // No backend Marco 8, listarHistorico retorna um array. 
      // Pegamos o primeiro se ele estiver com status 'ABERTO'
      const ultimoCaixa = response.data.data[0];
      if (ultimoCaixa?.status === 'ABERTO') {
        setCaixaAtivo(ultimoCaixa);
      } else {
        setCaixaAtivo(null);
      }
    } catch (error) {
      console.error("Erro ao buscar status do caixa");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCaixaStatus(); }, []);

  // 2. Abrir Caixa
  async function handleAbrirCaixa(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await api.post('/caixas/abrir', {
        valorInicial: Number(valorInicial)
      });
      setCaixaAtivo(response.data.data);
      alert("Caixa aberto com sucesso!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao abrir caixa");
    }
  }

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Mobile-Friendly */}
      <header className="bg-white border-b px-4 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-[#1A2B3C]" />
        </button>
        <h1 className="text-lg font-bold text-[#1A2B3C]">Gerenciar Caixa</h1>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {!caixaAtivo ? (
          /* ESTADO: CAIXA FECHADO */
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-4 text-center">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#1A2B3C] mb-2">Caixa Fechado</h2>
            <p className="text-gray-500 text-sm mb-8">Informe o valor de fundo de caixa (troco) para iniciar as vendas de hoje.</p>

            <form onSubmit={handleAbrirCaixa} className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 ml-1">Valor Inicial (R$)</label>
                <input 
                  type="number"
                  inputMode="decimal" // Melhora o teclado no mobile
                  required
                  placeholder="0,00"
                  className="w-full text-2xl font-bold p-4 bg-[#F8FAFC] border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none transition-all"
                  value={valorInicial}
                  onChange={e => setValorInicial(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#2D6A4F] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-100 active:scale-95 transition-all"
              >
                <Play size={20} /> Abrir Caixa Agora
              </button>
            </form>
          </div>
        ) : (
          /* ESTADO: CAIXA ABERTO */
          <div className="space-y-4 mt-4">
            <div className="bg-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-100">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Em Operação</span>
                <span className="text-xs opacity-80">{new Date(caixaAtivo.abertoEm).toLocaleDateString()}</span>
              </div>
              <p className="text-sm opacity-90 mb-1">Fundo de Caixa Inicial</p>
              <h2 className="text-3xl font-black">R$ {Number(caixaAtivo.valorInicial).toFixed(2)}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/pdv')}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 active:bg-gray-50"
              >
                <DollarSign className="text-green-600" />
                <span className="font-bold text-[#1A2B3C]">Nova Venda</span>
              </button>
              <button 
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 opacity-50 cursor-not-allowed"
              >
                <History className="text-blue-600" />
                <span className="font-bold text-[#1A2B3C]">Histórico</span>
              </button>
            </div>

            <button 
              className="w-full mt-8 flex items-center justify-center gap-2 text-red-500 font-bold p-4 rounded-xl border-2 border-red-50 text-sm hover:bg-red-50 transition-colors"
            >
              <StopCircle size={20} /> Encerrar Turno / Fechar Caixa
            </button>
          </div>
        )}
      </main>
    </div>
  );
}