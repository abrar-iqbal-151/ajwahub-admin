import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/AdminPanel.css';
import '../css/Admin_Wishlist.css';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const menuItems = [
  { icon: '🏠', label: 'Dashboard', path: '/panel' },
  { icon: '👥', label: 'Users', path: '/panel/users' },
  { icon: '🎬', label: 'Description Editor', path: '/description' },
  { icon: '🏡', label: 'Home Editor', path: '/home-editor' },
  { icon: '🛍️', label: 'Products', path: '/admin-products' },
  { icon: '❤️', label: 'Wishlists', path: '/admin-wishlist' },
  { icon: '🎁', label: 'Gift Orders', path: '/admin-gift-orders' },
  { icon: '📦', label: 'Gift Boxes', path: '/admin-gift-boxes' },
  { icon: '📬', label: 'Contact', path: '/admin-contact' },
  { icon: '💳', label: 'Payments', path: '/admin-payments' },
];

function Admin_Wishlist() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('popular');

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const t = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !t) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    setToken(t);
    fetchWishlists(t);
  }, []);

  const deleteProduct = async (productId) => {
    if (!window.confirm('Is product ko sab wishlists se remove karna chahte hain?')) return;
    try {
      await fetch(`${API}/admin/wishlists/product/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWishlists(token);
    } catch {}
  };

  const fetchWishlists = async (t) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/wishlists`, { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      setWishlists(data.wishlists || []);
    } catch {}
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_admin');
    localStorage.removeItem('ajwaHub_adminToken');
    navigate('/login');
  };

  // Popular products — count aur users list
  const productCount = {};
  wishlists.forEach(w => {
    w.products?.forEach(p => {
      if (!productCount[p.id]) productCount[p.id] = { ...p, count: 0, users: [] };
      productCount[p.id].count++;
      productCount[p.id].users.push(w.userName || w.email);
    });
  });
  const popularProducts = Object.values(productCount).sort((a, b) => b.count - a.count);

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
          <button className="sidebar-item sidebar-logout" onClick={handleLogout}>
            <span className="sidebar-icon">🚪</span>
            {sidebarOpen && <span className="sidebar-label">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <button className="topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? '◀' : '▶'}</button>
          <h1 className="topbar-title">❤️ Wishlists</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin">👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content">

          {/* STATS */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div><h2>{wishlists.length}</h2><p>Users with Wishlist</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❤️</div>
              <div><h2>{wishlists.reduce((t, w) => t + (w.products?.length || 0), 0)}</h2><p>Total Wishlist Items</p></div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon">🏆</div>
              <div><h2>{popularProducts[0]?.name || '-'}</h2><p>Most Wishlisted</p></div>
            </div>
          </div>

          {/* TABS */}
          <div className="ah-tabs">
            <button className={`ah-tab ${activeTab === 'popular' ? 'active' : ''}`} onClick={() => setActiveTab('popular')}>🏆 Popular Products</button>
          </div>

          {loading && <div className="panel-loading">Loading...</div>}

          {/* POPULAR PRODUCTS TAB */}
          {!loading && activeTab === 'popular' && (
            <div className="aw-section">
              <h3 className="aw-heading">Most Wishlisted Products</h3>
              {popularProducts.length === 0 ? (
                <div className="aw-empty">No wishlist data yet</div>
              ) : (
                <div className="aw-popular-list">
                  {popularProducts.map((p, i) => (
                    <div key={p.id} className="aw-popular-item">
                      <div className="aw-popular-top">
                        <div className="aw-rank">{i + 1}</div>
                        <img src={p.image?.startsWith('/') ? `http://localhost:5173${p.image}` : p.image} alt={p.name} className="aw-product-img" onError={e => { e.target.style.opacity='0.3'; e.target.src='/placeholder.png'; }} />
                        <div className="aw-product-info">
                          <h4>{p.name}</h4>
                          <span className="aw-product-price">PKR {p.price}</span>
                        </div>
                        <div className="aw-count-badge">
                          <span>❤️ {p.count}</span>
                          <small>{p.count === 1 ? 'user' : 'users'}</small>
                        </div>
                        <button className="aw-delete-btn" onClick={() => deleteProduct(p.id)} title="Remove from all wishlists">🗑️</button>
                        <div className="aw-bar-wrap">
                          <div className="aw-bar" style={{ width: `${(p.count / popularProducts[0].count) * 100}%` }} />
                        </div>
                      </div>
                      <div className="aw-users-row">
                        {p.users.map((name, j) => (
                          <span key={j} className="aw-user-chip">👤 {name}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}



        </div>
      </div>
    </div>
  );
}

export default Admin_Wishlist;
