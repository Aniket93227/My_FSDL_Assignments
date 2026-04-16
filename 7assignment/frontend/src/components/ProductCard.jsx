import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toggleWishlist } from '../services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ProductCard({ product, wishlistIds = [], onWishlistToggle }) {
  const { addItem, loading } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(wishlistIds.includes(product._id));
  const [imgLoaded, setImgLoaded] = useState(false);

  const discountPercent = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : product.discount;

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login'); return; }
    try {
      await toggleWishlist(product._id);
      setWishlisted(w => !w);
      onWishlistToggle?.();
    } catch {}
  };

  return (
    <div className="card" style={{ cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Image */}
      <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
        <div style={{ position: 'relative', background: 'var(--bg-secondary)', aspectRatio: '4/3', overflow: 'hidden' }}>
          {!imgLoaded && <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />}
          <img
            src={product.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', opacity: imgLoaded ? 1 : 0 }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          {discountPercent > 0 && (
            <span className="badge badge-green" style={{ position: 'absolute', top: 10, left: 10 }}>
              -{discountPercent}%
            </span>
          )}
          {product.featured && (
            <span className="badge badge-gold" style={{ position: 'absolute', top: 10, right: 40, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={11} /> Featured
            </span>
          )}
          {product.stock === 0 && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: '1rem' }}>OUT OF STOCK</span>
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      <button onClick={handleWishlist} style={{
        position: 'absolute', top: 10, right: 10,
        background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer',
        width: 32, height: 32, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)', transition: 'transform 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Heart size={15} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : 'white'} />
      </button>

      {/* Info */}
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-light)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {product.brand}
          </p>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <div className="stars">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={13} fill={s <= Math.round(product.ratings?.average || 0) ? '#f59e0b' : 'none'} color={s <= Math.round(product.ratings?.average || 0) ? '#f59e0b' : '#475569'} />
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({product.ratings?.count || 0})</span>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 'auto' }}>
          <span className="price">₹{product.price.toLocaleString()}</span>
          {product.comparePrice && (
            <span className="price-old">₹{product.comparePrice.toLocaleString()}</span>
          )}
        </div>

        <button
          className="btn btn-primary btn-sm btn-full"
          onClick={() => addItem(product._id)}
          disabled={loading || product.stock === 0}
          style={{ justifyContent: 'center' }}
        >
          <ShoppingCart size={15} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}