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
  { icon: '👑', label: 'Premium', path: '/admin-premium' },
  { icon: '❤️', label: 'Wishlists', path: '/admin-wishlist' },
  { icon: '🎁', label: 'Gift Orders', path: '/admin-gift-orders' },
  { icon: '📦', label: 'Gift Boxes', path: '/admin-gift-boxes' },
  { icon: '📬', label: 'Contact', path: '/admin-contact' },
  { icon: '💳', label: 'Payments', path: '/admin-payments' },
  { icon: '🎥', label: 'GymAI Videos', path: '/admin-gymai' },
];

const emptyBox = { name: '', price: '', image: '', innerImage: '', description: '', maxItems: 1 };

// ── BoxForm outside component ──
function BoxForm({ box, onChange, onSave, onCancel, isNew, onUpload }) {
  return (
    <div className="ap-edit">
      <label>Name</label>
      <input value={box.name} onChange={e => onChange('name', e.target.value)} placeholder="e.g. Classic Date Box" />

      <label>Box Price (PKR)</label>
      <input type="number" value={box.price} onChange={e => onChange('price', e.target.value)} placeholder="e.g. 1200" />

      <label>Max Items</label>
      <input type="number" min="1" max="10" value={box.maxItems} onChange={e => onChange('maxItems', e.target.value)} />

      <label>Description</label>
      <textarea rows={2} value={box.description} onChange={e => onChange('description', e.target.value)} placeholder="Short description..." />

      {/* ── Cover Image (outside of box) ── */}
      <label style={{ color: '#c5a059', fontWeight: '700', marginTop: '6px' }}>📦 Cover Image (Box outside)</label>
      <input value={box.image || ''} onChange={e => onChange('image', e.target.value)} placeholder="/Gift 1.png" />
      <label className="ap-upload-label">
        📤 Upload Cover
        <input type="file" accept="image/*" style={{ display: 'none' }}
          onChange={async e => { const f = e.target.files[0]; if (f) onUpload(f, 'image'); }}
        />
      </label>
      {box.image && (
        <img
          src={box.image.startsWith('/') ? `http://localhost:5173${box.image}` : box.image}
          alt="cover preview"
          style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '8px', marginTop: '4px', border: '1px solid rgba(197,160,89,0.3)' }}
          onError={e => e.target.style.display = 'none'}
        />
      )}

      {/* ── Inner Image (lid open, dates visible) ── */}
      <label style={{ color: '#c5a059', fontWeight: '700', marginTop: '6px' }}>🍬 Inner Image (Lid open / contents)</label>
      <input value={box.innerImage || ''} onChange={e => onChange('innerImage', e.target.value)} placeholder="/Gift 1 Inner.png" />
      <label className="ap-upload-label">
        📤 Upload Inner
        <input type="file" accept="image/*" style={{ display: 'none' }}
          onChange={async e => { const f = e.target.files[0]; if (f) onUpload(f, 'innerImage'); }}
        />
      </label>
      {box.innerImage && (
        <img
          src={box.innerImage.startsWith('/') ? `http://localhost:5173${box.innerImage}` : box.innerImage}
          alt="inner preview"
          style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '8px', marginTop: '4px', border: '1px solid rgba(197,160,89,0.3)' }}
          onError={e => e.target.style.display = 'none'}
        />
      )}

      <div className="ap-btns">
        <button className="ap-save" onClick={onSave}>{isNew ? '➕ Add Box' : '💾 Save'}</button>
        <button className="ap-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}


