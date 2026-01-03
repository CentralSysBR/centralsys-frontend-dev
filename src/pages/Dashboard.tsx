import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Lock, LogOut, Menu, X } from "lucide-react";

import logo from "../assets/logo_full_color.svg";
import { api } from "../services/api";
import { ModalFecharCaixa } from "../components/ModalFecharCaixa";
import { SideMenuList, sideMenuItems } from "../components/layout";

type CaixaAtivo = { id: string } | null;

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [caixaAtivo, setCaixaAtivo] = useState<CaixaAtivo>(null);
  const [isModalFecharOpen, setIsModalFecharOpen] = useState(false);
  const [loadingCaixa, setLoadingCaixa] = useState(true);

  useEffect(() => {
    const userStorage = localStorage.getItem("@centralsys:user");
    if (userStorage) {
      const user = JSON.parse(userStorage) as { nome?: string };
      setUserName(user.nome ?? "");
    }
    void verificarStatusCaixa();
  }, []);

  async function verificarStatusCaixa() {
    try {
      setLoadingCaixa(true);
      const res = await api.get("/caixas/aberto");
      setCaixaAtivo((res.data?.data ?? null) as CaixaAtivo);
    } catch (error) {
      console.error("Erro ao validar caixa:", error);
    } finally {
      setLoadingCaixa(false);
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate("/");
  }

  const menuItems = useMemo(
    () => sideMenuItems.filter((i) => i.showOnDashboard !== false),
    []
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img src={logo} alt="Logo" className="h-9 w-auto" />

          <div className="flex items-center gap-2 lg:gap-6">
            {!loadingCaixa && (
              <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full border border-gray-100 bg-gray-50">
                <div
                  className={classNames(
                    "w-2 h-2 rounded-full",
                    caixaAtivo ? "bg-green-500 animate-pulse" : "bg-red-500"
                  )}
                />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                  Caixa {caixaAtivo ? "Operando" : "Fechado"}
                </span>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden text-gray-600"
              aria-label="Abrir menu"
              type="button"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-gray-600 border-l pl-6">
              <span>Olá, {userName}</span>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                type="button"
              >
                <LogOut size={18} /> Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        <aside
          className={classNames(
            "fixed inset-y-0 left-0 z-40 w-64 bg-[#1A2B3C] text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-6 lg:hidden flex justify-between items-center border-b border-gray-700">
            <span className="font-bold">Menu Principal</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              type="button"
              aria-label="Fechar menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <SideMenuList
              items={menuItems}
              onSelect={(path) => {
                navigate(path);
                setIsMenuOpen(false);
              }}
            />

            <div className="pt-6 space-y-2 border-t border-white/10">
              <p className="px-2 text-[10px] font-bold text-white/60 uppercase">
                Gestão de Caixa
              </p>

              {caixaAtivo ? (
                <button
                  onClick={() => {
                    setIsModalFecharOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-orange-300 hover:bg-white/10"
                  type="button"
                >
                  <Lock size={20} /> Fechar Expediente
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate("/caixa");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-green-300 hover:bg-white/10"
                  type="button"
                >
                  <Lock size={20} /> Abrir Caixa
                </button>
              )}

              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-black"
                type="button"
              >
                <LogOut size={18} /> Sair
              </button>
            </div>
          </div>
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
              <h1 className="text-2xl lg:text-3xl font-black text-[#1A2B3C]">
                Painel Principal
              </h1>
              <p className="text-sm text-gray-500">
                Olá,{" "}
                <span className="font-semibold text-gray-700">{userName}</span>.
                O que deseja fazer hoje?
              </p>
            </div>

            {!caixaAtivo && !loadingCaixa && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-3 rounded-2xl animate-bounce">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-xs text-red-700 font-bold">
                  O PDV está bloqueado até que um caixa seja aberto.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {menuItems
              .filter((item) => item.showOnDashboard !== false)
              .map((item) => {
                const isPdvBloqueado = item.path === "/pdv" && !caixaAtivo;

                return (
                  <div
                    key={item.title}
                    onClick={() => !isPdvBloqueado && navigate(item.path)}
                    className={classNames(
                      "relative overflow-hidden bg-white p-5 lg:p-7 rounded-3xl border border-gray-100 shadow-sm transition-all flex flex-col items-center text-center lg:items-start lg:text-left",
                      isPdvBloqueado
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:shadow-xl hover:-translate-y-1 active:scale-95 cursor-pointer"
                    )}
                  >
                    <div
                      className={classNames(
                        item.color ?? "bg-[#1A2B3C]",
                        "w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-gray-100"
                      )}
                    >
                      {item.icon}
                    </div>
                    <h3 className="font-extrabold text-sm lg:text-lg text-[#1A2B3C] leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">
                      Acessar
                    </p>
                  </div>
                );
              })}
          </div>
        </main>
      </div>

      {isModalFecharOpen && caixaAtivo?.id && (
        <ModalFecharCaixa
          caixaId={caixaAtivo.id}
          onClose={() => setIsModalFecharOpen(false)}
          onSucesso={() => {
            setCaixaAtivo(null);
            void verificarStatusCaixa();
          }}
        />
      )}
    </div>
  );
}
