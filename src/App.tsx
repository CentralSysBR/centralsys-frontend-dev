import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login'; 
import Dashboard from './pages/Dashboard';
import DashboardVendas from './pages/DashboardVendas'; 
import PDV from './pages/PDV';
import GerenciarCaixa from './pages/GerenciarCaixa';
import Produtos from './pages/Produtos';
import Relatorios from './pages/Relatorios';
import Despesas from './pages/Despesas';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('@centralsys:token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/historico-vendas" element={<PrivateRoute><DashboardVendas /></PrivateRoute>} />
        <Route path="/pdv" element={<PrivateRoute><PDV /></PrivateRoute>} />
        <Route path="/caixa" element={<PrivateRoute><GerenciarCaixa /></PrivateRoute>} />
        <Route path="/produtos" element={<PrivateRoute><Produtos /></PrivateRoute>} />
        <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
        <Route path="/despesas" element={<PrivateRoute><Despesas /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
