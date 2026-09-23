import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Filter, Heart, MapPin, Ticket } from 'lucide-react';
import { Button, ProductCard, Shell } from '../components/Shared';
import api from '../api';

export function FairDetail() { 
  const { id } = useParams();
  const navigate = useNavigate();
  const [feira, setFeira] = useState<any>(null);
  const [feirantes, setFeirantes] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/feiras/${id}`).then(res => setFeira(res.data)).catch(console.error);
    api.get(`/feiras/${id}/feirantes`).then(res => setFeirantes(res.data)).catch(console.error);
  }, [id]);

  if (!feira) return <Shell>Carregando...</Shell>;

  return (
    <Shell>
      <div className="detail-wrap">
        <button className="back-link" onClick={() => navigate('/feiras')}><ArrowLeft size={16} /> Voltar para feiras</button>
        <div className="detail-hero">
          <div className="detail-visual mint">🥬</div>
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
            <div><span className="kicker">{feirantes.length} FEIRANTES</span><h2>O que você encontra</h2></div>
            <Button variant="soft"><Filter size={16} /> Filtrar</Button>
          </div>
          <div className="product-grid">
            {feirantes.map(f => (
               <article className="product-card" key={f.id}>
                 <div className="product-content">
                   <span className="tag">FEIRANTE CONFIRMADO</span>
                   <h3>{f.nome}</h3>
                 </div>
               </article>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
