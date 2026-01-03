import { Menu } from "lucide-react";
import logo from "../../assets/logo_full_color.svg";

type Props = {
  onOpenMenu: () => void;
};

export function TopNav({ onOpenMenu }: Props) {
  return (
    <header className="fixed top-0 inset-x-0 bg-white border-b shadow-sm z-30">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <img src={logo} alt="CentralSys" className="h-6" />
        <button onClick={onOpenMenu} className="p-2 rounded-xl hover:bg-gray-100" aria-label="Abrir menu">
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}
