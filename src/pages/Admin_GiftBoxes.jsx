import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/AdminPanel.css';
import '../css/Admin_Product.css';

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

const tagOptions = ['Bestseller', 'Popular', 'New', 'Premium', 'Healthy', 'Luxury', 'Elite', '🎁 Special'];
const emptyBox = { name: '', price: '', image: '', description: '', maxItems: 1, itemType: 'dates & dry fruits', tag: 'New' };

// ── Outside component to prevent re-mount on every keystroke ──
function BoxForm({ box, onChange, onSave, onCancel, isNew, onUpload }) {
  return (
    <div className="ap-edit">
      {!isNew && box.image && (
        <img
          src={box.image.startsWith('/') ? `http://localhost:5173${box.image}` : box.image}
          alt={box.name} className="ap-img"
          onError={e => e.target.style.display = 'none'}
        />
      )}
      <label>Name</label>
      <input value={box.name} onChange={e => onChange('name', e.target.value)} placeholder="e.g. Classic Date Box" />
      <label>Price (PKR)</label>
      <input type="number" value={box.price} onChange={e => onChange('price', e.target.value)} placeholder="e.g. 1200" />
      <label>Max Items</label>
      <input type="number" min="1" max="10" value={box.maxItems} onChange={e => onChange('maxItems', e.target.value)} />
      <label>Image Path</label>
      <input value={box.image} onChange={e => onChange('image', e.target.value)} placeholder="e.g. /Gift 1.png" />
      <label className="ap-upload-label">
        📤 Upload Image
        <input type="file" accept="image/*" style={{ display: 'none' }}
          onChange={async e => { const f = e.target.files[0]; if (f) onUpload(f); }}
        />
      </label>
      {box.image && (
        <img
          src={box.image.startsWith('/') ? `http://localhost:5173${box.image}` : box.image}
          alt="preview"
          style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginTop: '4px' }}
          onError={e => e.target.style.display = 'none'}
        />
      )}
      <label>Description</label>
      <textarea rows={2} value={box.description} onChange={e => onChange('description', e.target.value)} placeholder="Short description..." />
      <label>Item Type</label>
      <select style={{ background: '#1f2937', border: '1px solid #374151', color: '#e5e7eb', padding: '8px 10px', borderRadius: '8px', fontSize: '13px', width: '100%' }}
        value={box.itemType} onChange={e => onChange('itemType', e.target.value)}>
        <option value="dates">Dates</option>
        <option value="dry fruits">Dry Fruits</option>
        <option value="dates & dry fruits">Dates & Dry Fruits</option>
      </select>
      <label>Tag</label>
      <select style={{ background: '#1f2937', border: '1px solid #374151', color: '#e5e7eb', padding: '8px 10px', borderRadius: '8px', fontSize: '13px', width: '100%' }}
        value={box.tag} onChange={e => onChange('tag', e.target.value)}>
        {tagOptions.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <div className="ap-btns">
        <button className="ap-save" onClick={onSave}>{isNew ? '➕ Add Box' : '💾 Save'}</button>
        <button className="ap-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function Admin_GiftBoxes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [editBox, setEditBox] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBox, setNewBox] = useState(emptyBox);

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const t = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !t) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    setToken(t);
    fetchBoxes();
  }, []);

  const fetchBoxes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/gift-boxes`);
      const data = await res.json();
      setBoxes(data.boxes || []);
    } catch {}
    setLoading(false);
  };

  const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const uploadImage = async (file, callback) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok) callback(data.path);
  };

  const initializeBoxes = async () => {
    const res = await fetch(`${API}/gift-boxes/initialize`, { method: 'POST', headers: authHeaders() });
    const data = await res.json();
    showMsg(data.message === 'already exists' ? '⚠️ Already initialized!' : '✅ Default boxes added!');
    fetchBoxes();
  };

  const saveBox = async () => {
    const res = await fetch(`${API}/gift-boxes/${editBox._id}`, {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({ ...editBox, price: Number(editBox.price), maxItems: Number(editBox.maxItems) })
    });
    if (res.ok) { setBoxes(boxes.map(b => b._id === editBox._id ? editBox : b)); setEditBox(null); showMsg('✅ Gift box updated!'); }
    else showMsg('❌ Failed to update');
  };

  const addBox = async () => {
    if (!newBox.name || !newBox.price) return showMsg('⚠️ Name aur Price required hai');
    const res = await fetch(`${API}/gift-boxes`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ ...newBox, price: Number(newBox.price), maxItems: Number(newBox.maxItems) })
    });
    if (res.ok) { showMsg('✅ Gift box added!'); setShowAddForm(false); setNewBox(emptyBox); fetchBoxes(); }
    else showMsg('❌ Failed to add');
  };

  const deleteBox = async (id) => {
    if (!window.confirm('Is gift box ko delete karna chahte hain?')) return;
    const res = await fetch(`${API}/gift-boxes/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) { setBoxes(boxes.filter(b => b._id !== id)); showMsg('✅ Deleted!'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_admin');
    localStorage.removeItem('ajwaHub_adminToken');
    navigate('/login');
  };

  const filtered = boxes.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

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
          <h1 className="topbar-title">📦 Gift Boxes</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin">👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content">
          {msg && <div className="ap-msg">{msg}</div>}

          {boxes.length === 0 && !loading && (
            <div style={{ background: '#111827', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '14px', padding: '30px', textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ color: '#9ca3af', marginBottom: '16px' }}>Database mein koi gift box nahi. Default boxes initialize karo.</p>
              <button className="ap-save" style={{ width: 'auto', padding: '10px 24px' }} onClick={initializeBoxes}>🚀 Initialize Default Boxes</button>
            </div>
          )}

          <div className="ap-toolbar">
            <input className="search-input" placeholder="🔍 Search gift boxes..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="ap-count">{filtered.length} Boxes</span>
            <button className="ap-save" style={{ width: 'auto', padding: '8px 18px' }} onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? '✕ Cancel' : '➕ Add Gift Box'}
            </button>
          </div>

          {showAddForm && (
            <div className="ap-add-form">
              <h3>Add New Gift Box</h3>
              <div className="ap-add-grid">
                <BoxForm
                  box={newBox}
                  onChange={(field, val) => setNewBox(prev => ({ ...prev, [field]: val }))}
                  onSave={addBox}
                  onCancel={() => { setShowAddForm(false); setNewBox(emptyBox); }}
                  isNew={true}
                  onUpload={file => uploadImage(file, path => setNewBox(prev => ({ ...prev, image: path })))}
                />
              </div>
            </div>
          )}

          {loading ? <div className="panel-loading">Loading...</div> : (
            <div className="ap-grid">
              {filtered.map(box => (
                <div key={box._id} className="ap-card">
                  {editBox?._id === box._id ? (
                    <BoxForm
                      box={editBox}
                      onChange={(field, val) => setEditBox(prev => ({ ...prev, [field]: val }))}
                      onSave={saveBox}
                      onCancel={() => setEditBox(null)}
                      isNew={false}
                      onUpload={file => uploadImage(file, path => setEditBox(prev => ({ ...prev, image: path })))}
                    />
                  ) : (
                    <div className="ap-view">
                      <img src={box.image?.startsWith('/') ? `http://localhost:5173${box.image}` : box.image} alt={box.name} className="ap-img" onError={e => e.target.style.display = 'none'} />
                      <h4>{box.name}</h4>
                      <div className="ap-meta">
                        <span className="ap-price">PKR {Number(box.price).toLocaleString()}</span>
                        <span className="ap-discount">{box.tag}</span>
                        <span style={{ color: '#9ca3af', fontSize: '13px' }}>🎁 {box.maxItems} item{box.maxItems > 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button className="ap-edit-btn" style={{ flex: 1 }} onClick={() => setEditBox({ ...box })}>✏️ Edit</button>
                        <button className="ap-cancel" style={{ flex: 'none', padding: '7px 12px' }} onClick={() => deleteBox(box._id)}>🗑️</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ color: '#4b5563', textAlign: 'center', padding: '60px', gridColumn: '1/-1' }}>
                  Koi gift box nahi. ➕ Add Gift Box se banao.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin_GiftBoxes;
