import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, MessageCircle, Tent } from 'lucide-react';
import { Button, Shell } from '../components/Shared';
import api, { getImageUrl } from '../api';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [fav, setFav] = useState(() => {
    return JSON.parse(localStorage.getItem('fav_prods') || '[]').includes(Number(id));
  });

  useEffect(() => {
    api.get(`/produtos/${id}`).then(res => setProduto(res.data)).catch(console.error);
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await api.post(`/produtos/${id}/like`);
      setProduto({...produto, likes: res.data.likes});
      
      const saved = JSON.parse(localStorage.getItem('fav_prods') || '[]');
      if (!saved.includes(Number(id))) {
        saved.push(Number(id));
        localStorage.setItem('fav_prods', JSON.stringify(saved));
        setFav(true);
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        alert(err.response.data.error);
      } else {
        alert('Erro ao curtir.');
      }
    }
  };

  const openWhatsApp = () => {
    const phone = produto.feirante_whatsapp?.replace(/\D/g, '');
    if (phone) {
      window.open(`https://wa.me/${phone}?text=Olá, vi seu produto ${encodeURIComponent(produto.nome)} no Achei na Feira!`, '_blank');
    } else {
      alert("Este feirante não cadastrou um número de WhatsApp.");
    }
  };

  const openMaps = (endereco: string, local: string) => {
    const query = endereco || local;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  if (!produto) return <Shell><div style={{padding: 40}}>Carregando...</div></Shell>;

  const imagens = produto.imagem_url ? produto.imagem_url.split(',') : [];

  return (
    <Shell>
      <div className="detail-wrap">
        <button className="back-link" onClick={() => navigate('/produtos')}><ArrowLeft size={16} /> Voltar para produtos</button>
        <div className="detail-hero" style={{gridTemplateColumns: '1fr 1fr', gap: 40}}>
          
          {/* Carrossel de Imagens */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            <div 
              className="detail-visual" 
              style={imagens.length > 0 
                ? { backgroundImage: `url(${getImageUrl(imagens[currentImageIndex])})`, backgroundSize: 'cover', backgroundPosition: 'center', height: 400 } 
                : { background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }
              }
            >
              {imagens.length === 0 && <span style={{ color: '#fff', fontSize: '28px', fontFamily: 'serif', fontWeight: 'bold' }}>{produto.nome}</span>}
            </div>
            
            {/* Miniaturas do Carrossel */}
            {imagens.length > 1 && (
              <div style={{display: 'flex', gap: 10, overflowX: 'auto'}}>
                {imagens.map((img: string, idx: number) => (
                  <div 
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{
                      width: 80, height: 80, borderRadius: 8, cursor: 'pointer',
                      backgroundImage: `url(${getImageUrl(img)})`, backgroundSize: 'cover', backgroundPosition: 'center',
                      border: currentImageIndex === idx ? '3px solid var(--orange)' : '3px solid transparent',
                      opacity: currentImageIndex === idx ? 1 : 0.6
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="detail-info">
            <span className="kicker">{produto.categoria}</span>
            <h1>{produto.nome}</h1>
            <p className="lead">Vendido por: <b>{produto.feirante_nome}</b></p>
            <h2 style={{color: 'var(--orange)', fontSize: 32, margin: '15px 0'}}>R$ {produto.preco}</h2>
            <p>{produto.descricao || 'Nenhuma descrição fornecida.'}</p>
            
            <div className="detail-actions" style={{marginTop: 30}}>
              <Button onClick={openWhatsApp} variant="primary" style={{flex: 1}}>
                <MessageCircle size={17} /> Falar no WhatsApp
              </Button>
              <Button onClick={handleLike} variant="outline" style={{flex: 1}}>
                <Heart size={17} fill={fav ? "#ef4444" : "none"} color={fav ? "#ef4444" : "currentColor"} /> 
                {fav ? 'Curtiu' : 'Curtir'} ({produto.likes || 0})
              </Button>
            </div>
          </div>
        </div>
        
        {/* Feiras Localizadas */}
        <div className="detail-section" style={{marginTop: 60}}>
          <div className="section-heading">
            <div><span className="kicker">ONDE ENCONTRAR</span><h2>Feiras em que está localizado</h2></div>
          </div>
          
          {(!produto.feiras || produto.feiras.length === 0) ? (
            <p>Este feirante não está confirmado em nenhuma feira no momento.</p>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20}}>
              {produto.feiras.map((f: any) => (
                <div key={f.id} className="panel" style={{display: 'flex', flexDirection: 'column', gap: 15}}>
                  <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                    <div style={{background: '#fef08a', padding: 10, borderRadius: 8, color: '#ca8a04'}}><Tent size={24}/></div>
                    <div>
                      <h3 style={{margin: 0}}>{f.nome}</h3>
                      <p style={{margin: 0, fontSize: 14, color: '#64748b'}}>{f.local}</p>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: 10}}>
                    <Button variant="soft" onClick={() => navigate(`/feira/${f.id}`)} style={{flex: 1, padding: '8px 0'}}>
                      Ver Feira
                    </Button>
                    <Button variant="outline" onClick={() => openMaps(f.endereco_completo, f.local)} style={{flex: 1, padding: '8px 0'}}>
                      <MapPin size={16}/> GPS
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
