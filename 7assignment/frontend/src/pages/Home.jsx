import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, Headphones, ChevronRight } from 'lucide-react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { name: 'Smartphones', icon: '📱', q: 'Smartphones' },
  { name: 'Laptops',     icon: '💻', q: 'Laptops' },
  { name: 'Audio',       icon: '🎧', q: 'Audio' },
  { name: 'TVs',         icon: '📺', q: 'TV' },
  { name: 'Cameras',     icon: '📷', q: 'Cameras' },
  { name: 'Gaming',      icon: '🎮', q: 'Gaming' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    getProducts({ featured: true, limit: 4 }).then(r => setFeatured(r.data.products));
    getProducts({ trending: true, limit: 4 }).then(r => setTrending(r.data.products));
  }, []);

  return (
    <div style={{ paddingTop: 70 }} className="page-enter">
      {/* Hero */}
      <section style={{
        minHeight: '88vh', display: 'flex', alignItems: 'center',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.2) 0%, transparent 70%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="badge badge-accent" style={{ marginBottom: 24, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <Zap size={12} /> New arrivals dropping weekly
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em' }}>
            The Future of<br />
            <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Electronics
            </span>
            <br />is Here.
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Discover cutting-edge gadgets, premium audio, and next-gen devices — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary btn-lg">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/products?featured=true" className="btn btn-outline btn-lg">
              View Featured
            </Link>
          </div>
        </div>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '20%', left: '5%', width: 300, height: 300, background: 'var(--accent-glow)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 200, height: 200, background: 'rgba(245,158,11,0.1)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      </section>

      {/* Categories */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 className="section-title">Browse Categories</h2>
          <p className="section-subtitle">Find what you're looking for</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/products?category=${cat.q}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="card" style={{ padding: '1.5rem 1rem', textAlign: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = ''; }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>{cat.icon}</div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section style={{ padding: '5rem 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 className="section-title">Featured Picks</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Handpicked by our editors</p>
              </div>
              <Link to="/products?featured=true" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {[
              { icon: <Truck size={28} />, title: 'Free Shipping', desc: 'Orders above ₹1000' },
              { icon: <Shield size={28} />, title: 'Secure Payments', desc: 'SSL encrypted checkout' },
              { icon: <Headphones size={28} />, title: '24/7 Support', desc: 'Expert help always' },
              { icon: <Zap size={28} />, title: 'Fast Delivery', desc: '2-5 business days' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ color: 'var(--accent)', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section style={{ padding: '5rem 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 className="section-title">🔥 Trending Now</h2>
                <p style={{ color: 'var(--text-secondary)' }}>What everyone's buying</p>
              </div>
              <Link to="/products?trending=true" className="btn btn-outline">View All <ChevronRight size={16} /></Link>
            </div>
            <div className="products-grid">
              {trending.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}