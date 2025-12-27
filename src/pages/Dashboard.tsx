import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, LogOut, 
  Calculator, History, Menu, X 
} from 'lucide-react';
import logo from '../assets/logo_full_color.svg';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const userStorage = localStorage.getItem('@centralsys:user');
    if (userStorage) {
      const user = JSON.parse(userStorage);
      setUserName(user.nome);
    }
  }, []);

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  const menuItems = [
    { title: 'PDV / Vendas', icon: <ShoppingCart size={24} />, color: 'bg-green-600', path: '/pdv' },
    { title: 'Histórico', icon: <History size={24} />, color: 'bg-teal-600', path: '/historico-vendas' },
    { title: 'Produtos', icon: <Package size={24} />, color: 'bg-blue-600', path: '/produtos' },
    { title: 'Caixa', icon: <Calculator size={24} />, color: 'bg-orange-600', path: '/caixa' },
    { title: 'Relatórios', icon: <LayoutDashboard size={24} />, color: 'bg-purple-600', path: '/relatorios' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* HEADER MOBILE & DESKTOP */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img src={logo} alt="Logo" className="h-9 w-auto" />
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-gray-600">
            <span>Olá, {userName}</span>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-600 flex items-center gap-1">
              <LogOut size={18} /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* SIDEBAR (DESKTOP) / DRAWER (MOBILE) */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#1A2B3C] text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6 lg:hidden flex justify-between items-center border-b border-gray-700">
            <span className="font-bold">Menu</span>
            <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
          </div>
          
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.title}
                onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium"
              >
                {item.icon} {item.title}
              </button>
            ))}
            <button 
              onClick={handleLogout}
              className="w-full lg:hidden flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 mt-10"
            >
              <LogOut size={24} /> Sair do Sistema
            </button>
          </nav>
        </aside>

        {/* OVERLAY MOBILE */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-[#1A2B3C]">Olá, {userName}!</h1>
            <p className="text-sm text-gray-500">O que deseja fazer hoje?</p>
          </div>

          {/* GRID RESPONSIVO: 2 colunas no mobile, 3+ no desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
            {menuItems.map((item) => (
              <div 
                key={item.title}
                onClick={() => navigate(item.path)}
                className="bg-white p-4 lg:p-6 rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all cursor-pointer flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                <div className={`${item.color} w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-white mb-3`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-sm lg:text-base text-[#1A2B3C] leading-tight">{item.title}</h3>
                <p className="hidden lg:block text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Acessar</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}