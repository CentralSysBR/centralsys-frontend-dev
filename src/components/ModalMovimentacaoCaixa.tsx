import { useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface ModalMovimentacaoProps {
  isOpen: boolean;
  onClose: () => void;
  caixaId: string; // Deve ser o UUID do caixa aberto
  onSucesso: () => void;
}

export function ModalMovimentacaoCaixa({ isOpen, onClose, caixaId, onSucesso }: ModalMovimentacaoProps) {
  // Ajustado para 'SAIDA' conforme exigido pelo seu backend
  const [tipo, setTipo] = useState<'REFORCO' | 'SAIDA'>('REFORCO');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  if (!isOpen) return null;

  async function handleConfirmar() {
    setErro('');
    
    // Converte vírgula em ponto para garantir que o JS entenda como número
    const valorNum = parseFloat(valor.replace(',', '.'));

    // Validações básicas no front antes de enviar
    if (isNaN(valorNum) || valorNum <= 0) {
      setErro('Insira um valor válido maior que zero.');
      return;
    }

    if (descricao.trim().length < 3) {
      setErro('A descrição deve ter pelo menos 3 caracteres.');
      return;
    }

    if (!caixaId) {
      setErro('ID do caixa não identificado. Recarregue a página.');
      return;
    }

    try {
      setLoading(true);
      
      // Enviando exatamente o que o Zod do seu backend espera
      await api.post('/caixas/movimentacao', {
        caixaId: String(caixaId), // Garante que é string (UUID)
        tipo: tipo,              // 'SAIDA' ou 'REFORCO'
        valor: valorNum,
        descricao: descricao.trim()
      });

      onSucesso();
      onClose();
      // Limpa os campos para a próxima abertura
      setValor('');
      setDescricao('');
    } catch (err: any) {
      console.error("Erro na movimentação:", err.response?.data);
      
      // Tenta pegar a mensagem de erro específica do Zod ou do AppError
      const msg = err.response?.data?.message || 'Erro de validação nos dados.';
      const detalhes = err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : '';
      
      setErro(`${msg} ${detalhes}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-black text-[#1A2B3C] uppercase tracking-tight flex items-center gap-2">
            {tipo === 'REFORCO' ? <ArrowUpCircle className="text-green-500" /> : <ArrowDownCircle className="text-red-500" />}
            Movimentar Caixa
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Seletor de Tipo */}
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => setTipo('REFORCO')}
              className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all ${tipo === 'REFORCO' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
            >
              Reforço (+)
            </button>
            <button
              onClick={() => setTipo('SAIDA')}
              className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all ${tipo === 'SAIDA' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
            >
              Sangria (-)
            </button>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-2xl font-black text-[#1A2B3C] focus:border-blue-500 outline-none transition-all"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Motivo / Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-medium text-gray-700 focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="Ex: Troco inicial ou Pagamento de fornecedor..."
            />
          </div>

          {erro && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-[10px] font-bold border border-red-100">
              <AlertCircle size={18} className="shrink-0" /> 
              <span>{erro}</span>
            </div>
          )}

          <button
            onClick={handleConfirmar}
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-white shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${tipo === 'REFORCO' ? 'bg-green-600 shadow-green-100' : 'bg-red-600 shadow-red-100'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'CONFIRMAR OPERAÇÃO'}
          </button>
        </div>
      </div>
    </div>
  );
}