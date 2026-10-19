import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Filter, Heart, MapPin, Store } from 'lucide-react';
import { Button, ProductCard, Shell } from '../components/Shared';
import api, { getImageUrl, formatDateBR } from '../api';

export function FairDetail() { 
  const { id } = useParams();
  const navigate = useNavigate();
  const [feira, setFeira] = useState<any>(null);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [feirantesConfirmados, setFeirantesConfirmados] = useState<any[]>([]);
  const [feiranteFiltro, setFeiranteFiltro] = useState<number | null>(null);

  // State local para botões da feira
  const [salvo, setSalvo] = useState(() => {
    return JSON.parse(localStorage.getItem('fav_feiras') || '[]').includes(id);
  });

  useEffect(() => {
    api.get(`/feiras/${id}`).then(res => setFeira(res.data)).catch(console.error);
    api.get(`/feiras/${id}/produtos`).then(res => setProdutos(res.data)).catch(console.error);
    api.get(`/feiras/${id}/feirantes`).then(res => setFeirantesConfirmados(res.data)).catch(console.error);
  }, [id]);

  const openMaps = () => {
    const query = feira.endereco_completo || `${feira.local} ${feira.cidade || ''}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  const handleLike = async () => {
    try {
      const res = await api.post(`/feiras/${id}/like`);
      setFeira({...feira, likes: res.data.likes});
      setSalvo(res.data.liked);
      
      let saved = JSON.parse(localStorage.getItem('fav_feiras') || '[]');
      if (res.data.liked) {
        if (!saved.includes(id)) saved.push(id);
      } else {
        saved = saved.filter((savedId: string) => savedId !== id);
      }
      localStorage.setItem('fav_feiras', JSON.stringify(saved));
    } catch (err: any) {
      alert('Erro ao curtir.');
    }
  };

  if (!feira) return <Shell><div style={{padding: 40}}>Carregando...</div></Shell>;

  const produtosExibidos = feiranteFiltro
    ? produtos.filter(p => p.feirante_id === feiranteFiltro)
    : produtos;

  return (
    <Shell>
      <div className="detail-wrap">
        <button className="back-link" onClick={() => navigate('/feiras')}><ArrowLeft size={16} /> Voltar para feiras</button>
        <div className="detail-hero">
          <div 
            className="detail-visual" 
            style={feira.imagem_url 
              ? { backgroundImage: `url(${getImageUrl(feira.imagem_url)})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
              : { background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }
            }
          >
            {!feira.imagem_url && <span style={{ position: 'relative', inset: 0, color: '#fff', fontSize: '28px', fontFamily: 'serif', fontWeight: 'bold', textAlign: 'center', padding: '20px' }}>{feira.nome}</span>}
          </div>
          <div className="detail-info">
            <span className="kicker">{formatDateBR(feira.data)}</span>
            <h1>{feira.nome}</h1>
            <p className="lead"><MapPin size={17} /> {feira.local} • {feira.hora_inicio} – {feira.hora_fim}</p>
            {feira.endereco_completo && (
              <p style={{marginTop: -10, marginBottom: 20, color: '#64748b', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6}}>
                <MapPin size={14} /> {feira.endereco_completo}
              </p>
            )}
            <p>{feira.descricao}</p>
            <div className="detail-actions">
              <Button onClick={openMaps} variant="primary">
                <MapPin size={17} /> Como chegar (Google Maps)
              </Button>
              <Button onClick={handleLike} variant="outline">
                <Heart size={17} fill={salvo ? "#ef4444" : "none"} color={salvo ? "#ef4444" : "currentColor"} /> 
                {salvo ? 'Curtiu' : 'Curtir'} ({feira.likes || 0})
              </Button>
            </div>
          </div>
        </div>

        {/* Seção de Bancas / Feirantes Confirmados */}
        {feirantesConfirmados.length > 0 && (
          <div className="detail-section" style={{ marginBottom: 30 }}>
            <div className="section-heading">
              <div>
                <span className="kicker">{feirantesConfirmados.length} PARTICIPANTES</span>
                <h2>Bancas & Produtores Confirmados</h2>
              </div>
              {feiranteFiltro && (
                <Button variant="outline" onClick={() => setFeiranteFiltro(null)}>
                  Mostrar todos os produtos
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 15 }}>
              {feirantesConfirmados.map((f: any) => {
                const ativo = feiranteFiltro === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFeiranteFiltro(ativo ? null : f.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                      borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                      background: ativo ? '#fff7ed' : '#f8fafc',
                      border: ativo ? '2px solid var(--orange)' : '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', background: '#f97316', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                    }}>
                      <Store size={16} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: 14, color: '#0f172a' }}>{f.nome}</strong>
                      <small style={{ color: '#64748b', fontSize: 12 }}>
                        {f.total_produtos ?? 0} produto(s)
                      </small>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="detail-section" id="produtos-section">
          <div className="section-heading">
            <div><span className="kicker">{produtosExibidos.length} PRODUTOS</span><h2>O que você encontra</h2></div>
            <Button variant="soft" onClick={() => document.getElementById('produtos-section')?.scrollIntoView({behavior: 'smooth'})}>
              <Filter size={16} /> Ver Catálogo
            </Button>
          </div>
          {produtosExibidos.length === 0 ? (
            <p>Nenhum produto cadastrado pelos feirantes confirmados nesta feira ainda.</p>
          ) : (
            <div className="product-grid">
              {produtosExibidos.map(p => (
                 <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
