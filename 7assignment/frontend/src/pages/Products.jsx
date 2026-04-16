import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-ratings.average', label: 'Top Rated' },
  { value: '-sold', label: 'Best Selling' },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [brands, setBrands]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const page     = Number(params.get('page')) || 1;
  const sort     = params.get('sort') || '-createdAt';
  const search   = params.get('search') || '';
  const category = params.get('category') || '';
  const brand    = params.get('brand') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const featured = params.get('featured') || '';
  const trending = params.get('trending') || '';

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProducts({ search, category, brand, minPrice, maxPrice, sort, page, limit: 12, featured, trending });
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
      setBrands(data.brands);
      setCategories(data.categories);
    } catch {}
    setLoading(false);
  }, [search, category, brand, minPrice, maxPrice, sort, page, featured, trending]);

  useEffect(() => { fetch(); }, [fetch]);

  const set = (key, val) => {
    const p = new URLSearchParams(params);
    if (val) p.set(key, val); else p.delete(key);
    p.set('page', '1');
    setParams(p);
  };

  const clearFilters = () => setParams({});

  const hasFilters = category || brand || minPrice || maxPrice || featured || trending;

  return (
    <div style={{ paddingTop: 80 }} className="page-enter">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {search ? `Results for "${search}"` : featured ? 'Featured Products' : trending ? 'Trending Now' : 'All Products'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{total} products found</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {hasFilters && (
              <button onClick={clearFilters} className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}>
                <X size={14} /> Clear Filters
              </button>
            )}
            <select value={sort} onChange={e => set('sort', e.target.value)} className="form-control" style={{ width: 'auto' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => setFilterOpen(o => !o)} className="btn btn-outline btn-sm">
              <SlidersHorizontal size={15} /> Filters
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Filter Panel */}
          {filterOpen && (
            <aside style={{ width: 240, flexShrink: 0 }}>
              <div className="card" style={{ padding: '1.25rem', position: 'sticky', top: 90 }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Filters</h3>

                {/* Category */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Category</p>
                  {categories.map(c => (
                    <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input type="checkbox" checked={category.includes(c)} onChange={e => {
                        const curr = category ? category.split(',') : [];
                        const next = e.target.checked ? [...curr, c] : curr.filter(x => x !== c);
                        set('category', next.join(','));
                      }} style={{ accentColor: 'var(--accent)' }} />
                      {c}
                    </label>
                  ))}
                </div>

                {/* Brand */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Brand</p>
                  {brands.map(b => (
                    <label key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input type="checkbox" checked={brand.includes(b)} onChange={e => {
                        const curr = brand ? brand.split(',') : [];
                        const next = e.target.checked ? [...curr, b] : curr.filter(x => x !== b);
                        set('brand', next.join(','));
                      }} style={{ accentColor: 'var(--accent)' }} />
                      {b}
                    </label>
                  ))}
                </div>

                {/* Price */}
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Price Range</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" placeholder="Min" value={minPrice} onChange={e => set('minPrice', e.target.value)} className="form-control" style={{ width: '50%' }} />
                    <input type="number" placeholder="Max" value={maxPrice} onChange={e => set('maxPrice', e.target.value)} className="form-control" style={{ width: '50%' }} />
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Products */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div className="products-grid">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="card" style={{ overflow: 'hidden' }}>
                    <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                    <div style={{ padding: '1rem' }}>
                      <div className="skeleton" style={{ height: 12, marginBottom: 8, width: '60%' }} />
                      <div className="skeleton" style={{ height: 16, marginBottom: 12 }} />
                      <div className="skeleton" style={{ height: 28 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</p>
                <p style={{ fontSize: '1.1rem' }}>No products found</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '3rem' }}>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => set('page', p)}
                    className={`btn ${p === page ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  >{p}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}