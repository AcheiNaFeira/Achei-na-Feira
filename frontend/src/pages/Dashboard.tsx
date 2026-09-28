import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Pencil, Plus, Trash, Users, LogOut } from 'lucide-react';
import { Button, DashboardNav } from '../components/Shared';
import api, { getImageUrl } from '../api';

export function Dashboard({ role = 'feirante' }: { role?: 'feirante' | 'organizador' }) {
  const navigate = useNavigate();
  const organizer = role === 'organizador';
  const [items, setItems] = useState<any[]>([]);
  const [convites, setConvites] = useState<any[]>([]);
  const [feirantes, setFeirantes] = useState<any[]>([]);
  const [minhasFeiras, setMinhasFeiras] = useState<any[]>([]);
  
  const [selectedFeira, setSelectedFeira] = useState('');
  const [selectedFeirante, setSelectedFeirante] = useState('');
  
  const [verFeirantes, setVerFeirantes] = useState<any>(null); // armazena qual feira estamos vendo feirantes
  const [participantes, setParticipantes] = useState<any[]>([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, [role, organizer, user.id]);

  const fetchData = () => {
    if (organizer) {
      api.get('/feiras').then(res => setItems(res.data.filter((f: any) => f.organizador_id === user.id))).catch(console.error);
      api.get('/users/feirantes').then(res => setFeirantes(res.data)).catch(console.error);
    } else {
      api.get('/produtos').then(res => setItems(res.data.filter((p: any) => p.feirante_id === user.id))).catch(console.error);
      api.get('/convites').then(res => setConvites(res.data)).catch(console.error);
      api.get('/users/minhas-feiras').then(res => setMinhasFeiras(res.data)).catch(console.error);
    }
  };

  const aceitarConvite = async (id: number) => {
    try {
      await api.put(`/convites/${id}/aceitar`);
      setConvites(convites.filter((c: any) => c.convite_id !== id));
      alert('Convite aceito!');
      fetchData(); // recarrega minhasFeiras
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

  const deletarFeira = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta feira e todos os convites/participantes vinculados?')) return;
    try {
      await api.delete(`/feiras/${id}`);
      setItems(items.filter(f => f.id !== id));
      alert('Feira deletada com sucesso!');
    } catch (err) {
      alert('Erro ao deletar feira.');
    }
  };

  const abrirParticipantes = async (feira: any) => {
    try {
      const res = await api.get(`/feiras/${feira.id}/feirantes`);
      setParticipantes(res.data);
      setVerFeirantes(feira);
    } catch (err) {
      alert('Erro ao carregar participantes');
    }
  };

  const removerParticipante = async (feira_id: number, feirante_id: number) => {
    if (!confirm('Deseja remover este feirante da feira?')) return;
    try {
      await api.delete(`/convites/feira/${feira_id}/feirante/${feirante_id}`);
      setParticipantes(participantes.filter(p => p.id !== feirante_id));
    } catch (err) {
      alert('Erro ao remover participante');
    }
  };

  const sairDaFeira = async (feira_id: number) => {
    if (!confirm('Tem certeza que deseja sair desta feira? (Seus produtos não estarão mais vinculados a ela)')) return;
    try {
      await api.delete(`/convites/feira/${feira_id}/sair`);
      setMinhasFeiras(minhasFeiras.filter(f => f.id !== feira_id));
      alert('Você saiu da feira.');
    } catch (err) {
      alert('Erro ao sair da feira.');
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
          <button className="icon-button" onClick={() => alert('Nenhuma notificação nova no momento.')}><Bell size={19} /></button>
        </div>

        <div className="dashboard-columns">
          <div className="panel" style={{gridColumn: organizer ? 'span 2' : 'span 1'}}>
            <div className="panel-head">
              <div>
                <span className="kicker">{organizer ? 'AGENDA' : 'ATIVIDADE RECENTE'}</span>
                <h2>{organizer ? 'Suas feiras ativas' : 'Seus produtos'}</h2>
              </div>
            </div>
            {items.map((item: any) => (
              <div className="activity-row" key={item.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 15}}>
                  <div className="mini-art">
                    {item.imagem_url ? (
                      <img src={getImageUrl(item.imagem_url.split(',')[0])} alt="img" style={{width: 32, height: 32, borderRadius: 4, objectFit: 'cover'}} />
                    ) : (
                      <div style={{width: 32, height: 32, background: '#f97316', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 'bold'}}>
                        {item.nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <b>{item.nome}</b>
                    {organizer && <p style={{fontSize: 12, color: '#64748b', margin: 0}}>{item.data?.split('T')[0]}</p>}
                  </div>
                </div>
                
                <div style={{display: 'flex', gap: 10}}>
                  {organizer && (
                    <>
                      <Button variant="ghost" onClick={() => abrirParticipantes(item)} title="Ver Feirantes">
                        <Users size={16} />
                      </Button>
                      <Button variant="ghost" onClick={() => navigate(`/feira/editar/${item.id}`)} title="Editar Feira">
                        <Pencil size={16} />
                      </Button>
                      <Button variant="ghost" onClick={() => deletarFeira(item.id)} style={{color: '#ef4444'}} title="Deletar Feira">
                        <Trash size={16} />
                      </Button>
                    </>
                  )}
                  {!organizer && (
                    <Button variant="ghost" onClick={() => alert('Edição de produtos estará disponível na próxima versão.')} title="Editar Produto">
                      <Pencil size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {items.length === 0 && <p style={{color: '#64748b'}}>Nenhum item cadastrado.</p>}
          </div>

          {!organizer && (
            <div className="panel">
              <div className="panel-head">
                <div><span className="kicker">SUAS FEIRAS</span><h2>Feiras Confirmadas</h2></div>
              </div>
              {minhasFeiras.length === 0 ? <p style={{color: '#64748b'}}>Você não está participando de nenhuma feira.</p> : (
                minhasFeiras.map((f: any) => (
                  <div key={f.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9'}}>
                    <div>
                      <b>{f.nome}</b>
                    </div>
                    <Button variant="ghost" onClick={() => sairDaFeira(f.id)} style={{color: '#ef4444'}} title="Sair da feira">
                      <LogOut size={16} />
                    </Button>
                  </div>
                ))
              )}

              <div className="panel-head" style={{marginTop: 30}}>
                <div><span className="kicker">PENDÊNCIAS</span><h2>Convites recebidos</h2></div>
                <span className="notification-dot">{convites.length}</span>
              </div>
              {convites.length === 0 ? <p style={{color: '#64748b'}}>Nenhum convite no momento.</p> : (
                convites.map((c: any) => (
                  <div key={c.convite_id} style={{marginBottom: 10, background: '#f8fafc', padding: 10, borderRadius: 8}}>
                    <strong style={{color: '#0f172a'}}>{c.feira_nome}</strong>
                    <div style={{display: 'flex', gap: 10, marginTop: 10}}>
                      <Button variant="primary" onClick={() => aceitarConvite(c.convite_id)} style={{flex: 1, padding: '5px 0'}}>Aceitar</Button>
                      <Button variant="outline" onClick={() => recusarConvite(c.convite_id)} style={{flex: 1, padding: '5px 0'}}>Recusar</Button>
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
              <p style={{fontSize: 13, color: '#64748b'}}>Vincule um feirante da plataforma a uma de suas feiras ativas.</p>
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

              {/* Lista de Participantes (Mostrada quando clica em Ver Feirantes) */}
              {verFeirantes && (
                <div style={{marginTop: 30, borderTop: '1px solid #e2e8f0', paddingTop: 20}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3 style={{margin: 0, fontSize: 16}}>Feirantes: {verFeirantes.nome}</h3>
                    <Button variant="ghost" onClick={() => setVerFeirantes(null)} style={{padding: 0}}>Fechar</Button>
                  </div>
                  <div style={{marginTop: 15}}>
                    {participantes.length === 0 ? <p style={{color: '#64748b'}}>Nenhum feirante confirmado.</p> : (
                      participantes.map((p: any) => (
                        <div key={p.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9'}}>
                          <div style={{fontSize: 14}}>
                            <b>{p.nome}</b>
                          </div>
                          <Button variant="ghost" onClick={() => removerParticipante(verFeirantes.id, p.id)} style={{color: '#ef4444', padding: '5px'}} title="Remover Feirante">
                            <Trash size={14} />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
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
