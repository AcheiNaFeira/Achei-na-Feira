import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Logo } from '../components/Shared';
import api from '../api';
import { Home, Shield, Users, Package, Tent, Ban, Trash2, CheckCircle, RefreshCcw } from 'lucide-react';

export function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('geral');
  const [stats, setStats] = useState<any>({ views: 0, views_diarias: 0, views_semanais: 0, feiras: 0, produtos: 0 });
  const [pendentes, setPendentes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [feiras, setFeiras] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'geral') {
        const [stRes, penRes] = await Promise.all([
          api.get('/admin/estatisticas'),
          api.get('/admin/organizadores-pendentes')
        ]);
        setStats(stRes.data);
        setPendentes(penRes.data);
      } else if (activeTab === 'aprovados' || activeTab === 'banidos') {
        const res = await api.get('/admin/usuarios');
        setUsuarios(res.data);
      } else if (activeTab === 'feiras') {
        const res = await api.get('/admin/feiras');
        setFeiras(res.data);
      } else if (activeTab === 'produtos') {
        const res = await api.get('/admin/produtos');
        setProdutos(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAprovar = async (id: number) => {
    try {
      await api.put(`/admin/organizadores/${id}/aprovar`);
      fetchData();
    } catch (err) {
      alert('Erro ao aprovar.');
    }
  };

  const handleRecusar = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja recusar e excluir este cadastro?')) return;
    try {
      await api.put(`/admin/organizadores/${id}/recusar`);
      fetchData();
    } catch (err) {
      alert('Erro ao recusar.');
    }
  };

  const alterarStatusUser = async (id: number, status: string) => {
    if (!window.confirm(`Tem certeza que deseja ${status === 'banido' ? 'desativar' : 'restaurar'} este usuário?`)) return;
    try {
      await api.put(`/admin/usuarios/${id}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Erro ao alterar status.');
    }
  };

  const deletarFeira = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar esta feira permanentemente?')) return;
    try {
      await api.delete(`/admin/feiras/${id}`);
      fetchData();
    } catch (err) {
      alert('Erro ao deletar feira.');
    }
  };

  const deletarProduto = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto permanentemente?')) return;
    try {
      await api.delete(`/admin/produtos/${id}`);
      fetchData();
    } catch (err) {
      alert('Erro ao deletar produto.');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('user');
    navigate('/login');
  };

  const aprovados = usuarios.filter((u: any) => u.status_aprovacao === 'ativo');
  const banidos = usuarios.filter((u: any) => u.status_aprovacao === 'banido');

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
          <button className={activeTab === 'geral' ? 'active' : ''} onClick={() => setActiveTab('geral')}>
            <Home size={17} /> Visão geral
          </button>
          <button className={activeTab === 'aprovados' ? 'active' : ''} onClick={() => setActiveTab('aprovados')}>
            <Users size={17} /> Perfis Aprovados
          </button>
          <button className={activeTab === 'banidos' ? 'active' : ''} onClick={() => setActiveTab('banidos')}>
            <Ban size={17} /> Perfis Banidos
          </button>
          <button className={activeTab === 'feiras' ? 'active' : ''} onClick={() => setActiveTab('feiras')}>
            <Tent size={17} /> Feiras
          </button>
          <button className={activeTab === 'produtos' ? 'active' : ''} onClick={() => setActiveTab('produtos')}>
            <Package size={17} /> Produtos
          </button>
        </nav>
        <button className="dashboard-exit" onClick={logout}>Sair da conta</button>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <span className="kicker">PAINEL ADMINISTRATIVO</span>
            <h1>Dashboard</h1>
          </div>
        </div>

        {activeTab === 'geral' && (
          <>
            <div className="stats">
              <div>
                <span className="kicker">HOJE</span>
                <small>Visualizações Diárias</small>
                <strong>{stats.views_diarias || 0}</strong>
              </div>
              <div>
                <span className="kicker">ESTA SEMANA</span>
                <small>Visualizações Semanais</small>
                <strong>{stats.views_semanais || 0}</strong>
              </div>
              <div>
                <span className="kicker">MÉTRICA GLOBAL</span>
                <small>Visualizações Totais</small>
                <strong>{stats.views}</strong>
              </div>
            </div>
            
            <div className="stats" style={{marginTop: 15}}>
              <div>
                <span className="kicker">ECOSSISTEMA</span>
                <small>Feiras criadas no total</small>
                <strong>{stats.feiras}</strong>
              </div>
              <div>
                <span className="kicker">ECOSSISTEMA</span>
                <small>Produtos ativos</small>
                <strong>{stats.produtos}</strong>
              </div>
              <div style={{visibility: 'hidden'}}></div>
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
          </>
        )}

        {activeTab === 'aprovados' && (
          <div className="panel">
            <h2>Perfis Aprovados</h2>
            <p style={{color: '#64748b', marginBottom: 20}}>Listagem de todos os organizadores e feirantes ativos. Você pode banir (desativar) perfis aqui.</p>
            {aprovados.length === 0 ? <p>Nenhum perfil aprovado.</p> : aprovados.map((u: any) => (
              <div key={u.id} className="activity-row" style={{borderBottom: '1px solid #e2e8f0', borderTop: 'none', padding: '15px 0'}}>
                <div className="avatar" style={{background: '#ea580c'}}><Users size={16}/></div>
                <div>
                  <b>{u.nome} <span style={{fontWeight: 'normal', color: '#64748b', marginLeft: 8}}>{u.tipo}</span></b>
                  <span>{u.email}</span>
                </div>
                <div>
                  <Button variant="outline" onClick={() => alterarStatusUser(u.id, 'banido')} style={{borderColor: '#ef4444', color: '#ef4444'}}>
                    <Ban size={14} /> Banir / Desativar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'banidos' && (
          <div className="panel">
            <h2>Perfis Banidos</h2>
            <p style={{color: '#64748b', marginBottom: 20}}>Listagem de contas desativadas pelo administrador.</p>
            {banidos.length === 0 ? <p>Nenhum perfil banido.</p> : banidos.map((u: any) => (
              <div key={u.id} className="activity-row" style={{borderBottom: '1px solid #e2e8f0', borderTop: 'none', padding: '15px 0'}}>
                <div className="avatar" style={{background: '#94a3b8'}}><Ban size={16}/></div>
                <div>
                  <b style={{color: '#94a3b8', textDecoration: 'line-through'}}>{u.nome}</b>
                  <span>{u.email}</span>
                </div>
                <div>
                  <Button onClick={() => alterarStatusUser(u.id, 'ativo')} style={{background: '#10b981', borderColor: '#10b981'}}>
                    <CheckCircle size={14} /> Restaurar Conta
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'feiras' && (
          <div className="panel">
            <h2>Gestão de Feiras</h2>
            {feiras.length === 0 ? <p>Nenhuma feira cadastrada.</p> : feiras.map((f: any) => (
              <div key={f.id} className="activity-row" style={{borderBottom: '1px solid #e2e8f0', borderTop: 'none', padding: '15px 0'}}>
                <div className="avatar" style={{background: '#264f3d'}}><Tent size={16}/></div>
                <div>
                  <b>{f.nome}</b>
                  <span>{f.local}</span>
                </div>
                <div>
                  <Button variant="outline" onClick={() => deletarFeira(f.id)} style={{borderColor: '#ef4444', color: '#ef4444'}}>
                    <Trash2 size={14} /> Deletar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'produtos' && (
          <div className="panel">
            <h2>Gestão de Produtos</h2>
            {produtos.length === 0 ? <p>Nenhum produto cadastrado.</p> : produtos.map((p: any) => (
              <div key={p.id} className="activity-row" style={{borderBottom: '1px solid #e2e8f0', borderTop: 'none', padding: '15px 0'}}>
                <div className="avatar" style={{background: '#f59e0b'}}><Package size={16}/></div>
                <div>
                  <b>{p.nome}</b>
                  <span>R$ {Number(p.preco).toFixed(2)}</span>
                </div>
                <div>
                  <Button variant="outline" onClick={() => deletarProduto(p.id)} style={{borderColor: '#ef4444', color: '#ef4444'}}>
                    <Trash2 size={14} /> Deletar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}
