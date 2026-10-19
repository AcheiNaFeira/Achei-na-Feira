import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Copy, Link2, LogOut, MessageCircle, Pencil, Plus, RefreshCw, Search, Trash, Users, X } from 'lucide-react';
import { Button, DashboardNav } from '../components/Shared';
import api, { getImageUrl, formatDateBR } from '../api';

const normalizeText = (str: string) =>
  (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function Dashboard({ role = 'feirante' }: { role?: 'feirante' | 'organizador' }) {
  const navigate = useNavigate();
  const organizer = role === 'organizador';
  const [items, setItems] = useState<any[]>([]);
  const [convites, setConvites] = useState<any[]>([]);
  const [feirantes, setFeirantes] = useState<any[]>([]);
  const [minhasFeiras, setMinhasFeiras] = useState<any[]>([]);
  
  const [selectedFeira, setSelectedFeira] = useState('');
  const [selectedFeirante, setSelectedFeirante] = useState('');
  const [buscaFeirante, setBuscaFeirante] = useState('');

  const [conviteLink, setConviteLink] = useState('');
  const [copiado, setCopiado] = useState(false);
  
  const [verFeirantes, setVerFeirantes] = useState<any>(null);
  const [participantes, setParticipantes] = useState<any[]>([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const today = new Date();
  today.setHours(0,0,0,0);

  const isPast = (dataStr: string) => {
    if (!dataStr) return false;
    const d = new Date(dataStr.split('T')[0] + 'T00:00:00');
    return d < today;
  };

  const itemsAtivos = organizer ? items.filter(i => !isPast(i.data)) : items;
  const itemsPassados = organizer ? items.filter(i => isPast(i.data)) : [];

  const feirantesFiltrados = useMemo(() => {
    const termo = normalizeText(buscaFeirante.trim());
    if (!termo) return feirantes;
    return feirantes.filter((f: any) =>
      normalizeText(f.nome).includes(termo) ||
      normalizeText(f.email).includes(termo) ||
      normalizeText(f.whatsapp || '').includes(termo)
    );
  }, [feirantes, buscaFeirante]);

  const feiranteSelecionadoObj = useMemo(
    () => feirantes.find((f: any) => String(f.id) === String(selectedFeirante)),
    [feirantes, selectedFeirante]
  );

  useEffect(() => {
    fetchData();
  }, [role, organizer, user.id]);

  const fetchData = () => {
    if (organizer) {
      api.get('/feiras/minhas').then(res => setItems(res.data)).catch(console.error);
      api.get('/users/feirantes').then(res => setFeirantes(res.data)).catch(console.error);
    } else {
      api.get('/produtos').then(res => setItems(res.data.filter((p: any) => p.feirante_id === user.id))).catch(console.error);
      api.get('/convites').then(res => setConvites(res.data)).catch(console.error);
      api.get('/users/minhas-feiras').then(res => setMinhasFeiras(res.data)).catch(console.error);
    }
  };

  const handleSelectFeira = async (feiraId: string) => {
    setSelectedFeira(feiraId);
    setCopiado(false);
    if (!feiraId) {
      setConviteLink('');
      return;
    }
    try {
      const res = await api.post(`/feiras/${feiraId}/link-convite`);
      setConviteLink(`${window.location.origin}/convite/${res.data.token}`);
    } catch (err) {
      setConviteLink('');
    }
  };

  const regenerarLinkConvite = async () => {
    if (!selectedFeira) return;
    try {
      const res = await api.post(`/feiras/${selectedFeira}/link-convite`, { regenerar: true });
      setConviteLink(`${window.location.origin}/convite/${res.data.token}`);
      setCopiado(false);
    } catch (err) {
      alert('Erro ao renovar link de convite.');
    }
  };

  const copiarLinkConvite = async (feiraId?: number) => {
    let link = conviteLink;
    if (feiraId && String(feiraId) !== String(selectedFeira)) {
      setSelectedFeira(String(feiraId));
      try {
        const res = await api.post(`/feiras/${feiraId}/link-convite`);
        link = `${window.location.origin}/convite/${res.data.token}`;
        setConviteLink(link);
      } catch (err) {
        return alert('Erro ao gerar link de convite.');
      }
    }
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const compartilharLinkWhatsApp = () => {
    if (!conviteLink) return;
    const feiraObj = itemsAtivos.find((f: any) => String(f.id) === String(selectedFeira));
    const nomeFeira = feiraObj ? feiraObj.nome : 'nossa feira';
    const texto = `Olá! Você foi convidado para participar como feirante na feira "${nomeFeira}" no Achei na Feira. Acesse o link abaixo para confirmar sua participação:\n${conviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const aceitarConvite = async (id: number) => {
    try {
      await api.put(`/convites/${id}/aceitar`);
      setConvites(convites.filter((c: any) => c.convite_id !== id));
      alert('Convite aceito!');
      fetchData();
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
      setBuscaFeirante('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao enviar convite');
    }
  };

  const deletarFeira = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta feira e todos os convites/participantes vinculados?')) return;
    try {
      await api.delete(`/feiras/${id}`);
      setItems(items.filter(f => f.id !== id));
      if (String(selectedFeira) === String(id)) {
        setSelectedFeira('');
        setConviteLink('');
      }
      alert('Feira deletada com sucesso!');
    } catch (err) {
      alert('Erro ao deletar feira.');
    }
  };

  const deletarProduto = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await api.delete(`/produtos/${id}`);
      setItems(items.filter(p => p.id !== id));
      alert('Produto excluído com sucesso!');
    } catch (err) {
      alert('Erro ao excluir produto.');
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
            {itemsAtivos.map((item: any) => (
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
                    {organizer ? (
                      <p style={{fontSize: 12, color: '#64748b', margin: 0}}>{formatDateBR(item.data)}</p>
                    ) : (
                      <p style={{fontSize: 12, color: '#64748b', margin: 0}}>R$ {item.preco} • {item.categoria}</p>
                    )}
                  </div>
                </div>
                
                <div style={{display: 'flex', gap: 10}}>
                  {organizer && (
                    <>
                      <Button variant="ghost" onClick={() => copiarLinkConvite(item.id)} title="Copiar Link de Convite da Feira">
                        <Link2 size={16} />
                      </Button>
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
                    <>
                      <Button variant="ghost" onClick={() => navigate(`/produto/editar/${item.id}`)} title="Editar Produto">
                        <Pencil size={16} />
                      </Button>
                      <Button variant="ghost" onClick={() => deletarProduto(item.id)} style={{color: '#ef4444'}} title="Excluir Produto">
                        <Trash size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {itemsAtivos.length === 0 && <p style={{color: '#64748b'}}>Nenhum item cadastrado.</p>}
          </div>

          {organizer && itemsPassados.length > 0 && (
            <div className="panel" style={{gridColumn: 'span 2', marginTop: 15, opacity: 0.8}}>
              <div className="panel-head">
                <div>
                  <span className="kicker">HISTÓRICO</span>
                  <h2>Feiras que já aconteceram</h2>
                </div>
              </div>
              {itemsPassados.map((item: any) => (
                <div className="activity-row" key={item.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 15}}>
                    <div className="mini-art">
                      {item.imagem_url ? (
                        <img src={getImageUrl(item.imagem_url.split(',')[0])} alt="img" style={{width: 32, height: 32, borderRadius: 4, objectFit: 'cover', filter: 'grayscale(100%)'}} />
                      ) : (
                        <div style={{width: 32, height: 32, background: '#94a3b8', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 'bold'}}>
                          {item.nome.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <b>{item.nome}</b>
                      <p style={{fontSize: 12, color: '#ef4444', margin: 0}}>Finalizada em {formatDateBR(item.data)}</p>
                    </div>
                  </div>
                  
                  <div style={{display: 'flex', gap: 10}}>
                    <Button variant="ghost" onClick={() => deletarFeira(item.id)} style={{color: '#ef4444'}} title="Deletar Feira Permanente">
                      <Trash size={16} /> Deletar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

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
            <div className="panel" style={{ gridColumn: 'span 2' }}>
              <div className="panel-head">
                <div><span className="kicker">CONVITES</span><h2>Convidar Feirante</h2></div>
              </div>
              <p style={{fontSize: 13, color: '#64748b', marginTop: 0}}>
                Escolha a feira ativa e busque o feirante pelo nome, e-mail ou WhatsApp — ou compartilhe o link direto de convite.
              </p>

              <form onSubmit={enviarConvite} style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 15}}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                    1. Selecione a feira ativa
                  </label>
                  <select
                    value={selectedFeira}
                    onChange={e => handleSelectFeira(e.target.value)}
                    required
                    style={{width: '100%', padding: '10px', border: '1px solid #dbe4da', borderRadius: '6px', background: '#fff'}}
                  >
                    <option value="">Selecione a feira...</option>
                    {itemsAtivos.map((f: any) => <option key={f.id} value={f.id}>{f.nome} ({formatDateBR(f.data)})</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                    2. Buscar feirante na plataforma
                  </label>

                  {feiranteSelecionadoObj ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 8
                    }}>
                      <div>
                        <b style={{ color: '#9a3412', display: 'block', fontSize: 14 }}>{feiranteSelecionadoObj.nome}</b>
                        <small style={{ color: '#c2410c' }}>
                          {feiranteSelecionadoObj.email}
                          {feiranteSelecionadoObj.whatsapp ? ` • ${feiranteSelecionadoObj.whatsapp}` : ''}
                        </small>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedFeirante('')}
                        title="Trocar feirante"
                        style={{ padding: '4px 8px', color: '#9a3412' }}
                      >
                        <X size={16} /> Trocar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                        border: '1px solid #dbe4da', borderRadius: 6, background: '#fff'
                      }}>
                        <Search size={16} color="#64748b" />
                        <input
                          type="text"
                          placeholder="Digite nome, e-mail ou WhatsApp do feirante..."
                          value={buscaFeirante}
                          onChange={e => setBuscaFeirante(e.target.value)}
                          style={{ border: 'none', outline: 'none', width: '100%', fontSize: 14 }}
                        />
                        {buscaFeirante && (
                          <button
                            type="button"
                            onClick={() => setBuscaFeirante('')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>

                      <div style={{
                        marginTop: 8, maxHeight: 170, overflowY: 'auto',
                        border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc'
                      }}>
                        {feirantesFiltrados.length === 0 ? (
                          <p style={{ padding: '12px', margin: 0, fontSize: 13, color: '#64748b', textAlign: 'center' }}>
                            Nenhum feirante encontrado para "{buscaFeirante}".
                          </p>
                        ) : (
                          feirantesFiltrados.map((f: any) => (
                            <div
                              key={f.id}
                              onClick={() => setSelectedFeirante(String(f.id))}
                              style={{
                                padding: '9px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: '#fff'
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{f.nome}</div>
                                <div style={{ fontSize: 12, color: '#64748b' }}>
                                  {f.email}{f.whatsapp ? ` • ${f.whatsapp}` : ''}
                                </div>
                              </div>
                              <span style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600 }}>Selecionar</span>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>

                <Button type="submit" style={{ justifyContent: 'center' }}>
                  Enviar Convite Direto
                </Button>
              </form>

              {/* Bloco de Convite por Link */}
              {selectedFeira && conviteLink && (
                <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px dashed #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="kicker" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Link2 size={14} /> CONVIDAR POR LINK
                    </span>
                    <button
                      type="button"
                      onClick={regenerarLinkConvite}
                      title="Gerar novo link (invalida o anterior)"
                      style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <RefreshCw size={12} /> Novo link
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px' }}>
                    Envie este link para os feirantes entrarem direto na feira selecionada:
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      readOnly
                      value={conviteLink}
                      style={{ flex: 1, minWidth: 200, padding: '8px 10px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#334155' }}
                    />
                    <Button variant="outline" onClick={() => copiarLinkConvite()}>
                      {copiado ? <><Check size={15} /> Copiado!</> : <><Copy size={15} /> Copiar Link</>}
                    </Button>
                    <Button variant="soft" onClick={compartilharLinkWhatsApp}>
                      <MessageCircle size={15} /> WhatsApp
                    </Button>
                  </div>
                </div>
              )}

              {/* Lista de Participantes (Mostrada quando clica em Ver Feirantes) */}
              {verFeirantes && (
                <div style={{marginTop: 30, borderTop: '1px solid #e2e8f0', paddingTop: 20}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3 style={{margin: 0, fontSize: 16}}>Feirantes confirmados: {verFeirantes.nome}</h3>
                    <Button variant="ghost" onClick={() => setVerFeirantes(null)} style={{padding: 0}}>Fechar</Button>
                  </div>
                  <div style={{marginTop: 15}}>
                    {participantes.length === 0 ? <p style={{color: '#64748b'}}>Nenhum feirante confirmado.</p> : (
                      participantes.map((p: any) => (
                        <div key={p.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9'}}>
                          <div style={{fontSize: 14}}>
                            <b>{p.nome}</b>
                            {p.email && <span style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>({p.email})</span>}
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
