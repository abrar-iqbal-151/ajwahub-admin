import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/AdminPanel.css';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const menuItems = [
  { icon: '🏠', label: 'Dashboard', path: '/panel' },
  { icon: '👥', label: 'Users', path: '/panel/users' },
  { icon: '🎬', label: 'Description Editor', path: '/description' },
  { icon: '🏡', label: 'Home Editor', path: '/home-editor' },
  { icon: '🛍️', label: 'Products', path: '/admin-products' },
  { icon: '👑', label: 'Premium', path: '/admin-premium' },
  { icon: '❤️', label: 'Wishlists', path: '/admin-wishlist' },
  { icon: '🌟', label: 'Ratings', path: '/admin-ratings' },
  { icon: '🎁', label: 'Gift Orders', path: '/admin-gift-orders' },
  { icon: '📦', label: 'Gift Boxes', path: '/admin-gift-boxes' },
  { icon: '💳', label: 'Payments', path: '/admin-payments' },
];

function Admin_Ratings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const t = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !t) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    setToken(t);
    fetchRatings(t);
  }, []);

  const fetchRatings = async (authToken) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/ratings`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setRatings(data.ratings);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rating?')) return;
    try {
      const res = await fetch(`${API}/ratings/${id}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) {
        setRatings(ratings.filter(r => r._id !== id));
        showMsg('🗑️ Deleted');
      }
    } catch { showMsg('❌ Error deleting'); }
  };

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < count ? '#fbbf24' : '#4b5563', fontSize: '1.2rem' }}>★</span>
    ));
  };

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-logo">
          <img src="/LOGO.jpeg" alt="logo" className="sidebar-logo-img" />
          {sidebarOpen && <span className="sidebar-logo-text">AjwaHub</span>}
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button key={item.path} className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
              <span className="sidebar-icon">{item.icon}</span>
              {sidebarOpen && <span className="sidebar-label">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-item sidebar-logout" onClick={() => { localStorage.removeItem('ajwaHub_admin'); localStorage.removeItem('ajwaHub_adminToken'); navigate('/login'); }}>
            <span className="sidebar-icon">🚪</span>
            {sidebarOpen && <span className="sidebar-label">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <button className="topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? '◀' : '▶'}</button>
          <h1 className="topbar-title">🌟 Product Ratings</h1>
          <div className="topbar-right">{admin && <span className="topbar-admin">👤 {admin.name}</span>}</div>
        </header>

        <div className="dashboard-content">
          {msg && <div className="ap-msg">{msg}</div>}

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', flex: 1, border: '1px solid #374151' }}>
              <h3 style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '5px' }}>Total Ratings</h3>
              <div style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>{ratings.length}</div>
            </div>
            <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', flex: 1, border: '1px solid #374151' }}>
              <h3 style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '5px' }}>Average Score</h3>
              <div style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {ratings.length > 0 
                  ? (ratings.reduce((a, b) => a + b.rating, 0) / ratings.length).toFixed(1) 
                  : '0.0'}
                <span style={{ color: '#fbbf24', fontSize: '22px' }}>★</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#1f2937', borderRadius: '12px', padding: '20px', border: '1px solid #374151' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '18px' }}>Recent Customer Ratings</h2>

            {loading ? (
              <div className="panel-loading">Loading...</div>
            ) : ratings.length === 0 ? (
              <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>No product ratings found yet.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e5e7eb' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #374151', textAlign: 'left' }}>
                      <th style={{ padding: '12px', color: '#9ca3af', fontWeight: '500' }}>Date</th>
                      <th style={{ padding: '12px', color: '#9ca3af', fontWeight: '500' }}>Product</th>
                      <th style={{ padding: '12px', color: '#9ca3af', fontWeight: '500' }}>Rating</th>
                      <th style={{ padding: '12px', color: '#9ca3af', fontWeight: '500' }}>Review Text</th>
                      <th style={{ padding: '12px', color: '#9ca3af', fontWeight: '500' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.map(rating => (
                      <tr key={rating._id} style={{ borderBottom: '1px solid #374151' }}>
                        <td style={{ padding: '16px 12px', color: '#9ca3af' }}>
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px 12px', fontWeight: '600', color: '#fff' }}>
                          {rating.productName || rating.productId || 'General'}
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {renderStars(rating.rating)}
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px', maxWidth: '250px' }}>
                          {rating.reviewText ? (
                            <span style={{ color: '#d1d5db' }}>{rating.reviewText}</span>
                          ) : (
                            <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No written review</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <button 
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => handleDelete(rating._id)}
                            onMouseOver={e => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                            onMouseOut={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin_Ratings;
