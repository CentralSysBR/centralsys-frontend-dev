import type { SideMenuItem } from "./sideMenuItems";

type Props = {
  items: SideMenuItem[];
  onSelect: (path: string) => void;
};

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function SideMenuList({ items, onSelect }: Props) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <button
          key={item.title}
          type="button"
          onClick={() => {
            if (item.disabled) return;
            onSelect(item.path);
          }}
          className={classNames(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium hover:bg-white/10 text-white",
            item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
        >
          <span className="text-white/90">{item.icon}</span>
          <span className="flex-1 text-left">{item.title}</span>
          {item.badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/80 font-bold">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
