import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, Zap, LogOut, Settings, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, setSidebarOpen } = useCart();
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [search, setSearch]         = useState('');
  const [dropdownOpen, setDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: 70 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ background: 'var(--accent)', borderRadius: 8, padding: '4px 6px', display: 'flex' }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Volt<span style={{ color: 'var(--accent-light)' }}>Store</span>
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480, display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text" placeholder="Search phones, laptops, TVs..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: 40, background: 'var(--bg-secondary)', height: 42 }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem' }}>
            <Search size={16} />
          </button>
        </form>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to="/products" className="btn btn-ghost" style={{ fontSize: '0.9rem' }}>Shop</Link>

          {/* Cart */}
          <button onClick={() => setSidebarOpen(true)} className="btn btn-ghost" style={{ position: 'relative' }}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                background: 'var(--accent)', color: 'white',
                fontSize: '0.65rem', fontWeight: 700,
                borderRadius: '50%', width: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartCount}</span>
            )}
          </button>

          {/* Wishlist */}
          {user && (
            <Link to="/wishlist" className="btn btn-ghost">
              <Heart size={20} />
            </Link>
          )}

          {/* User menu */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setDropdown(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 700, color: 'white',
                }}>
                  {user.name[0].toUpperCase()}
                </div>
              </button>
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '0.5rem', minWidth: 180,
                  boxShadow: 'var(--shadow)', zIndex: 100,
                }}>
                  <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.4rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{user.email}</p>
                  </div>
                  {[
                    { to: '/profile', icon: <Settings size={15} />, label: 'Profile' },
                    { to: '/orders', icon: <Package size={15} />, label: 'Orders' },
                    ...(user.role === 'admin' ? [{ to: '/admin', icon: <Zap size={15} />, label: 'Admin' }] : []),
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setDropdown(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.5rem 1rem', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {item.icon}{item.label}
                    </Link>
                  ))}
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.4rem 0' }} />
                  <button onClick={() => { logout(); setDropdown(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.5rem 1rem', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', borderRadius: 8, fontFamily: 'Syne, sans-serif' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
          )}
        </nav>
      </div>
    </header>
  );
}