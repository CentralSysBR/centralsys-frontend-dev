import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Calculator, ArrowLeft, Play, StopCircle, DollarSign, Loader2, ArrowUpCircle, ArrowDownCircle, Wallet, Menu, X, LayoutDashboard, History, Package, ShoppingCart, AlertCircle, MessageSquare, CheckSquare } from 'lucide-react';
import { api } from '../services/api';
import logo from "../assets/logo_full_color.svg";
import { useAuth } from "../contexts/AuthContext";
import { ModalFecharCaixa } from '../components/ModalFecharCaixa';
import { ModalMovimentacaoCaixa } from '../components/ModalMovimentacaoCaixa';
import { formatCurrencyBR } from '../utils/formatCurrencyBR';
import { maskCurrencyInputBR } from '../utils/maskCurrencyInputBR';
import { parseCurrencyBR } from '../utils/parseCurrencyBR';


function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

interface Caixa {
  id: string;
  status: 'ABERTO' | 'FECHADO';
  valorInicialCentavos: number;
  valorAtualCentavos?: number;
  abertoEm: string;
}

export default function GerenciarCaixa() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [CaixaAberto, setCaixaAberto] = useState<Caixa | null>(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={24} />, path: "/dashboard" },
    { title: "PDV / Vendas", icon: <ShoppingCart size={24} />, path: "/pdv" },
    { title: "Histórico", icon: <History size={24} />, path: "/historico-vendas" },
    { title: "Produtos", icon: <Package size={24} />, path: "/produtos" },
    { title: "Caixa", icon: <Calculator size={24} />, path: "/caixa" },
    { title: "Despesas", icon: <AlertCircle size={24} />, path: "/despesas" },
    { title: "Relatórios", icon: <LayoutDashboard size={24} />, path: "/relatorios" },
    { title: "Mensagens", icon: <MessageSquare size={24} />, path: "/mensagens", disabled: true, badge: "Em breve" },
    { title: "Tarefas", icon: <CheckSquare size={24} />, path: "/tarefas", disabled: true, badge: "Em breve" },
  ] as const;
  const [valorInicialCentavos, setValorInicial] = useState(formatCurrencyBR(0)); const [isModalFecharOpen, setIsModalFecharOpen] = useState(false);
  const [isModalMovimentarOpen, setIsModalMovimentarOpen] = useState(false);
  const [isFinalizando, setIsFinalizando] = useState(false);

  useEffect(() => {
    fetchCaixaStatus();
  }, []);

  async function fetchCaixaStatus() {
    try {
      setLoading(true);
      const response = await api.get('/caixas/aberto');
      setCaixaAberto(response.data.data || null);
    } catch (error) {
      console.error("Erro ao buscar status do caixa:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAbrirCaixa() {
    const valor = parseCurrencyBR(valorInicialCentavos);

    if (isNaN(valor) || valor < 0) {
      alert("Informe um valor inicial válido.");
      return;
    }

    try {
      setIsFinalizando(true);
      await api.post('/caixas/abrir', { valorInicialCentavos: valor });
      await fetchCaixaStatus();
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao abrir caixa");
    } finally {
      setIsFinalizando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="fixed top-0 inset-x-0 bg-white border-b shadow-sm z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <img src={logo} alt="CentralSys" className="h-7" />
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-[#1A2B3C] shadow-2xl p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="text-white font-black text-lg">Menu</div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition text-white"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => {
                    if ((item as any).disabled) return;
                    navigate((item as any).path);
                    setIsMenuOpen(false);
                  }}
                  className={classNames(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium hover:bg-white/10 text-white",
                    (item as any).disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="text-white/90">{(item as any).icon}</span>
                  <span className="flex-1 text-left">{item.title}</span>
                  {(item as any).badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/80 font-bold">
                      {(item as any).badge}
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-black"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pt-[80px] p-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl bg-white border hover:bg-gray-50 active:scale-95 transition" aria-label="Voltar">
            <ArrowLeft size={18} className="text-[#1A2B3C]" />
          </button>
          <h1 className="text-xl font-black text-[#1A2B3C]">Gestão de Caixa</h1>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold">Sincronizando caixa...</p>
          </div>
        ) : !CaixaAberto ? (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 text-center space-y-6">
            <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center text-blue-600 mx-auto">
              <Calculator size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1A2B3C]">Caixa Fechado</h2>
              <p className="text-gray-400 font-medium">Inicie o turno para começar a vender</p>
            </div>

            <div className="max-w-xs mx-auto">
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Fundo de Gaveta (R$)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-center text-2xl font-black text-[#1A2B3C] outline-none focus:border-blue-500 transition-all"
                value={valorInicialCentavos}
                onChange={(e) => {
                  const masked = maskCurrencyInputBR(e.target.value);
                  setValorInicial(masked);
                }}
              />

            </div>

            <button
              onClick={handleAbrirCaixa}
              disabled={isFinalizando}
              className="w-full bg-[#1A2B3C] text-white py-5 rounded-2xl font-bold shadow-xl shadow-gray-200 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Play size={20} fill="currentColor" /> Abrir Caixa Agora
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#1A2B3C] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest">Turno em Andamento</p>
                </div>

                <p className="text-white/50 text-[10px] font-black uppercase mb-1">Saldo Atual em Dinheiro</p>
                <h2 className="text-5xl font-black mb-4 tracking-tighter">
                  {formatCurrencyBR(CaixaAberto.valorAtualCentavos ?? CaixaAberto.valorInicialCentavos)}
                </h2>

                <div className="flex items-center gap-2 text-white/40">
                  <Wallet size={14} />
                  <p className="text-[11px] font-bold uppercase">
                    Fundo Inicial: <span className="text-white/70">{formatCurrencyBR(CaixaAberto.valorInicialCentavos)}</span>
                  </p>
                </div>
              </div>
              <Calculator className="absolute -right-6 -bottom-6 text-white/5 w-40 h-40" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => navigate('/pdv')} className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all">
                <div className="bg-green-50 p-4 rounded-2xl text-green-600"><DollarSign size={32} /></div>
                <span className="font-black text-sm uppercase text-[#1A2B3C]">Vender</span>
              </button>

              <button onClick={() => setIsModalMovimentarOpen(true)} className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all">
                <div className="bg-orange-50 p-4 rounded-2xl text-orange-600 flex gap-1">
                  <ArrowUpCircle size={20} />
                  <ArrowDownCircle size={20} />
                </div>
                <span className="font-black text-sm uppercase text-[#1A2B3C]">Sangria/Reforço</span>
              </button>
            </div>

            <button
              onClick={() => setIsModalFecharOpen(true)}
              className="w-full mt-6 flex items-center justify-center gap-2 text-gray-400 font-bold p-5 rounded-2xl border-2 border-dashed border-gray-200 text-xs hover:text-red-500 hover:border-red-200 transition-all"
            >
              <StopCircle size={18} /> Encerrar Turno e Fechar Caixa
            </button>
          </div>
        )}
      </main>

      {isModalFecharOpen && CaixaAberto && (
        <ModalFecharCaixa
          caixaId={CaixaAberto.id}
          onClose={() => setIsModalFecharOpen(false)}
        />
      )}

      {isModalMovimentarOpen && CaixaAberto && (
        <ModalMovimentacaoCaixa
          isOpen={isModalMovimentarOpen}
          caixaId={CaixaAberto.id}
          onClose={() => setIsModalMovimentarOpen(false)}
          onSucesso={fetchCaixaStatus}
        />
      )}
    </div>
  );
}