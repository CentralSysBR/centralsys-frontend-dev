import { useState } from 'react';
import { Lock, Calculator, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { api } from '../services/api';

interface ResumoFechamento {
  caixa: {
    valorInicial: number;
    valorFinal: number;
  };
  resumo: {
    DINHEIRO: number;
    PIX: number;
    DEBITO: number;
    CREDITO: number;
    SANGRIA: number;
    REFORCO: number;
    totalVendas: number;
  };
}

export function ModalFecharCaixa({ caixaId, onClose }: { caixaId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResumoFechamento | null>(null);

  async function confirmarFechamento() {
    try {
      setLoading(true);
      const res = await api.post('/caixas/fechar', { caixaId });
      setResultado(res.data.data);
    } catch (err) {
      alert("Erro ao fechar caixa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-[#1A2B3C]/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
        {!resultado ? (
          <div className="p-8 text-center space-y-6">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center text-red-500 mx-auto">
              <Lock size={40} />
            </div>
            <h2 className="text-3xl font-black text-[#1A2B3C]">Encerrar Turno?</h2>
            <button 
              onClick={confirmarFechamento}
              disabled={loading}
              className="w-full bg-[#1A2B3C] text-white py-5 rounded-2xl font-bold text-lg"
            >
              {loading ? "Fechando..." : "Sim, Fechar Agora"}
            </button>
            <button onClick={onClose} className="text-gray-400 font-bold">Cancelar</button>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-[#1A2B3C]">Caixa Conferido</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ResumoCard label="Dinheiro" value={resultado.resumo.DINHEIRO} color="text-green-600" />
              <ResumoCard label="PIX" value={resultado.resumo.PIX} color="text-blue-600" />
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border flex justify-between">
              <div className="flex items-center gap-2 text-red-500 font-bold text-[10px]">
                <ArrowDownCircle size={14} /> SANGRIA: R$ {resultado.resumo.SANGRIA.toFixed(2)}
              </div>
              <div className="flex items-center gap-2 text-green-500 font-bold text-[10px]">
                <ArrowUpCircle size={14} /> REFORÇO: R$ {resultado.resumo.REFORCO.toFixed(2)}
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-[32px] text-center">
              <p className="text-white/40 text-[10px] font-black uppercase">Saldo Final na Gaveta</p>
              <p className="text-white text-4xl font-black">R$ {resultado.caixa.valorFinal.toFixed(2)}</p>
            </div>

            <button onClick={() => window.location.replace('/dashboard')} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">
              Concluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResumoCard({ label, value, color }: any) {
  return (
    <div className="bg-gray-50 p-4 rounded-2xl border">
      <p className="text-[10px] font-black text-gray-400 uppercase">{label}</p>
      <p className={`text-lg font-black ${color}`}>R$ {Number(value).toFixed(2)}</p>
    </div>
  );
}