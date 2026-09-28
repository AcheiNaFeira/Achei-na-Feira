import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchBar, Shell, MarketCard, ProductCard } from '../components/Shared';
import api from '../api';

export function Listing({ productsOnly = false }: { productsOnly?: boolean }) { 
  const [items, setItems] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estado de URL: mantém o histórico de filtros e permite navegação direta
  const busca = searchParams.get('busca') || '';
  const categoria = searchParams.get('categoria') || '';
  const cidade = searchParams.get('cidade') || '';

  // Efeito disparado sempre que os filtros (URL) mudam
  // RF07 e RNF02: Motor de Busca Inteligente / Sistema de Filtros
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const endpoint = productsOnly ? '/produtos' : '/feiras';
        
        // Passa os parâmetros de busca para o backend
        const params = new URLSearchParams();
        if (busca) params.append(productsOnly ? 'busca' : 'cidade', busca); 
        if (categoria) params.append('categoria', categoria);
        if (cidade) params.append('cidade', cidade);

        const res = await api.get(`${endpoint}?${params.toString()}`);
        setItems(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchItems();
  }, [productsOnly, busca, categoria, cidade]);

  const setFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  // We handle frontend filter for name if backend doesn't filter by name for feiras
  const filtered = items.filter((item: any) => 
    !productsOnly ? item.nome.toLowerCase().includes(busca.toLowerCase()) : true
  );

  return (
    <Shell>
      <section className="page-head">
        <div>
          <span className="kicker">{productsOnly ? 'CATÁLOGO LOCAL' : 'DESCUBRA NA SUA CIDADE'}</span>
          <h1>{productsOnly ? 'Produtos perto de você' : 'Feiras próximas'}</h1>
        </div>
        <SearchBar onSearch={(val) => setFilter('busca', val)} initialValue={busca} />
      </section>
      
      <div className="filter-row" style={{display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10}}>
        {!productsOnly && (
          <select 
            className="button button-soft" 
            value={cidade} 
            onChange={e => setFilter('cidade', e.target.value)}
            style={{padding: '8px 12px', border: 'none', background: '#dbe4da', borderRadius: 8, cursor: 'pointer', outline: 'none'}}
          >
            <option value="">Todas as Cidades</option>
            <option value="Joinville">Joinville</option>
            <option value="Araquari">Araquari</option>
            <option value="Garuva">Garuva</option>
          </select>
        )}
        
        {productsOnly && (
          <select 
            className="button button-outline" 
            value={categoria} 
            onChange={e => setFilter('categoria', e.target.value)}
            style={{padding: '8px 12px', borderRadius: 8, cursor: 'pointer', outline: 'none'}}
          >
            <option value="">Todas as Categorias</option>
            <option value="Frutas & Verduras">Frutas & Verduras</option>
            <option value="Orgânicos">Orgânicos</option>
            <option value="Artesanato">Artesanato</option>
            <option value="Flores">Flores</option>
            <option value="Alimentos">Alimentos</option>
            <option value="Laticínios">Laticínios</option>
            <option value="Colecionáveis">Colecionáveis</option>
            <option value="Roupas">Roupas</option>
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={{padding: '40px 0', textAlign: 'center', color: '#666'}}>
          Nenhum resultado encontrado para estes filtros.
        </div>
      ) : (
        <div className={`${productsOnly ? 'product-grid' : 'market-grid'} listing-grid`}>
          {filtered.map((item: any) => 
            productsOnly 
              ? <ProductCard key={item.id} product={item} /> 
              : <MarketCard key={item.id} market={item} onClick={() => navigate(`/feira/${item.id}`)} />
          )}
        </div>
      )}
    </Shell>
  );
}
