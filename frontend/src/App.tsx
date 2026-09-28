import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { Listing } from './pages/Listing';
import { FairDetail } from './pages/FairDetail';
import { Auth } from './pages/Auth';
import { NovaSenha as NovaSenhaPage } from './pages/NovaSenha';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { NovaFeira } from './pages/NovaFeira';
import { EditarFeira } from './pages/EditarFeira';
import { NovoProduto } from './pages/NovoProduto';
import { ProductDetail } from './pages/ProductDetail';

function PrivateRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.tipo !== role) {
    return <Navigate to="/" replace />;
  }

  if (user.precisa_trocar_senha && window.location.pathname !== '/nova-senha') {
    return <Navigate to="/nova-senha" replace />;
  }

  return <>{children}</>;
}

import { useEffect } from 'react';
import api from './api';

export default function App() {
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const hasViewed = document.cookie.includes('site_viewed=true');
    
    // Conta visualização apenas se não for perfil registrado E se não visitou hoje (24h)
    if (!userString && !hasViewed) {
      api.post('/visita').catch(() => {});
      document.cookie = "site_viewed=true; max-age=86400; path=/";
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/feiras" element={<Listing />} />
        <Route path="/produtos" element={<Listing productsOnly />} />
        <Route path="/feira/:id" element={<FairDetail />} />
        <Route path="/produto/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Auth />} />
        
        <Route path="/nova-senha" element={
          <PrivateRoute>
            <NovaSenhaPage />
          </PrivateRoute>
        } />
        
        <Route path="/feirante" element={
          <PrivateRoute role="feirante">
            <Dashboard role="feirante" />
          </PrivateRoute>
        } />
        <Route path="/novo-produto" element={
          <PrivateRoute role="feirante">
            <NovoProduto />
          </PrivateRoute>
        } />
        
        <Route path="/organizador" element={
          <PrivateRoute role="organizador">
            <Dashboard role="organizador" />
          </PrivateRoute>
        } />
        <Route path="/nova-feira" element={
          <PrivateRoute role="organizador">
            <NovaFeira />
          </PrivateRoute>
        } />
        <Route path="/feira/editar/:id" element={
          <PrivateRoute role="organizador">
            <EditarFeira />
          </PrivateRoute>
        } />
        
        <Route path="/admin" element={
          <PrivateRoute role="admin">
            <Admin />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
