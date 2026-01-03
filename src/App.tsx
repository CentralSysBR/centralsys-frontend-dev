import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Importação das Páginas
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardVendas from "./pages/DashboardVendas";
import PDV from "./pages/PDV";
import GerenciarCaixa from "./pages/GerenciarCaixa";
import Produtos from "./pages/Produtos";
import Relatorios from "./pages/Relatorios";
import Despesas from "./pages/Despesas";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!usuario) return <Navigate to="/" replace />;

  return <>{children}</>;
}


function DashboardGate() {
  const { usuario } = useAuth();
  if (usuario?.papel === "ADMIN") return <DashboardAdmin />;
  return <DashboardGate />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardGate />
              </PrivateRoute>
            }
          />
          <Route
            path="/historico-vendas"
            element={
              <PrivateRoute>
                <DashboardVendas />
              </PrivateRoute>
            }
          />
          <Route
            path="/pdv"
            element={
              <PrivateRoute>
                <PDV />
              </PrivateRoute>
            }
          />
          <Route
            path="/caixa"
            element={
              <PrivateRoute>
                <GerenciarCaixa />
              </PrivateRoute>
            }
          />
          <Route
            path="/produtos"
            element={
              <PrivateRoute>
                <Produtos />
              </PrivateRoute>
            }
          />
          <Route
            path="/despesas"
            element={
              <PrivateRoute>
                <Despesas />
              </PrivateRoute>
            }
          />

          <Route
            path="/relatorios"
            element={
              <PrivateRoute>
                <Relatorios />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
