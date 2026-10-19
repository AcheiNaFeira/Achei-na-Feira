import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchBar, Shell, MarketCard, ProductCard } from '../components/Shared';
import api from '../api';

const extractCityFromLocal = (localStr: string): string | null => {
  if (!localStr) return null;
  const dashSlashMatch = localStr.match(/-\s*([^/,-]+)\s*\//);
  if (dashSlashMatch?.[1]) return dashSlashMatch[1].trim();
  const slashMatch = localStr.match(/^([^/,-]+)\s*\//);
  if (slashMatch?.[1]) return slashMatch[1].trim();
  return null;
};

export function Listing({ productsOnly = false }: { productsOnly?: boolean }) { 
  const [items, setItems] = useState<any[]>([]);
  const [feirasAtivas, setFeirasAtivas] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estado de URL: mantém o histórico de filtros e permite navegação direta
  const busca = searchParams.get('busca') || '';
  const categoria = searchParams.get('categoria') || '';
  const cidade = searchParams.get('cidade') || '';
  const feiraId = searchParams.get('feira_id') || '';

  useEffect(() => {
    api.get('/feiras').then(res => setFeirasAtivas(res.data || [])).catch(() => {});
  }, []);

  const cidadesDisponiveis = useMemo(() => {
    const base = new Set<string>(['Joinville', 'Araquari', 'Garuva']);
    feirasAtivas.forEach((f: any) => {
      const c = extractCityFromLocal(f.local) || extractCityFromLocal(f.endereco_completo);
      if (c) base.add(c);
    });
    return Array.from(base).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [feirasAtivas]);

  // Efeito disparado sempre que os filtros (URL) mudam
  // RF07 e RNF02: Motor de Busca Inteligente / Sistema de Filtros
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const endpoint = productsOnly ? '/produtos' : '/feiras';
        
        const params = new URLSearchParams();
        if (busca) params.append('busca', busca);
        if (categoria) params.append('categoria', categoria);
        if (cidade) params.append('cidade', cidade);
        if (productsOnly && feiraId) params.append('feira_id', feiraId);

        const res = await api.get(`${endpoint}?${params.toString()}`);
        setItems(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchItems();
  }, [productsOnly, busca, categoria, cidade, feiraId]);

  const setFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const limparFiltros = () => {
    setSearchParams(new URLSearchParams());
  };

  const temFiltroAtivo = Boolean(busca || categoria || cidade || feiraId);

  return (
    <Shell>
      <section className="page-head">
        <div>
          <span className="kicker">{productsOnly ? 'CATÁLOGO LOCAL' : 'DESCUBRA NA SUA CIDADE'}</span>
          <h1>{productsOnly ? 'Produtos perto de você' : 'Feiras próximas'}</h1>
        </div>
        <SearchBar onSearch={(val) => setFilter('busca', val)} initialValue={busca} />
      </section>
      
      <div className="filter-row" style={{display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10, alignItems: 'center', flexWrap: 'wrap'}}>
        <select 
          className="button button-soft" 
          value={cidade} 
          onChange={e => setFilter('cidade', e.target.value)}
          style={{padding: '8px 12px', border: 'none', background: '#dbe4da', borderRadius: 8, cursor: 'pointer', outline: 'none'}}
        >
          <option value="">Todas as Cidades</option>
          {cidadesDisponiveis.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        
        {productsOnly && (
          <>
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

            <select 
              className="button button-outline" 
              value={feiraId} 
              onChange={e => setFilter('feira_id', e.target.value)}
              style={{padding: '8px 12px', borderRadius: 8, cursor: 'pointer', outline: 'none'}}
            >
              <option value="">Todas as Feiras</option>
              {feirasAtivas.map((f: any) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </>
        )}

        {temFiltroAtivo && (
          <button
            type="button"
            onClick={limparFiltros}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', padding: '4px 8px' }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div style={{padding: '40px 0', textAlign: 'center', color: '#666'}}>
          Nenhum resultado encontrado para estes filtros.
        </div>
      ) : (
        <div className={`${productsOnly ? 'product-grid' : 'market-grid'} listing-grid`}>
          {items.map((item: any) => 
            productsOnly 
              ? <ProductCard key={item.id} product={item} /> 
              : <MarketCard key={item.id} market={item} onClick={() => navigate(`/feira/${item.id}`)} />
          )}
        </div>
      )}
    </Shell>
  );
}
