import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Filter, Heart, MapPin, Ticket } from 'lucide-react';
import { Button, ProductCard, Shell } from '../components/Shared';
import api from '../api';

import { getImageUrl, formatDateBR } from '../api';

export function FairDetail() { 
  const { id } = useParams();
  const navigate = useNavigate();
  const [feira, setFeira] = useState<any>(null);
  const [produtos, setProdutos] = useState<any[]>([]);

  // State local para botões da feira
  const [salvo, setSalvo] = useState(() => {
    return JSON.parse(localStorage.getItem('fav_feiras') || '[]').includes(id);
  });

  useEffect(() => {
    api.get(`/feiras/${id}`).then(res => setFeira(res.data)).catch(console.error);
    api.get(`/feiras/${id}/produtos`).then(res => setProdutos(res.data)).catch(console.error);
  }, [id]);

  const openMaps = () => {
    const query = feira.endereco_completo || `${feira.local} ${feira.cidade}`;
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
            <p className="lead"><MapPin size={17} /> {feira.local} · {feira.hora_inicio} – {feira.hora_fim}</p>
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
        
        <div className="detail-section" id="produtos-section">
          <div className="section-heading">
            <div><span className="kicker">{produtos.length} PRODUTOS</span><h2>O que você encontra</h2></div>
            <Button variant="soft" onClick={() => document.getElementById('produtos-section')?.scrollIntoView({behavior: 'smooth'})}>
              <Filter size={16} /> Ver Catálogo
            </Button>
          </div>
          {produtos.length === 0 ? (
            <p>Nenhum produto cadastrado pelos feirantes confirmados nesta feira ainda.</p>
          ) : (
            <div className="product-grid">
              {produtos.map(p => (
                 <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
