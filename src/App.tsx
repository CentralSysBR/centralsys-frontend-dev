import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importação das Páginas
import Login from './pages/Login'; 
import Dashboard from './pages/Dashboard';
import DashboardVendas from './pages/DashboardVendas'; 
import PDV from './pages/PDV';
import GerenciarCaixa from './pages/GerenciarCaixa';
import Produtos from './pages/Produtos';
import Relatorios from './pages/Relatorios'; // Importando a nova página de relatórios

// Componente de Proteção de Rota
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('@centralsys:token');
  
  if (!token) {
    console.warn("Acesso negado: Token não encontrado. Redirecionando...");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route path="/" element={<Login />} />
        
        {/* Rotas Privadas (Protegidas) */}
        <Route 
          path="/dashboard" 
          element={<PrivateRoute><Dashboard /></PrivateRoute>} 
        />

        <Route 
          path="/historico-vendas" 
          element={<PrivateRoute><DashboardVendas /></PrivateRoute>} 
        />

        <Route 
          path="/pdv" 
          element={<PrivateRoute><PDV /></PrivateRoute>} 
        />

        <Route 
          path="/caixa" 
          element={<PrivateRoute><GerenciarCaixa /></PrivateRoute>} 
        />

        <Route 
          path="/produtos" 
          element={<PrivateRoute><Produtos /></PrivateRoute>} 
        />

        {/* Rota de Relatórios */}
        <Route 
          path="/relatorios" 
          element={<PrivateRoute><Relatorios /></PrivateRoute>} 
        />

        {/* Rota de Escape (Fallback) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}