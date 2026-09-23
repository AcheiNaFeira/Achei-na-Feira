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
          <button onClick={() => { navigate('/manual'); setOpen(false); }}>Manual</button>
          <button onClick={() => { navigate('/login'); setOpen(false); }} className="nav-login">Entrar</button>
          <Button variant="primary" onClick={() => { navigate('/cadastro'); setOpen(false); }}>Criar conta <ArrowRight size={16} /></Button>
        </nav>
        <button className="mobile-menu" aria-label="Abrir menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}

export function SearchBar({ onSearch }: { onSearch?: (value: string) => void }) { 
  const [value, setValue] = useState(''); 
  return (
    <div className="searchbar">
      <Search size={19} />
      <input placeholder="O que você procura?" value={value} onChange={e => { setValue(e.target.value); onSearch?.(e.target.value); }} />
      <button aria-label="Buscar"><ArrowRight size={18} /></button>
    </div>
  );
}

export function MarketCard({ market, onClick }: { market: any; onClick: () => void }) { 
  return (
    <button className="market-card" onClick={onClick}>
      <div className={`market-image ${market.color || 'mint'}`}>
        <span>🥬</span>
        <small><MapPin size={12} /> {market.local}</small>
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
  return (
    <article className="product-card">
      <div className={`product-image ${product.color || 'tomato'}`}>
        <span>{product.emoji || '📦'}</span>
        <button aria-label="Favoritar"><Heart size={17} /></button>
      </div>
      <div className="product-content">
        <span className="tag">{product.categoria}</span>
        <h3>{product.nome}</h3>
        <p>{product.feirante_nome}</p>
        <strong>R$ {product.preco}</strong>
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
        <span>Comida boa, perto de você.</span>
        <div>
          <button onClick={() => navigate('/feiras')}>Encontrar feiras</button>
          <button onClick={() => navigate('/cadastro')}>Quero vender</button>
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
        <button onClick={() => navigate(role === 'feirante' ? '/catalogo' : '/minhas-feiras')}>
          <Store size={17} /> {role === 'feirante' ? 'Meu catálogo' : 'Minhas feiras'}
        </button>
        <button><Settings size={17} /> Configurações</button>
      </nav>
      <button className="dashboard-exit" onClick={logout}>Sair da conta</button>
    </aside>
  );
}
