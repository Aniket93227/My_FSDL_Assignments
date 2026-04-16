import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useEffect } from 'react';

export default function CartSidebar() {
  const { cart, sidebarOpen, setSidebarOpen, updateItem, removeItem, cartTotal } = useCart();

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 1001, backdropFilter: 'blur(4px)',
        }} />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', right: sidebarOpen ? 0 : '-100%',
        top: 0, height: '100vh', width: 420, maxWidth: '100vw',
        background: 'var(--bg-card)', zIndex: 1002,
        transition: 'right 0.35s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        borderLeft: '1px solid var(--border)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={20} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your Cart</h2>
            <span className="badge badge-accent">{cart.items?.length || 0}</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="btn btn-ghost btn-sm">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {!cart.items?.length ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
              <p>Your cart is empty</p>
              <Link to="/products" onClick={() => setSidebarOpen(false)} className="btn btn-primary" style={{ marginTop: 16 }}>Shop Now</Link>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.product?._id || item._id} style={{ display: 'flex', gap: 12, padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                <img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/80'} alt={item.product?.name}
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, background: 'var(--bg-secondary)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.product?.name}
                  </p>
                  <p className="mono" style={{ color: 'var(--accent-light)', fontSize: '0.9rem', marginBottom: 8 }}>
                    ₹{item.price?.toLocaleString()}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => item.quantity > 1 ? updateItem(item.product?._id, item.quantity - 1) : removeItem(item.product?._id)}
                      className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', minWidth: 28 }}>
                      <Minus size={13} />
                    </button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateItem(item.product?._id, item.quantity + 1)}
                      className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', minWidth: 28 }}>
                      <Plus size={13} />
                    </button>
                    <button onClick={() => removeItem(item.product?._id)} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', color: 'var(--red)' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.items?.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{cartTotal.toLocaleString()}</span>
            </div>
            <Link to="/checkout" onClick={() => setSidebarOpen(false)} className="btn btn-primary btn-full btn-lg">
              Proceed to Checkout
            </Link>
            <Link to="/cart" onClick={() => setSidebarOpen(false)} className="btn btn-outline btn-full" style={{ marginTop: 8 }}>
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}