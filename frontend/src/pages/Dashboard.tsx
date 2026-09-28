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
  const [feirantes, setFeirantes] = useState([]);
  const [selectedFeira, setSelectedFeira] = useState('');
  const [selectedFeirante, setSelectedFeirante] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (organizer) {
      api.get('/feiras').then(res => setItems(res.data.filter((f: any) => f.organizador_id === user.id))).catch(console.error);
      api.get('/users/feirantes').then(res => setFeirantes(res.data)).catch(console.error);
    } else {
      api.get('/produtos').then(res => setItems(res.data.filter((p: any) => p.feirante_id === user.id))).catch(console.error);
      api.get('/convites').then(res => setConvites(res.data)).catch(console.error);
    }
  }, [role, organizer, user.id]);

  const aceitarConvite = async (id: number) => {
    try {
      await api.put(`/convites/${id}/aceitar`);
      setConvites(convites.filter((c: any) => c.convite_id !== id));
      alert('Convite aceito!');
    } catch (err) {
      console.error(err);
    }
  };

  const recusarConvite = async (id: number) => {
    try {
      await api.put(`/convites/${id}/recusar`);
      setConvites(convites.filter((c: any) => c.convite_id !== id));
      alert('Convite recusado!');
    } catch (err) {
      console.error(err);
    }
  };

  const enviarConvite = async (e: any) => {
    e.preventDefault();
    if (!selectedFeira || !selectedFeirante) return alert('Selecione uma feira e um feirante.');
    try {
      await api.post(`/feiras/${selectedFeira}/convidar`, { feirante_id: selectedFeirante });
      alert('Convite enviado com sucesso!');
      setSelectedFeirante('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao enviar convite');
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
                <div className="mini-art">
                  {item.imagem_url ? <img src={item.imagem_url} alt="img" style={{width: 24, height: 24, borderRadius: 4, objectFit: 'cover'}} /> : (item.emoji || '📦')}
                </div>
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
                      <Button variant="outline" onClick={() => recusarConvite(c.convite_id)}>Recusar</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {organizer && (
            <div className="panel">
              <div className="panel-head">
                <div><span className="kicker">CONVITES</span><h2>Convidar Feirante</h2></div>
              </div>
              <p style={{fontSize: 12, color: '#58706c'}}>Vincule um feirante da plataforma a uma de suas feiras ativas.</p>
              <form onSubmit={enviarConvite} style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 15}}>
                <select value={selectedFeira} onChange={e => setSelectedFeira(e.target.value)} required style={{padding: '10px', border: '1px solid #dbe4da', borderRadius: '4px'}}>
                  <option value="">Selecione a feira...</option>
                  {items.map((f: any) => <option key={f.id} value={f.id}>{f.nome} ({f.data?.split('T')[0]})</option>)}
                </select>
                <select value={selectedFeirante} onChange={e => setSelectedFeirante(e.target.value)} required style={{padding: '10px', border: '1px solid #dbe4da', borderRadius: '4px'}}>
                  <option value="">Selecione o feirante...</option>
                  {feirantes.map((f: any) => <option key={f.id} value={f.id}>{f.nome} - {f.email}</option>)}
                </select>
                <Button type="submit">Enviar Convite</Button>
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
