import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, ShoppingCart, TrendingUp, ArrowRight } from 'lucide-react';
import { getAdminStats } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats().then(r => setStats(r.data.stats));
  }, []);

  if (!stats) return (
    <div style={{ paddingTop: 100, textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
    </div>
  );

  const STAT_CARDS = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp size={22} />, color: 'var(--accent)' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <ShoppingCart size={22} />, color: 'var(--green)' },
    { label: 'Products', value: stats.totalProducts, icon: <Package size={22} />, color: 'var(--gold)' },
    { label: 'Customers', value: stats.totalUsers, icon: <Users size={22} />, color: '#ec4899' },
  ];

  return (
    <div style={{ paddingTop: 90 }} className="page-enter">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Admin Dashboard</h1>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {STAT_CARDS.map(s => (
            <div key={s.label} className="card" style={{ padding: '1.5rem', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ background: `${s.color}22`, color: s.color, width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { to: '/admin/products', label: 'Manage Products', icon: <Package size={18} /> },
            { to: '/admin/orders',   label: 'Manage Orders',   icon: <ShoppingCart size={18} /> },
            { to: '/admin/users',    label: 'Manage Users',    icon: <Users size={18} /> },
          ].map(link => (
            <Link key={link.to} to={link.to} className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '1rem 1.25rem' }}>
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{link.icon} {link.label}</span>
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Orders</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'Space Mono, monospace', fontSize: '0.78rem', color: 'var(--accent-light)' }}>{order._id.slice(-8)}</td>
                    <td style={{ padding: '10px 12px' }}>{order.user?.name}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'Space Mono, monospace' }}>₹{order.totalPrice?.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge badge-${order.status === 'delivered' ? 'green' : order.status === 'cancelled' ? 'red' : 'accent'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}