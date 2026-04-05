import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/AdminPanel.css';
import '../css/Admin_Contact.css';

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
];

function Admin_Contact() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState({ location: '', phone: '', email: '', hours: '', easypaisaNumber: '', jazzcashNumber: '', easypaisaName: '', jazzcashName: '' });
  const [editSettings, setEditSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ location: '', phone: '', email: '', hours: '', easypaisaNumber: '', jazzcashNumber: '', easypaisaName: '', jazzcashName: '' });
  const [settingsMsg, setSettingsMsg] = useState('');
  const [editPayment, setEditPayment] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState('');

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const t = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !t) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    setToken(t);
    fetchMessages(t);
    fetch(`${API}/settings`).then(r => r.json()).then(d => { if (d.settings) { setSettings(d.settings); setSettingsForm(d.settings); } }).catch(() => {});
  }, []);

  const saveSettings = async () => {
    try {
      const res = await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (res.ok) { setSettings(data.settings); setEditSettings(false); setEditPayment(false); setSettingsMsg('✅ Saved!'); setPaymentMsg('✅ Saved!'); setTimeout(() => { setSettingsMsg(''); setPaymentMsg(''); }, 3000); }
    } catch {}
  };

  const fetchMessages = async (t) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/contact`, { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {}
    setLoading(false);
  };

  const markRead = async (id) => {
    try {
      await fetch(`${API}/contact/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      setMessages(messages.map(m => m._id === id ? { ...m, read: true } : m));
    } catch {}
  };

  const deleteMsg = async (id) => {
    if (!window.confirm('Is message ko delete karna chahte hain?')) return;
    try {
      await fetch(`${API}/contact/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setMessages(messages.filter(m => m._id !== id));
    } catch {}
  };

  const handleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
    const msg = messages.find(m => m._id === id);
    if (msg && !msg.read) markRead(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_admin');
    localStorage.removeItem('ajwaHub_adminToken');
    navigate('/login');
  };

  const filtered = messages.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const unread = messages.filter(m => !m.read).length;

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
          <h1 className="topbar-title">📬 Contact Messages</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin">👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content">
          {/* STATS */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card"><div className="stat-icon">📬</div><div><h2>{messages.length}</h2><p>Total Messages</p></div></div>
            <div className="stat-card"><div className="stat-icon">🔴</div><div><h2>{unread}</h2><p>Unread</p></div></div>
            <div className="stat-card green"><div className="stat-icon">✅</div><div><h2>{messages.length - unread}</h2><p>Read</p></div></div>
          </div>

          {/* SETTINGS CARD */}
          <div className="acm-settings-card">
            <div className="acm-settings-header">
              <h3>📍 Contact Info</h3>
              {settingsMsg && <span className="acm-settings-msg">{settingsMsg}</span>}
              {!editSettings
                ? <button className="acm-edit-btn" onClick={() => setEditSettings(true)}>✏️ Edit</button>
                : <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="acm-save-btn" onClick={saveSettings}>💾 Save</button>
                    <button className="acm-cancel-btn" onClick={() => { setEditSettings(false); setSettingsForm(settings); }}>Cancel</button>
                  </div>
              }
            </div>
            {editSettings ? (
              <div className="acm-settings-form">
                {[['location', '📍 Location'], ['phone', '📞 Phone'], ['email', '✉️ Email'], ['hours', '🕐 Hours']].map(([key, label]) => (
                  <div key={key} className="acm-settings-field">
                    <label>{label}</label>
                    <input value={settingsForm[key]} onChange={e => setSettingsForm({ ...settingsForm, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="acm-settings-view">
                {[['📍', 'Location', settings.location], ['📞', 'Phone', settings.phone], ['✉️', 'Email', settings.email], ['🕐', 'Hours', settings.hours]].map(([icon, label, val]) => (
                  <div key={label} className="acm-info-chip">
                    <span className="acm-chip-icon">{icon}</span>
                    <div><span className="acm-chip-label">{label}</span><span className="acm-chip-val">{val}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TOOLBAR */}
          <div className="ap-toolbar" style={{ marginBottom: '16px' }}>
            <input className="search-input" placeholder="🔍 Search by name, email, subject..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="ap-count">{filtered.length} Messages</span>
          </div>

          {loading && <div className="panel-loading">Loading...</div>}

          {!loading && filtered.length === 0 && (
            <div className="acm-empty">No messages yet</div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="acm-list">
              {filtered.map(msg => (
                <div key={msg._id} className={`acm-card ${!msg.read ? 'unread' : ''}`}>
                  <div className="acm-header" onClick={() => handleExpand(msg._id)}>
                    <div className="acm-header-left">
                      <div className="acm-avatar">{msg.name.charAt(0).toUpperCase()}</div>
                      <div className="acm-meta">
                        <span className="acm-name">{msg.name} {!msg.read && <span className="acm-unread-dot" />}</span>
                        <span className="acm-email">{msg.email}</span>
                      </div>
                      <span className="acm-subject">{msg.subject || '(No subject)'}</span>
                    </div>
                    <div className="acm-header-right">
                      <span className="acm-date">{new Date(msg.createdAt).toLocaleDateString()}</span>
                      {!msg.read && <span className="acm-badge">New</span>}
                      <span className="acm-arrow">{expanded === msg._id ? '▲' : '▼'}</span>
                      <button className="acm-del-btn" onClick={e => { e.stopPropagation(); deleteMsg(msg._id); }}>🗑️</button>
                    </div>
                  </div>

                  {expanded === msg._id && (
                    <div className="acm-body">
                      <p className="acm-message">{msg.message}</p>
                      <div className="acm-footer">
                        <span className="acm-time">📅 {new Date(msg.createdAt).toLocaleString()}</span>
                        {!msg.read && (
                          <button className="acm-read-btn" onClick={() => markRead(msg._id)}>✓ Mark as Read</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin_Contact;
