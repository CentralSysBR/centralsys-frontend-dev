import type React from "react";
import {
  AlertCircle,
  Calculator,
  History,
  LayoutDashboard,
  MessageSquare,
  Package,
  ShoppingCart,
  CheckSquare,
} from "lucide-react";

export type SideMenuItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  color?: string;
  disabled?: boolean;
  badge?: string;
  showOnDashboard?: boolean;
};

export const sideMenuItems: SideMenuItem[] = [
  {
    title: "PDV / Vendas",
    path: "/pdv",
    icon: <ShoppingCart size={20} />,
    color: "bg-green-600",
    showOnDashboard: true,
  },
  {
    title: "Histórico",
    path: "/historico-vendas",
    icon: <History size={20} />,
    color: "bg-teal-600",
    showOnDashboard: true,
  },
  {
    title: "Produtos",
    path: "/produtos",
    icon: <Package size={20} />,
    color: "bg-blue-600",
    showOnDashboard: true,
  },
  {
    title: "Caixa",
    path: "/caixa",
    icon: <Calculator size={20} />,
    color: "bg-orange-600",
    showOnDashboard: true,
  },
  {
    title: "Despesas",
    path: "/despesas",
    icon: <AlertCircle size={20} />,
    color: "bg-red-600",
    showOnDashboard: true,
  },
  {
    title: "Relatórios",
    path: "/relatorios",
    icon: <LayoutDashboard size={20} />,
    color: "bg-purple-600",
    showOnDashboard: true,
  },
  {
    title: "Mensagens",
    path: "/mensagens",
    icon: <MessageSquare size={20} />,
    disabled: true,
    badge: "Em breve",
    showOnDashboard: false,
  },
  {
    title: "Tarefas",
    path: "/tarefas",
    icon: <CheckSquare size={20} />,
    disabled: true,
    badge: "Em breve",
    showOnDashboard: false,
  },
];
