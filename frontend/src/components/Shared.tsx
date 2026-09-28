import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, CalendarDays, ChevronDown, CircleUserRound, Heart, Home, Leaf, ListFilter, MapPin, Menu, Pencil, Plus, Search, Settings, Store, X } from 'lucide-react';

export function Logo() { 
  const navigate = useNavigate(); 
  return <button className="logo" onClick={() => navigate('/')}><span className="logo-mark"><Leaf size={18} /></span> achei na <b>feira</b></button>;
}

export function Button({ children, variant = 'primary', onClick, type = 'button' }: { children: React.ReactNode; variant?: 'primary' | 'outline' | 'soft' | 'ghost'; onClick?: () => void; type?: 'button' | 'submit' }) { 
  return <button type={type} onClick={onClick} className={`button button-${variant}`}>{children}</button>;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <header className="header">
      <div className="header-inner">
        <Logo />
        <nav className={open ? 'nav nav-open' : 'nav'}>
          <button onClick={() => { navigate('/feiras'); setOpen(false); }}>Feiras</button>
          <button onClick={() => { navigate('/produtos'); setOpen(false); }}>Produtos</button>
          <button onClick={() => { navigate('/login'); setOpen(false); }} className="nav-login">Entrar</button>
        </nav>
        <button className="mobile-menu" aria-label="Abrir menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}

export function SearchBar({ onSearch, initialValue = '' }: { onSearch?: (value: string) => void, initialValue?: string }) { 
  const [value, setValue] = useState(initialValue); 
  return (
    <div className="searchbar">
      <Search size={19} />
      <input placeholder="O que você procura?" value={value} onChange={e => { setValue(e.target.value); onSearch?.(e.target.value); }} />
      <button aria-label="Buscar" onClick={() => onSearch?.(value)}><ArrowRight size={18} /></button>
    </div>
  );
}

import { getImageUrl } from '../api';

export function MarketCard({ market, onClick }: { market: any; onClick: () => void }) { 
  return (
    <button className="market-card" onClick={onClick}>
      <div 
        className="market-image" 
        style={market.imagem_url 
          ? { backgroundImage: `url(${getImageUrl(market.imagem_url)})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
          : { background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }
        }
      >
        {!market.imagem_url && <span style={{ color: '#fff', fontSize: '24px', fontFamily: 'serif', fontWeight: 'bold', textAlign: 'center', padding: '10px' }}>{market.nome}</span>}
        <small style={{position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4}}><MapPin size={12} /> {market.local}</small>
      </div>
      <div className="market-content">
        <div className="eyebrow">FEIRA</div>
        <h3>{market.nome}</h3>
        <p><MapPin size={14} /> {market.local}</p>
        <p><CalendarDays size={14} /> {market.data?.split('T')[0]} · {market.hora_inicio}</p>
        <div className="card-footer">
          <span>Ver mais</span><ArrowRight size={17} />
        </div>
      </div>
    </button>
  );
}

export function ProductCard({ product }: { product: any }) { 
  const openWhatsApp = (e: any) => {
    e.stopPropagation();
    const phone = product.feirante_whatsapp?.replace(/\D/g, '');
    if (phone) {
      window.open(`https://wa.me/${phone}?text=Olá, vi seu produto ${encodeURIComponent(product.nome)} no Achei na Feira!`, '_blank');
    }
  };

  return (
    <article className="product-card">
      <div className="product-image" style={product.imagem_url ? { backgroundImage: `url(${getImageUrl(product.imagem_url)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: '#e2e8f0' }}>
        <button aria-label="Favoritar"><Heart size={17} /></button>
      </div>
      <div className="product-content">
        <span className="tag">{product.categoria}</span>
        <h3>{product.nome}</h3>
        <p>{product.feirante_nome}</p>
        <strong>R$ {product.preco}</strong>
        {product.feirante_whatsapp && (
          <Button variant="soft" onClick={openWhatsApp} style={{marginTop: 10, width: '100%', display: 'flex', justifyContent: 'center', gap: 5, padding: '8px 0'}}>
            Contatar via WhatsApp
          </Button>
        )}
      </div>
    </article>
  );
}

export function Shell({ children }: { children: React.ReactNode }) { 
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <main>{children}</main>
      <footer>
        <Logo />
        <span>Os melhores produtos, perto de você.</span>
        <div>
          <button onClick={() => navigate('/feiras')}>Encontrar feiras</button>
        </div>
      </footer>
    </>
  );
}

export function DashboardNav({ role }: { role: 'feirante' | 'organizador' }) { 
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <aside className="dashboard-nav">
      <Logo />
      <div className="user-chip">
        <div className="avatar">{user.nome?.charAt(0) || 'A'}</div>
        <div>
          <b>{user.nome || 'Usuário'}</b>
          <small>{role === 'feirante' ? 'Feirante' : 'Organizador'}</small>
        </div>
      </div>
      <nav>
        <button className="active" onClick={() => navigate(`/${role}`)}><Home size={17} /> Visão geral</button>
        <button onClick={() => navigate(role === 'feirante' ? '/novo-produto' : '/nova-feira')}>
          <Plus size={17} /> {role === 'feirante' ? 'Novo produto' : 'Nova feira'}
        </button>
      </nav>
      <button className="dashboard-exit" onClick={logout}>Sair da conta</button>
    </aside>
  );
}
