import { useState } from 'react';
import { X, Lock, Calculator, TrendingUp, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface ResumoFechamento {
  caixa: any;
  resumo: {
    DINHEIRO: number;
    PIX: number;
    DEBITO: number;
    CREDITO: number;
    totalVendas: number;
  };
}

export function ModalFecharCaixa({ caixaId, onSucesso, onClose }: any) {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {!resultado ? (
          <div className="p-8 text-center">
            <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Fechar Expediente?</h2>
            <p className="text-gray-500 mt-2">Isso encerrará todas as atividades deste caixa e consolidará os valores vendidos.</p>
            
            <div className="mt-8 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-500">Cancelar</button>
              <button 
                onClick={confirmarFechamento}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {loading ? "Fechando..." : <Lock size={18} />}
                {loading ? "" : "Confirmar Fechamento"}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gray-900 p-6 text-white text-center">
              <Calculator className="mx-auto mb-2 opacity-50" />
              <h2 className="text-xl font-bold">Relatório de Fechamento</h2>
              <p className="text-xs opacity-60">Caixa encerrado com sucesso</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ResumoCard label="Dinheiro" value={resultado.resumo.DINHEIRO} color="text-green-600" />
                <ResumoCard label="PIX" value={resultado.resumo.PIX} color="text-blue-600" />
                <ResumoCard label="Débito" value={resultado.resumo.DEBITO} color="text-purple-600" />
                <ResumoCard label="Crédito" value={resultado.resumo.CREDITO} color="text-orange-600" />
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total em Vendas</span>
                  <span className="font-bold">R$ {resultado.resumo.totalVendas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t font-black text-lg">
                  <span className="text-gray-800">Saldo na Gaveta</span>
                  <span className="text-green-600 underline">R$ {resultado.caixa.valorFinal.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-gray-400 text-center italic mt-2">
                  (Valor Inicial + Vendas em Dinheiro)
                </p>
              </div>

              <button 
                onClick={() => { onSucesso(); onClose(); }}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg mt-4"
              >
                Concluir e Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResumoCard({ label, value, color }: any) {
  return (
    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
      <p className="text-[10px] uppercase font-bold text-gray-400">{label}</p>
      <p className={`text-sm font-black ${color}`}>R$ {value.toFixed(2)}</p>
    </div>
  );
}