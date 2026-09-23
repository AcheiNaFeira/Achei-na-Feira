import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, ListFilter, MapPin } from 'lucide-react';
import { Button, MarketCard, ProductCard, SearchBar, Shell } from '../components/Shared';
import api from '../api';

export function Listing({ productsOnly = false }: { productsOnly?: boolean }) { 
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const endpoint = productsOnly ? '/produtos' : '/feiras';
    api.get(endpoint).then(res => setItems(res.data)).catch(console.error);
  }, [productsOnly]);

  const filtered = items.filter((item: any) => 
    item.nome.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Shell>
      <section className="page-head">
        <div>
          <span className="kicker">{productsOnly ? 'CATÁLOGO LOCAL' : 'DESCUBRA NA SUA CIDADE'}</span>
          <h1>{productsOnly ? 'Produtos perto de você' : 'Feiras próximas'}</h1>
        </div>
        <SearchBar onSearch={setQuery} />
      </section>
      
      <div className="filter-row">
        <Button variant="soft"><MapPin size={16} /> Joinville <ChevronDown size={15} /></Button>
        <Button variant="outline"><CalendarDays size={16} /> Quando? <ChevronDown size={15} /></Button>
        <Button variant="outline"><ListFilter size={16} /> Filtros</Button>
      </div>

      <div className={`${productsOnly ? 'product-grid' : 'market-grid'} listing-grid`}>
        {filtered.map((item: any) => 
          productsOnly ? <ProductCard key={item.id} product={item} /> : <MarketCard key={item.id} market={item} onClick={() => navigate(`/feira/${item.id}`)} />
        )}
      </div>
    </Shell>
  );
}

function ChevronDown({ size }: { size: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg> }
