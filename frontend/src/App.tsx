import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { Listing } from './pages/Listing';
import { FairDetail } from './pages/FairDetail';
import { Auth } from './pages/Auth';
import { NovaSenha as NovaSenhaPage } from './pages/NovaSenha';
import { Dashboard } from './pages/Dashboard';

function PrivateRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/feiras" element={<Listing />} />
        <Route path="/produtos" element={<Listing productsOnly />} />
        <Route path="/feira/:id" element={<FairDetail />} />
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
        
        <Route path="/organizador" element={
          <PrivateRoute role="organizador">
            <Dashboard role="organizador" />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
