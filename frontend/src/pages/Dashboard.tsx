import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Pencil, Plus } from 'lucide-react';
import { Button, DashboardNav } from '../components/Shared';
import api from '../api';

export function Dashboard({ role = 'feirante' }: { role?: 'feirante' | 'organizador' }) {
  const navigate = useNavigate();
  const organizer = role === 'organizador';
  const [items, setItems] = useState([]);
  const [convites, setConvites] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (organizer) {
      api.get('/feiras').then(res => setItems(res.data.filter((f: any) => f.organizador_id === user.id))).catch(console.error);
    } else {
      api.get('/produtos').then(res => setItems(res.data.filter((p: any) => p.feirante_id === user.id))).catch(console.error);
      api.get('/convites').then(res => setConvites(res.data)).catch(console.error);
    }
  }, [role, organizer, user.id]);

  const aceitarConvite = async (id: number) => {
    try {
      await api.put(`/convites/${id}/aceitar`);
      setConvites(convites.filter((c: any) => c.convite_id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="dashboard">
      <DashboardNav role={role} />
      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <span className="kicker">BOM DIA, {user.nome?.toUpperCase()}</span>
            <h1>{organizer ? 'Vamos movimentar a cidade.' : 'Seu catálogo está vivo.'}</h1>
          </div>
          <button className="icon-button"><Bell size={19} /></button>
        </div>

        <div className="dashboard-columns">
          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="kicker">{organizer ? 'AGENDA' : 'ATIVIDADE RECENTE'}</span>
                <h2>{organizer ? 'Suas próximas feiras' : 'Seus produtos'}</h2>
              </div>
            </div>
            {items.slice(0, 3).map((item: any) => (
              <div className="activity-row" key={item.id}>
                <div className="mini-art">{item.emoji || '📦'}</div>
                <div><b>{item.nome}</b></div>
                <Pencil size={15} />
              </div>
            ))}
          </div>

          {!organizer && (
            <div className="panel invite-panel">
              <div className="panel-head">
                <div><span className="kicker">PENDÊNCIAS</span><h2>Convites recebidos</h2></div>
                <span className="notification-dot">{convites.length}</span>
              </div>
              {convites.length === 0 ? <p>Nenhum convite no momento.</p> : (
                convites.map((c: any) => (
                  <div key={c.convite_id} style={{marginBottom: 10, background: '#f5f5f5', padding: 10, borderRadius: 8}}>
                    <strong style={{color: 'black'}}>{c.feira_nome}</strong>
                    <div style={{display: 'flex', gap: 10, marginTop: 10}}>
                      <Button onClick={() => aceitarConvite(c.convite_id)}>Aceitar</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {organizer && (
            <div className="panel">
              <div className="panel-head">
                <div><span className="kicker">ADMINISTRAÇÃO</span><h2>Cadastrar Feirante</h2></div>
              </div>
              <p style={{fontSize: 12, color: '#58706c'}}>Crie uma conta para um novo feirante. Ele receberá uma senha provisória.</p>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                try {
                  const res = await api.post('/auth/feirante', Object.fromEntries(formData));
                  alert(`Feirante criado com sucesso!\nE-mail: ${res.data.user.email}\nSenha provisória: ${res.data.senha_provisoria}`);
                  (e.target as HTMLFormElement).reset();
                } catch (err: any) {
                  alert(err.response?.data?.error || 'Erro ao criar feirante');
                }
              }}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 15}}>
                  <input name="nome" placeholder="Nome do feirante" required style={{padding: '10px', border: '1px solid #dbe4da', borderRadius: '4px'}} />
                  <input name="email" type="email" placeholder="E-mail" required style={{padding: '10px', border: '1px solid #dbe4da', borderRadius: '4px'}} />
                  <Button type="submit">Criar Feirante</Button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="quick-actions">
          <Button onClick={() => navigate(organizer ? '/nova-feira' : '/novo-produto')}><Plus size={17} /> {organizer ? 'Criar nova feira' : 'Adicionar produto'}</Button>
        </div>
      </section>
    </main>
  );
}
