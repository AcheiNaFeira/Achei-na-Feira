import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Logo } from '../components/Shared';
import api from '../api';
import { Home, Shield } from 'lucide-react';

export function Admin() {
  const navigate = useNavigate();
  const [pendentes, setPendentes] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchPendentes();
  }, []);

  const fetchPendentes = async () => {
    try {
      const res = await api.get('/admin/organizadores-pendentes');
      setPendentes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAprovar = async (id: number) => {
    try {
      await api.put(`/admin/organizadores/${id}/aprovar`);
      fetchPendentes();
    } catch (err) {
      alert('Erro ao aprovar.');
    }
  };

  const handleRecusar = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja recusar e excluir este cadastro?')) return;
    try {
      await api.put(`/admin/organizadores/${id}/recusar`);
      fetchPendentes();
    } catch (err) {
      alert('Erro ao recusar.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <main className="dashboard">
      <aside className="dashboard-nav">
        <Logo />
        <div className="user-chip">
          <div className="avatar" style={{background: '#8b5cf6', color: '#fff'}}><Shield size={16}/></div>
          <div>
            <b>{user.nome || 'Admin'}</b>
            <small>Administrador</small>
          </div>
        </div>
        <nav>
          <button className="active"><Home size={17} /> Visão geral</button>
        </nav>
        <button className="dashboard-exit" onClick={logout}>Sair da conta</button>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <span className="kicker">PAINEL ADMINISTRATIVO</span>
            <h1>Gerenciar Organizadores</h1>
          </div>
        </div>

        <div className="panel" style={{maxWidth: 800, marginTop: 20}}>
          <div className="panel-head">
            <div>
              <span className="kicker">APROVAÇÕES</span>
              <h2>Organizadores Pendentes</h2>
            </div>
            <span className="notification-dot">{pendentes.length}</span>
          </div>

          {pendentes.length === 0 ? (
            <p>Nenhum cadastro pendente no momento.</p>
          ) : (
            pendentes.map((org: any) => (
              <div key={org.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: 15, borderRadius: 8, marginBottom: 10 }}>
                <div>
                  <b style={{display: 'block', fontSize: 16}}>{org.nome}</b>
                  <span style={{color: '#64748b', fontSize: 14}}>{org.email}</span>
                </div>
                <div style={{display: 'flex', gap: 10}}>
                  <Button variant="outline" onClick={() => handleRecusar(org.id)}>Recusar</Button>
                  <Button onClick={() => handleAprovar(org.id)}>Aprovar</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
