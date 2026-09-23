import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button, MarketCard, ProductCard, SearchBar, Shell } from '../components/Shared';
import api from '../api';

export function HomePage() { 
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/feiras').then(res => setMarkets(res.data)).catch(console.error);
    api.get('/produtos').then(res => setProducts(res.data)).catch(console.error);
  }, []);

  return (
    <Shell>
      <section className="hero">
        <div className="hero-copy">
          <span className="kicker">COMPRA LOCAL, VIDA REAL</span>
          <h1>Encontre o que é <em>feito perto.</em></h1>
          <p>Feiras, produtores, artesãos e muito mais da sua cidade em um só lugar.</p>
          <SearchBar onSearch={() => navigate('/produtos')} />
          <div className="hero-links">
            <button onClick={() => navigate('/feiras')}>Ver feiras perto de mim <ArrowRight size={15} /></button>
            <button onClick={() => navigate('/produtos')}>Explorar produtos <ArrowRight size={15} /></button>
          </div>
        </div>
        <div className="hero-art">
          <div className="sun"></div>
          <div className="art-card art-card-one">🛍️<small>da sua região<br /><b>pra suas mãos</b></small></div>
        </div>
      </section>
      
      <section className="section section-tint">
        <div className="section-heading">
          <div><span className="kicker">ACONTECE POR AQUI</span><h2>Feiras próximas</h2></div>
          <button className="text-link" onClick={() => navigate('/feiras')}>Ver todas <ArrowRight size={16} /></button>
        </div>
        <div className="market-grid">
          {markets.slice(0, 3).map((m: any) => <MarketCard key={m.id} market={m} onClick={() => navigate(`/feira/${m.id}`)} />)}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><span className="kicker">DO SEU BAIRRO</span><h2>Achados da semana</h2></div>
          <button className="text-link" onClick={() => navigate('/produtos')}>Explorar produtos <ArrowRight size={16} /></button>
        </div>
        <div className="product-grid">
          {products.slice(0,4).map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </Shell>
  );
}
