import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, ShoppingBag, Palette, Flower2, Coffee, Milk } from 'lucide-react';
import { Button, MarketCard, ProductCard, SearchBar, Shell } from '../components/Shared';
import api from '../api';

const CATEGORIAS = [
  { id: 'Frutas & Verduras', icon: <Leaf size={24} />, color: '#10b981' },
  { id: 'Orgânicos', icon: <ShoppingBag size={24} />, color: '#84cc16' },
  { id: 'Artesanato', icon: <Palette size={24} />, color: '#f59e0b' },
  { id: 'Flores', icon: <Flower2 size={24} />, color: '#ec4899' },
  { id: 'Alimentos', icon: <Coffee size={24} />, color: '#d97706' },
  { id: 'Laticínios', icon: <Milk size={24} />, color: '#3b82f6' }
];

export function HomePage() { 
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]);
  const [products, setProducts] = useState([]);

  // RF07: Consulta de vitrines ativas (Feiras)
  useEffect(() => {
    // Carrega feiras na página inicial
    api.get('/feiras').then(res => setMarkets(res.data)).catch(console.error);
    // Carrega produtos na página inicial
    api.get('/produtos').then(res => setProducts(res.data)).catch(console.error);
  }, []);

  return (
    <Shell>
      <section className="hero">
        <div className="hero-copy">
          <span className="kicker">COMPRA LOCAL, VIDA REAL</span>
          <h1>Encontre o que é <em>feito perto.</em></h1>
          <p>Feiras, produtores, artesãos e muito mais da sua cidade em um só lugar.</p>
          <SearchBar onSearch={(val) => navigate(`/produtos?busca=${encodeURIComponent(val)}`)} />
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

      <section className="section" style={{paddingTop: 0}}>
        <div className="section-heading">
          <div><span className="kicker">EXPLORE</span><h2>Categorias Populares</h2></div>
        </div>
        <div style={{display: 'flex', gap: 15, flexWrap: 'wrap', marginTop: 20}}>
          {CATEGORIAS.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => navigate(`/produtos?categoria=${encodeURIComponent(cat.id)}`)}
              style={{
                flex: '1 1 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                gap: 10, padding: 20, background: '#f8fafc', border: '1px solid #e2e8f0', 
                borderRadius: 12, cursor: 'pointer', transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{color: cat.color}}>{cat.icon}</div>
              <span style={{fontSize: 14, fontWeight: 500, color: '#334155'}}>{cat.id}</span>
            </button>
          ))}
        </div>
      </section>
      
      <section className="section section-tint">
        <div className="section-heading">
          <div><span className="kicker">ACONTECE POR AQUI</span><h2>Feiras próximas</h2></div>
          <button className="text-link" onClick={() => navigate('/feiras')}>Ver todas <ArrowRight size={16} /></button>
        </div>
        {markets.length === 0 ? <p>Nenhuma feira cadastrada.</p> : (
          <div className="market-grid">
            {markets.slice(0, 3).map((m: any) => <MarketCard key={m.id} market={m} onClick={() => navigate(`/feira/${m.id}`)} />)}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-heading">
          <div><span className="kicker">DO SEU BAIRRO</span><h2>Achados da semana</h2></div>
          <button className="text-link" onClick={() => navigate('/produtos')}>Explorar produtos <ArrowRight size={16} /></button>
        </div>
        {products.length === 0 ? <p>Nenhum produto cadastrado.</p> : (
          <div className="product-grid">
            {products.slice(0,4).map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section style={{background: '#f97316', padding: '60px 20px', textAlign: 'center', color: '#fff'}}>
        <h2 style={{fontSize: 32, marginBottom: 15, fontWeight: 800}}>É produtor ou feirante?</h2>
        <p style={{fontSize: 18, marginBottom: 30, maxWidth: 600, margin: '0 auto 30px auto', opacity: 0.9}}>
          Cadastre sua feira ou produtos e apareça para milhares de pessoas na sua região.
        </p>
        <Button onClick={() => navigate('/login')} style={{background: '#fff', color: '#ea580c'}}>Divulgar Minha Feira</Button>
      </section>
    </Shell>
  );
}
