import { Printer, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ItemRecibo {
  id: string;
  nome: string;
  quantidade: number;
  precoVenda: number;
}

interface ReciboVendaProps {
  vendaId?: string;
  itens: ItemRecibo[];
  total: number;
  metodoPagamento: string;
  valorRecebido?: number;
  troco?: number;
  onFinalizar: () => void;
}

export function ReciboVenda({
  vendaId,
  itens,
  total,
  metodoPagamento,
  valorRecebido = 0,
  troco = 0,
  onFinalizar
}: ReciboVendaProps) {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[200] flex flex-col items-center p-4 md:p-8 overflow-y-auto animate-in fade-in duration-300">
      
      {/* Área Não Imprimível (Interface de Controle) */}
      <div className="w-full max-w-md mb-6 flex flex-col items-center print:hidden text-center">
        <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black text-gray-800">Venda Finalizada!</h2>
        <p className="text-gray-500 mt-2 font-medium">O estoque já foi atualizado no sistema.</p>
        
        <div className="flex gap-3 mt-8 w-full">
          <button 
            onClick={handlePrint}
            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <Printer size={20} />
            Imprimir
          </button>
          <button 
            onClick={onFinalizar}
            className="flex-1 bg-[#1A2B3C] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-xl"
          >
            <ArrowLeft size={20} />
            Nova Venda
          </button>
        </div>
      </div>

      {/* Papel do Recibo (O que será impresso) */}
      <div className="w-full max-w-[350px] bg-white p-6 shadow-2xl rounded-sm border-t-8 border-[#1A2B3C] print:shadow-none print:border-none print:p-0 font-mono text-sm text-gray-800">
        <div className="text-center mb-6">
          <h3 className="font-black text-xl uppercase tracking-tighter">CentralSys PDV</h3>
          <p className="text-[10px] text-gray-500 uppercase">Comprovante Não Fiscal</p>
          <div className="border-b border-dashed border-gray-300 my-4"></div>
          <p className="text-[10px] text-left">ID: {vendaId?.toUpperCase() || 'GERANDO...'}</p>
          <p className="text-[10px] text-left">DATA: {new Date().toLocaleString('pt-BR')}</p>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between font-bold text-[10px] border-b border-gray-100 pb-1 uppercase">
            <span>Item</span>
            <span>Total</span>
          </div>
          {itens.map((item, index) => (
            <div key={index} className="flex flex-col text-[11px]">
              <div className="flex justify-between">
                <span>{item.quantidade}x {item.nome}</span>
                <span>R$ {(item.quantidade * item.precoVenda).toFixed(2)}</span>
              </div>
              <span className="text-[9px] text-gray-400">UN: R$ {Number(item.precoVenda).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-dashed border-gray-200 pt-4 space-y-1">
          <div className="flex justify-between items-center text-lg font-black">
            <span>TOTAL</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] font-bold">
            <span>PAGAMENTO</span>
            <span>{metodoPagamento}</span>
          </div>
          
          {metodoPagamento === 'DINHEIRO' && (
            <>
              <div className="flex justify-between text-[11px]">
                <span>RECEBIDO</span>
                <span>R$ {valorRecebido.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-black border-t border-gray-100 pt-1 mt-1">
                <span>TROCO</span>
                <span>R$ {troco.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <div className="border-b border-dashed border-gray-300 mb-4"></div>
          <p className="text-[10px] leading-tight">Obrigado pela preferência!<br/>Volte Sempre.</p>
        </div>
      </div>

      {/* CSS para Impressão */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          .print-section, .print-section * { visibility: visible; }
          .fixed { position: static !important; display: block !important; padding: 0 !important; }
          body { background: white !important; }
        }
      `}} />
    </div>
  );
}