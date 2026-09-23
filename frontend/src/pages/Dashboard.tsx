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
                    <strong>{c.feira_nome}</strong>
                    <div style={{display: 'flex', gap: 10, marginTop: 10}}>
                      <Button onClick={() => aceitarConvite(c.convite_id)}>Aceitar</Button>
                    </div>
                  </div>
                ))
              )}
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
