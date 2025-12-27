import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, Users, Package, Calendar } from 'lucide-react';

export default function Relatorios() {
  const navigate = useNavigate();

  const cards = [
    { title: 'Vendas Hoje', value: 'R$ 0,00', icon: <TrendingUp className="text-green-600" />, desc: 'Total acumulado hoje' },
    { title: 'Produtos Vendidos', value: '0', icon: <Package className="text-blue-600" />, desc: 'Itens saídos do estoque' },
    { title: 'Novos Clientes', value: '0', icon: <Users className="text-purple-600" />, desc: 'Cadastrados no período' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-1">
            <ArrowLeft size={24} className="text-[#1A2B3C]" />
          </button>
          <h1 className="text-xl font-bold text-[#1A2B3C]">Relatórios e BI</h1>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Filtro de Período Rápido */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['Hoje', '7 dias', '30 dias', 'Este Mês'].map((periodo) => (
            <button key={periodo} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 whitespace-nowrap active:bg-gray-100">
              {periodo}
            </button>
          ))}
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 flex items-center gap-2">
            <Calendar size={14} /> Personalizado
          </button>
        </div>

        {/* Grid de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">{card.icon}</div>
              </div>
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{card.title}</h3>
              <p className="text-2xl font-black text-[#1A2B3C] mt-1">{card.value}</p>
              <p className="text-[10px] text-gray-400 mt-2">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Placeholder para Gráfico */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
          <div className="bg-blue-50 p-4 rounded-full">
            <BarChart3 size={48} className="text-blue-500 opacity-50" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A2B3C]">Gráficos em Desenvolvimento</h2>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Estamos processando seus dados para gerar insights valiosos sobre o seu negócio.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}