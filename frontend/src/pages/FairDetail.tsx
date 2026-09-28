import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Filter, Heart, MapPin, Ticket } from 'lucide-react';
import { Button, ProductCard, Shell } from '../components/Shared';
import api from '../api';

import { getImageUrl } from '../api';

export function FairDetail() { 
  const { id } = useParams();
  const navigate = useNavigate();
  const [feira, setFeira] = useState<any>(null);
  const [produtos, setProdutos] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/feiras/${id}`).then(res => setFeira(res.data)).catch(console.error);
    api.get(`/feiras/${id}/produtos`).then(res => setProdutos(res.data)).catch(console.error);
  }, [id]);

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
            {!feira.imagem_url && <span style={{ color: '#fff', fontSize: '28px', fontFamily: 'serif', fontWeight: 'bold', textAlign: 'center', padding: '20px' }}>{feira.nome}</span>}
          </div>
          <div className="detail-info">
            <span className="kicker">{feira.data.split('T')[0]}</span>
            <h1>{feira.nome}</h1>
            <p className="lead"><MapPin size={17} /> {feira.local} · {feira.hora_inicio} – {feira.hora_fim}</p>
            <p>{feira.descricao}</p>
            <div className="detail-actions">
              <Button><Ticket size={17} /> Quero visitar</Button>
              <Button variant="outline"><Heart size={17} /> Salvar</Button>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <div className="section-heading">
            <div><span className="kicker">{produtos.length} PRODUTOS</span><h2>O que você encontra</h2></div>
            <Button variant="soft"><Filter size={16} /> Filtrar</Button>
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
