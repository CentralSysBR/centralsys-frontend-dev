import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GerenciarCaixa from "./pages/GerenciarCaixa";
import PDV from "./pages/PDV";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { usuario, loading } = useAuth();

  if (loading) return <div className="p-4 text-sm text-gray-600">Carregando...</div>;
  return usuario ? <>{children}</> : <Navigate to="/" replace />;
};

export function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
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
            path="/pdv"
            element={
              <PrivateRoute>
                <PDV />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
