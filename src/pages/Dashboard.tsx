import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('@centralsys:user') || '{}');

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header seguindo a diretriz de usar a cor primária para estrutura */}
      <header className="bg-[#1A2B3C] text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-lg font-semibold tracking-tight">PDV CentralSys</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">Olá, {user.nome}</span>
          <button 
            onClick={handleLogout}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[#1A2B3C] text-2xl font-bold mb-4">Painel de Operação</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Placeholder para Abertura de Caixa */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <h3 className="text-[#4A5568] font-medium mb-2 uppercase text-xs tracking-wider">Status do Caixa</h3>
              <p className="text-[#1A2B3C] font-semibold text-lg mb-4">Caixa Fechado</p>
              <button className="bg-[#2D6A4F] text-white text-sm px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity">
                Abrir Caixa
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}