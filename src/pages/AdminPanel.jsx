import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/AdminPanel.css';

const API = 'http://localhost:5000/api';

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
  { icon: '🎥', label: 'GymAI Videos', path: '/admin-gymai' },
];

function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const tok = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !tok) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_admin');
    localStorage.removeItem('ajwaHub_adminToken');
    navigate('/login');
  };

  const thisMonth = users.filter(u => {
    const d = new Date(u.createdAt), now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-logo">
          <img src="/LOGO.jpeg" alt="logo" className="sidebar-logo-img" />
          {sidebarOpen && <span className="sidebar-logo-text">AjwaHub</span>}
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
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

      {/* MAIN */}
      <div className="dashboard-main">
        <header className="topbar">
          <button className="topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <h1 className="topbar-title">Dashboard</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin">👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content">

          {/* WELCOME */}
          <div className="welcome-card">
            <div className="welcome-left">
              <h2>Welcome back, {admin?.name?.split(' ')[0]} 👋</h2>
              <p>Here's what's happening with your store today.</p>
            </div>
            <div className="welcome-right">
              <span className="welcome-time">{timeStr}</span>
              <span className="welcome-date">{dateStr}</span>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card" onClick={() => navigate('/panel/users')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">👥</div>
              <div>
                <h2>{users.length}</h2>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigate('/panel/users')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">📅</div>
              <div>
                <h2>{thisMonth}</h2>
                <p>New This Month</p>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon">🟢</div>
              <div>
                <h2>Online</h2>
                <p>Server Status</p>
              </div>
            </div>
          </div>



        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
