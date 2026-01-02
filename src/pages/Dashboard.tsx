import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, LogOut, 
  Calculator, History, Menu, X, Lock, Unlock, AlertCircle
} from 'lucide-react';
import logo from '../assets/logo_full_color.svg';
import { api } from '../services/api';
import { ModalFecharCaixa } from '../components/ModalFecharCaixa';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [caixaAtivo, setCaixaAtivo] = useState<any>(null);
  const [isModalFecharOpen, setIsModalFecharOpen] = useState(false);
  const [loadingCaixa, setLoadingCaixa] = useState(true);

  useEffect(() => {
    const userStorage = localStorage.getItem('@centralsys:user');
    if (userStorage) {
      const user = JSON.parse(userStorage);
      setUserName(user.nome);
    }
    verificarStatusCaixa();
  }, []);

  async function verificarStatusCaixa() {
    try {
      setLoadingCaixa(true);
      const res = await api.get('/caixas/aberto');
      setCaixaAtivo(res.data.data);
    } catch (error) {
      console.error("Erro ao validar caixa:", error);
    } finally {
      setLoadingCaixa(false);
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  const menuItems = [
    { title: 'PDV / Vendas', icon: <ShoppingCart size={24} />, color: 'bg-green-600', path: '/pdv' },
    { title: 'Histórico', icon: <History size={24} />, color: 'bg-teal-600', path: '/historico-vendas' },
    { title: 'Produtos', icon: <Package size={24} />, color: 'bg-blue-600', path: '/produtos' },
    { title: 'Caixa', icon: <Calculator size={24} />, color: 'bg-orange-600', path: '/caixa' },
    { title: 'Despesas', icon: <AlertCircle size={24} />, color: 'bg-red-600', path: '/despesas' },
    { title: 'Relatórios', icon: <LayoutDashboard size={24} />, color: 'bg-purple-600', path: '/relatorios' }, // Removido emBreve
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img src={logo} alt="Logo" className="h-9 w-auto" />
          
          <div className="flex items-center gap-2 lg:gap-6">
            {!loadingCaixa && (
              <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full border border-gray-100 bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${caixaAtivo ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                  Caixa {caixaAtivo ? 'Operando' : 'Fechado'}
                </span>
              </div>
            )}

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden text-gray-600"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-gray-600 border-l pl-6">
              <span>Olá, {userName}</span>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors">
                <LogOut size={18} /> Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#1A2B3C] text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6 lg:hidden flex justify-between items-center border-b border-gray-700">
            <span className="font-bold">Menu Principal</span>
            <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
          </div>
          
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.title}
                onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium hover:bg-white/10"
              >
                {item.icon} {item.title}
              </button>
            ))}
            
            <div className="pt-10 space-y-2">
              <p className="px-4 text-[10px] font-bold text-gray-500 uppercase">Gestão de Caixa</p>
              {caixaAtivo ? (
                <button 
                  onClick={() => { setIsModalFecharOpen(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-orange-400 hover:bg-orange-500/10"
                >
                  <Lock size={20} /> Fechar Expediente
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/caixa')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-green-400 hover:bg-green-500/10"
                >
                  <Unlock size={20} /> Abrir Novo Caixa
                </button>
              )}
            </div>
          </nav>
        </aside>

        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <main className="flex-1 p-4 lg:p-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-[#1A2B3C]">Painel Principal</h1>
              <p className="text-sm text-gray-500">Olá, <span className="font-semibold text-gray-700">{userName}</span>. O que deseja fazer hoje?</p>
            </div>

            {!caixaAtivo && !loadingCaixa && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-3 rounded-2xl animate-bounce">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-xs text-red-700 font-bold">O PDV está bloqueado até que um caixa seja aberto.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {menuItems.map((item) => {
              const isPdvBloqueado = item.path === '/pdv' && !caixaAtivo;

              return (
                <div 
                  key={item.title}
                  onClick={() => !isPdvBloqueado && navigate(item.path)}
                  className={`
                    relative overflow-hidden bg-white p-5 lg:p-7 rounded-3xl border border-gray-100 shadow-sm transition-all flex flex-col items-center text-center lg:items-start lg:text-left
                    ${isPdvBloqueado ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-1 active:scale-95 cursor-pointer'}
                  `}
                >
                  <div className={`${item.color} w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-gray-100`}>
                    {item.icon}
                  </div>
                  <h3 className="font-extrabold text-sm lg:text-lg text-[#1A2B3C] leading-tight">{item.title}</h3>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Acessar</p>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {isModalFecharOpen && (
        <ModalFecharCaixa 
          caixaId={caixaAtivo?.id} 
          onClose={() => setIsModalFecharOpen(false)} 
          onSucesso={() => {
            setCaixaAtivo(null);
            verificarStatusCaixa();
          }} 
        />
      )}
    </div>
  );
}