import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import type { SideMenuItem } from "./sideMenuItems";

type Props = {
  open: boolean;
  onClose: () => void;
  items: SideMenuItem[];
  onLogout?: () => void;
};

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function SideMenu({ open, onClose, items, onLogout }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-2xl border-l flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="text-sm font-black text-[#1A2B3C]">Menu</div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100" aria-label="Fechar menu">
            <X size={18} />
          </button>
        </div>

        <div className="p-3 flex-1 overflow-auto">
          <div className="space-y-1">
            {items.map((item) => {
              const active = location.pathname === item.path;
              const disabled = Boolean(item.disabled);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    if (disabled) return;
                    navigate(item.path);
                    onClose();
                  }}
                  disabled={disabled}
                  className={classNames(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-2xl border text-left",
                    active ? "bg-[#1A2B3C] text-white border-[#1A2B3C]" : "bg-white text-[#1A2B3C] border-gray-200",
                    disabled && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <span className={classNames("shrink-0", active ? "text-white" : "text-[#1A2B3C]")}>{item.icon}</span>
                  <span className="flex-1 text-sm font-semibold">{item.title}</span>
                  {item.badge && (
                    <span className={classNames("text-[10px] px-2 py-1 rounded-full border", active ? "border-white/30" : "border-gray-200")}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {onLogout && (
          <div className="p-3 border-t">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-2xl bg-red-50 text-red-700 border border-red-200 font-bold"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
