import { useState, useEffect } from 'react';
import { X, CheckCircle2, DollarSign, CreditCard, QrCode, Loader2, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrencyBR } from '../utils/formatCurrency';

interface ItemCarrinho {
  id: string;
  nome: string;
  precoVenda: number;
  quantidade: number;
}

interface ModalFinalizarVendaProps {
  isOpen: boolean;
  onClose: () => void;
  carrinho: ItemCarrinho[];
  totalVenda: number;
  onConfirm: (metodo: string, valorRecebido?: number, troco?: number) => Promise<void>;
  isFinalizando: boolean;
}

export function ModalFinalizarVenda({ 
  isOpen, onClose, carrinho, totalVenda, onConfirm, isFinalizando 
}: ModalFinalizarVendaProps) {
  const [metodoPagamento, setMetodoPagamento] = useState<string | null>(null);
  const [valorRecebido, setValorRecebido] = useState<string>('');
  const [troco, setTroco] = useState(0);

  const CHAVE_PIX = "stdr@samuelss.dev";

  // Cálculo de troco em tempo real
  useEffect(() => {
    const recebido = parseFloat(valorRecebido) || 0;
    if (metodoPagamento === 'DINHEIRO' && recebido > totalVenda) {
      setTroco(recebido - totalVenda);
    } else {
      setTroco(0);
    }
  }, [valorRecebido, totalVenda, metodoPagamento]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-xl text-[#1A2B3C]">Finalizar Venda</h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
            <X size={20}/>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 no-scrollbar">
          {/* Itens e Total */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Resumo dos Itens</p>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
              {carrinho.map(item => (
                <div key={item.id} className="flex justify-between text-sm items-center bg-gray-50 p-3 rounded-xl">
                  <span className="text-gray-600 font-medium">{item.quantidade}x {item.nome}</span>
                  <span className="font-bold text-[#1A2B3C]">{formatCurrencyBR(item.precoVenda * item.quantidade)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-gray-100 text-green-600">
              <span className="font-bold text-gray-500 uppercase text-xs">Total a Pagar</span>
              <span className="font-black text-3xl font-mono">{formatCurrencyBR(totalVenda)}</span>
            </div>
          </div>

          {/* Formas de Pagamento */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Método de Pagamento</p>
            <div className="grid grid-cols-2 gap-2">
              <PaymentOption active={metodoPagamento === 'DINHEIRO'} onClick={() => setMetodoPagamento('DINHEIRO')} icon={<DollarSign size={20} />} label="Dinheiro" />
              <PaymentOption active={metodoPagamento === 'PIX'} onClick={() => setMetodoPagamento('PIX')} icon={<QrCode size={20} />} label="PIX" />
              <PaymentOption active={metodoPagamento === 'DEBITO'} onClick={() => setMetodoPagamento('DEBITO')} icon={<CreditCard size={20} />} label="Débito" />
              <PaymentOption active={metodoPagamento === 'CREDITO'} onClick={() => setMetodoPagamento('CREDITO')} icon={<CreditCard size={20} />} label="Crédito" />
            </div>
          </div>

          {/* Lógica Dinheiro / Troco */}
          {metodoPagamento === 'DINHEIRO' && (
            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Valor Recebido</label>
                  <input 
                    type="number"
                    value={valorRecebido}
                    onChange={(e) => setValorRecebido(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full p-3 bg-blue-50 border-2 border-blue-100 rounded-2xl outline-none focus:border-blue-400 font-black text-blue-700 text-lg transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Troco</label>
                  <div className={`p-3 rounded-2xl border-2 font-black text-lg flex items-center justify-center ${troco > 0 ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                    {formatCurrencyBR(troco)}
                  </div>
                </div>
              </div>
              {parseFloat(valorRecebido) < totalVenda && parseFloat(valorRecebido) > 0 && (
                <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                  <AlertCircle size={12}/> Valor insuficiente
                </p>
              )}
            </div>
          )}

          {/* Lógica PIX */}
          {metodoPagamento === 'PIX' && (
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-3xl border border-blue-100 animate-in slide-in-from-top-2">
              <QRCodeSVG value={`00020126330014BR.GOV.BCB.PIX0114${CHAVE_PIX}520400005303986540${totalVenda.toFixed(2)}5802BR5905VENDA6009SAO PAULO62070503***6304`} size={140} />
              <p className="text-[10px] text-blue-600 font-black mt-4 uppercase tracking-tighter">Escaneie para pagar {formatCurrencyBR(totalVenda)}</p>
            </div>
          )}

          {/* Botão Confirmar */}
          <button 
            onClick={() => metodoPagamento && onConfirm(metodoPagamento, parseFloat(valorRecebido), troco)}
            disabled={!metodoPagamento || isFinalizando || (metodoPagamento === 'DINHEIRO' && (parseFloat(valorRecebido) || 0) < totalVenda)}
            className="w-full bg-[#1A2B3C] text-white py-5 rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-3"
          >
            {isFinalizando ? <Loader2 className="animate-spin text-white" /> : <CheckCircle2 size={24} />}
            Confirmar Venda
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${active ? 'border-[#1A2B3C] bg-[#1A2B3C] text-white shadow-lg scale-105' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}>
      {icon}
      <span className="text-[10px] font-black uppercase">{label}</span>
    </button>
  );
}