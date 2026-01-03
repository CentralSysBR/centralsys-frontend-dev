import { useState } from 'react';
import { Lock, ArrowDownCircle, ArrowUpCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { formatCurrencyBR } from '../utils/formatCurrencyBR';


interface ResumoFechamento {
  caixa: {
    valorInicialCentavos: number;
    valorFinalCentavos: number;
  };
  resumo: {
    DINHEIRO: number;
    PIX: number;
    DEBITO: number;
    CREDITO: number;
    SANGRIAS: number; // Ajustado para bater com o backend (plural)
    REFORCOS: number; // Ajustado para bater com o backend (plural)
    totalVendas: number;
  };
}

interface ModalFecharCaixaProps {
  caixaId: string;
  onClose: () => void;
  onSucesso?: () => void;
}

export function ModalFecharCaixa({ caixaId, onClose, onSucesso }: ModalFecharCaixaProps) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResumoFechamento | null>(null);

  async function confirmarFechamento() {
    try {
      setLoading(true);
      const res = await api.post('/caixas/fechar', { caixaId });
      setResultado(res.data.data);
      if (onSucesso) onSucesso();
    } catch (err) {
      console.error(err);
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
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-[#1A2B3C]">Encerrar Turno?</h2>
              <p className="text-gray-500 text-sm">O sistema irá calcular todas as vendas e movimentações para gerar o saldo final.</p>
            </div>

            <button
              onClick={confirmarFechamento}
              disabled={loading}
              className="w-full bg-[#1A2B3C] text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sim, Fechar Agora"}
            </button>
            <button onClick={onClose} className="text-gray-400 font-bold hover:text-gray-600 transition-colors">Cancelar e Voltar</button>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-2xl font-black text-[#1A2B3C]">Caixa Conferido</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ResumoCard label="Dinheiro" value={resultado.resumo.DINHEIRO} color="text-green-600" />
              <ResumoCard label="PIX" value={resultado.resumo.PIX} color="text-blue-600" />
              <ResumoCard label="Débito" value={resultado.resumo.DEBITO} color="text-purple-600" />
              <ResumoCard label="Crédito" value={resultado.resumo.CREDITO} color="text-orange-600" />
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border flex justify-between">
              <div className="flex items-center gap-2 text-red-500 font-bold text-[10px]">
                <ArrowDownCircle size={14} /> SANGRIAS: {formatCurrencyBR(resultado.resumo.SANGRIAS)}
              </div>
              <div className="flex items-center gap-2 text-green-500 font-bold text-[10px]">
                <ArrowUpCircle size={14} /> REFORÇOS: REFORÇOS: {formatCurrencyBR(resultado.resumo.REFORCOS)}
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-[32px] text-center shadow-xl">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Saldo Final Esperado</p>
              <p className="text-white text-4xl font-black">{formatCurrencyBR(resultado.caixa.valorFinalCentavos)}</p>
            </div>

            <button
              onClick={() => window.location.replace('/dashboard')}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all"
            >
              Concluir e Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResumoCard({ label, value, color }: any) {
  return (
    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{label}</p>
      <p className={`text-lg font-black ${color}`}>
        {formatCurrencyBR(value)}
      </p>
    </div>
  );
}