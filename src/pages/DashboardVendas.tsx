import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  ShoppingBag, 
  Calendar, 
  User, 
  DollarSign, 
  ChevronRight,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrencyBR } from '../utils/formatCurrencyBR';


interface Venda {
  id: string;
  valorTotal: number;
  metodoPagamento: string;
  criadoEm: string;
  usuario: { nome: string };
  _count: { itens: number };
}

export default function DashboardVendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarVendas() {
      try {
        // Como o prefixo no server.ts é /vendas e o app.get é "/", a rota é /vendas
        const response = await api.get('/vendas');
        
        // O seu backend retorna: { status: "success", data: [...] }
        if (response.data && response.data.data) {
          setVendas(response.data.data);
        }
      } catch (error) {
        console.error("Erro ao carregar vendas:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarVendas();
  }, []);

  const totalGeral = vendas.reduce((acc, v) => acc + Number(v.valorTotal), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Histórico de Vendas</h1>
            <p className="text-sm text-gray-500">{vendas.length} vendas realizadas</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-4">
        {/* Card de Resumo */}
        <div className="bg-[#1A2B3C] p-6 rounded-3xl text-white shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-white/60 text-sm font-medium">Total Acumulado</p>
          <h2 className="text-3xl font-black mt-1">{formatCurrencyBR(totalGeral)}</h2>
        </div>

        <h3 className="font-bold text-gray-700 mt-6 mb-2 flex items-center gap-2">
          <ShoppingBag size={18} /> Últimos Lançamentos
        </h3>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[#2D6A4F]" size={32} />
          </div>
        ) : (
          <div className="space-y-3">
            {vendas.map((venda) => (
              <div key={venda.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-gray-900">
                        {formatCurrencyBR(venda.valorTotal)}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-gray-100 text-gray-600">
                        {venda.metodoPagamento}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {new Date(venda.criadoEm).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={12} /> {venda.usuario?.nome || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block mb-1">
                      {venda._count?.itens || 0} itens
                    </span>
                    <ChevronRight size={20} className="text-gray-300" />
                  </div>
                </div>
              </div>
            ))}

            {vendas.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p>Nenhuma venda encontrada.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}