// ── Products Panel for each gift box ──
function BoxProductsPanel({ box, allProducts, token, onMsg }) {
  const [open, setOpen] = useState(false);
  const [boxProducts, setBoxProducts] = useState(box.products || []);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdded = (pid) => boxProducts.some(p => (p._id || p.id) === (pid._id || pid.id));

  const toggleProduct = (product) => {
    const id = product._id || product.id;
    if (isAdded(product)) {
      setBoxProducts(prev => prev.filter(p => (p._id || p.id) !== id));
    } else {
      if (boxProducts.length >= box.maxItems) {
        onMsg(`⚠️ Max ${box.maxItems} items allowed!`);
        return;
      }
      setBoxProducts(prev => [...prev, product]);
    }
  };

  const saveProducts = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/gift-boxes/${box._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...box, products: boxProducts, price: Number(box.price), maxItems: Number(box.maxItems) })
      });
      if (res.ok) onMsg('✅ Products saved!');
      else onMsg('❌ Save failed');
    } catch { onMsg('❌ Network error'); }
    setSaving(false);
  };

  const filtered = allProducts.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '8px 14px', background: open ? 'rgba(197,160,89,0.15)' : 'rgba(197,160,89,0.07)',
          border: '1px solid rgba(197,160,89,0.35)', borderRadius: '10px', color: '#c5a059',
          fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s'
        }}
      >
        <span>🛒 Products ({boxProducts.length}/{box.maxItems})</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          marginTop: '8px', background: 'rgba(10,8,5,0.95)',
          border: '1px solid rgba(197,160,89,0.2)', borderRadius: '12px',
          padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          {/* Selected products preview */}
          {boxProducts.length > 0 && (
            <div>
              <p style={{ fontSize: '10px', color: '#c5a059', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Selected ({boxProducts.length})
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {boxProducts.map((p, i) => (
                  <div key={i} style={{ position: 'relative', width: '52px' }}>
                    <img
                      src={p.image} alt={p.name}
                      style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #c5a059' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                    <button
                      onClick={() => toggleProduct(p)}
                      style={{
                        position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px',
                        background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%',
                        fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900'
                      }}
                    >✕</button>
                    <p style={{ fontSize: '9px', color: '#ccc', textAlign: 'center', marginTop: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <input
            placeholder="🔍 Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'rgba(197,160,89,0.06)', border: '1px solid rgba(197,160,89,0.25)',
              borderRadius: '8px', padding: '7px 12px', color: '#fff', fontSize: '12px', outline: 'none', width: '100%'
            }}
          />

          {/* Product list */}
          <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filtered.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', padding: '16px' }}>No products found</p>
            ) : filtered.map(p => {
              const added = isAdded(p);
              return (
                <div
                  key={p._id || p.id}
                  onClick={() => toggleProduct(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', borderRadius: '10px', cursor: 'pointer',
                    background: added ? 'rgba(197,160,89,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${added ? 'rgba(197,160,89,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.15s'
                  }}
                >
                  <img
                    src={p.image} alt={p.name}
                    style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '7px', flexShrink: 0, border: '1px solid rgba(197,160,89,0.2)' }}
                    onError={e => e.target.style.display = 'none'}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#f1f5f9', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ fontSize: '11px', color: '#c5a059', margin: 0, fontWeight: '700' }}>PKR {Number(p.price).toLocaleString()}</p>
                  </div>
                  <span style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    background: added ? '#c5a059' : 'rgba(255,255,255,0.08)',
                    color: added ? '#000' : '#6b7280',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '900'
                  }}>{added ? '✓' : '+'}</span>
                </div>
              );
            })}
          </div>

          {/* Save */}
          <button
            onClick={saveProducts} disabled={saving}
            style={{
              padding: '9px', background: 'linear-gradient(135deg, #c5a059, #b8860b)',
              border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700',
              fontSize: '13px', cursor: 'pointer', opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? 'Saving...' : '💾 Save Products'}
          </button>
        </div>
      )}
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
  const [allProducts, setAllProducts] = useState([]);
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
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/shop-products`);
      const data = await res.json();
      setAllProducts(data.products || []);
    } catch {}
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

                        <span style={{ color: '#9ca3af', fontSize: '13px' }}>🎁 {box.maxItems} item{box.maxItems > 1 ? 's' : ''}</span>
                      </div>
                      {box.description && (
                        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', lineHeight: '1.4' }}>{box.description}</p>
                      )}

                      {/* Products Manager */}
                      <BoxProductsPanel
                        box={box}
                        allProducts={allProducts}
                        token={token}
                        onMsg={showMsg}
                      />

                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
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
