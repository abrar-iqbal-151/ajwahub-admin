import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/AdminPanel.css';
import '../css/Admin_Product.css';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const menuItems = [
  { icon: '🏠', label: 'Dashboard', path: '/panel' },
  { icon: '📊', label: 'Analytics', path: '/admin-analytics' },
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
  { icon: '🎥', label: 'GymAI Videos', path: '/admin-gymai' },
  { icon: '📦', label: 'Inventory', path: '/admin-inventory' },
];

const emptyBox = { name: '', price: '', image: '', innerImage: '', description: '', maxItems: 1 };

// ── BoxForm outside component ──
function BoxForm({ box, onChange, onSave, onCancel, isNew, onUpload }) {
  return (
    <div className="ap-modal-overlay">
      <div className="ap-modal-container" style={{ maxWidth: '900px' }}>
        <div className="ap-modal-header">
          <h3>{isNew ? '➕ Add Gift Box' : '✏️ Edit Gift Box'}</h3>
          <button className="ap-modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="ap-edit-flex" style={{ display: 'flex', gap: '24px', padding: '20px', flexWrap: 'wrap' }}>
          
          <div className="ap-edit-left" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative', background: '#fdfaf3', borderRadius: '16px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(197, 160, 89, 0.2)', overflow: 'hidden', padding: '10px' }}>
              <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>📦 Cover Image</div>
              {box.image ? (
                <img src={box.image.startsWith('/') ? `http://localhost:5173${box.image}` : box.image} alt="cover" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', zIndex: 1, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.15))' }} onError={e => e.target.style.display = 'none'} />
              ) : (
                <div style={{ color: '#ccc', textAlign: 'center', zIndex: 1 }}><span style={{ fontSize: '32px' }}>📦</span><p style={{ color: '#94a3b8', fontSize: '12px' }}>No cover image</p></div>
              )}
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 10 }}>
                <label className="ap-upload-label" style={{ background: 'rgba(255,255,255,0.9)', margin: 0, padding: '6px 10px', fontSize: '11px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  📤 Upload Cover
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) onUpload(f, 'image'); }} />
                </label>
              </div>
            </div>
            
            <div style={{ position: 'relative', background: '#fdfaf3', borderRadius: '16px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(197, 160, 89, 0.2)', overflow: 'hidden', padding: '10px' }}>
              <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>🍬 Inner Image</div>
              {box.innerImage ? (
                <img src={box.innerImage.startsWith('/') ? `http://localhost:5173${box.innerImage}` : box.innerImage} alt="inner" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', zIndex: 1, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.15))' }} onError={e => e.target.style.display = 'none'} />
              ) : (
                <div style={{ color: '#ccc', textAlign: 'center', zIndex: 1 }}><span style={{ fontSize: '32px' }}>🍬</span><p style={{ color: '#94a3b8', fontSize: '12px' }}>No inner image</p></div>
              )}
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 10 }}>
                <label className="ap-upload-label" style={{ background: 'rgba(255,255,255,0.9)', margin: 0, padding: '6px 10px', fontSize: '11px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  📤 Upload Inner
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) onUpload(f, 'innerImage'); }} />
                </label>
              </div>
            </div>
          </div>

          <div className="ap-edit-right" style={{ flex: '1.2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Name</label>
                <input style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={box.name} onChange={e => onChange('name', e.target.value)} placeholder="e.g. Classic Date Box" />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Max Items</label>
                <input type="number" min="1" max="10" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={box.maxItems} onChange={e => onChange('maxItems', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Box Price (PKR)</label>
              <input type="number" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={box.price} onChange={e => onChange('price', e.target.value)} placeholder="e.g. 1200" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Cover Image URL</label>
              <input style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={box.image || ''} onChange={e => onChange('image', e.target.value)} placeholder="/Gift 1.png" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Inner Image URL</label>
              <input style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={box.innerImage || ''} onChange={e => onChange('innerImage', e.target.value)} placeholder="/Gift 1 Inner.png" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Description</label>
              <textarea rows={3} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical' }} value={box.description} onChange={e => onChange('description', e.target.value)} placeholder="Short description..." />
            </div>

            <div className="ap-btns" style={{ marginTop: 'auto', paddingTop: '15px' }}>
              <button className="ap-save" onClick={onSave} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #c5a059, #b08d4f)' }}>{isNew ? '➕ Create Box' : '💾 Save Changes'}</button>
              <button className="ap-cancel" onClick={onCancel} style={{ flex: 1, padding: '12px' }}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Global Gift Items Panel ──
function GlobalGiftItemsPanel({ token, onMsg }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemName, setItemName] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API}/gift-items`);
      const data = await res.json();
      setItems(data.items || []);
    } catch {}
    setLoading(false);
  };

  const uploadItemImage = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) setItemImage(data.path);
    } catch {
      onMsg('❌ Upload failed');
    }
    setUploading(false);
  };

  const addItem = async () => {
    if (!itemName || !itemImage) return onMsg('⚠️ Name aur Image dono zaruri hain!');
    try {
      const res = await fetch(`${API}/gift-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: itemName, image: itemImage })
      });
      if (res.ok) {
        onMsg('✅ Item added globally!');
        setItemName(''); setItemImage('');
        fetchItems();
      } else { onMsg('❌ Failed to add item'); }
    } catch { onMsg('❌ Error adding item'); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item? It will be removed from all future gift boxes.')) return;
    try {
      const res = await fetch(`${API}/gift-items/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
      if (res.ok) {
        onMsg('✅ Item deleted!');
        fetchItems();
      }
    } catch {}
  };

  return (
    <div style={{ marginTop: '40px', padding: '20px', background: '#111827', borderRadius: '16px', border: '1px solid rgba(197, 160, 89, 0.2)' }}>
      <h2 style={{ color: '#c5a059', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>🍬</span> Global Gift Items <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>(Shows in ALL gift boxes)</span>
      </h2>
      
      {/* Add Form */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 250px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Item Name</label>
          <input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Premium Almonds" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff', outline: 'none' }} />
        </div>
        <div style={{ flex: '2 1 300px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Image URL</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={itemImage} onChange={e => setItemImage(e.target.value)} placeholder="/image.png" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff', outline: 'none' }} />
            <label style={{ padding: '10px 15px', background: '#334155', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
              {uploading ? '⏳' : '📤 Upload'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) uploadItemImage(e.target.files[0]); }} />
            </label>
          </div>
        </div>
        <button onClick={addItem} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #c5a059, #b08d4f)', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', height: '40px', flex: 'none' }}>
          ➕ Add Item
        </button>
      </div>

      {/* Items Grid */}
      {loading ? <p style={{ color: '#94a3b8' }}>Loading items...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
          {items.map(item => (
            <div key={item._id} style={{ background: '#1e293b', borderRadius: '12px', padding: '10px', border: '1px solid #334155', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={item.image.startsWith('/') ? `http://localhost:5173${item.image}` : item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px', border: '2px solid #c5a059' }} onError={e => e.target.style.display = 'none'} />
              <p style={{ fontSize: '11px', color: '#e2e8f0', textAlign: 'center', margin: 0, fontWeight: 'bold' }}>{item.name}</p>
              <button onClick={() => deleteItem(item._id)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>✕</button>
            </div>
          ))}
          {items.length === 0 && <p style={{ color: '#64748b', fontSize: '13px', gridColumn: '1/-1', textAlign: 'center', padding: '20px' }}>No global items added yet. Yahan upar form se add karein.</p>}
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
          <h1 className="topbar-title">📦 Gift Boxes Management</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin">👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content">
          {msg && <div className="ap-msg">{msg}</div>}

          {/* GLOBAL GIFT ITEMS PANEL */}
          <GlobalGiftItemsPanel token={token} onMsg={showMsg} />

          <hr style={{ border: 'none', borderTop: '1px solid rgba(197, 160, 89, 0.2)', margin: '40px 0' }} />

          <h2 style={{ color: '#fff', marginBottom: '20px' }}>📦 Manage Gift Boxes</h2>

          {boxes.length === 0 && !loading && (
            <div style={{ background: '#111827', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '14px', padding: '30px', textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ color: '#9ca3af', marginBottom: '16px' }}>Database mein koi gift box nahi. Default boxes initialize karo.</p>
              <button className="ap-save" style={{ width: 'auto', padding: '10px 24px' }} onClick={initializeBoxes}>🚀 Initialize Default Boxes</button>
            </div>
          )}

          <div className="ap-toolbar">
            <input className="search-input" placeholder="🔍 Search gift boxes..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="ap-count">{filtered.length} Boxes</span>
            <button className="ap-save" style={{ width: 'auto', padding: '8px 18px' }} onClick={() => setShowAddForm(true)}>
              ➕ Add Gift Box
            </button>
          </div>

          <div className="da-video-specs-note" style={{ borderColor: '#c5a059', background: '#fdfaf3', margin: '15px 0 20px 0', borderLeft: '4px solid #c5a059', padding: '12px 15px', borderRadius: '8px', borderTop: '1px solid rgba(197, 160, 89, 0.2)', borderRight: '1px solid rgba(197, 160, 89, 0.2)', borderBottom: '1px solid rgba(197, 160, 89, 0.2)', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
            <strong style={{ color: '#8d7558', display: 'block', fontSize: '14px', marginBottom: '8px' }}>📸 Recommended Gift Box Image Specs:</strong>
            <ul style={{ listStyle: 'none', display: 'flex', gap: '20px', flexWrap: 'wrap', padding: 0, margin: 0 }}>
              <li style={{ fontSize: '12px', color: '#4b5563' }}><span style={{ color: '#111827', fontWeight: '600' }}>Resolution:</span> 800x800 (Square 1:1)</li>
              <li style={{ fontSize: '12px', color: '#4b5563' }}><span style={{ color: '#111827', fontWeight: '600' }}>Format:</span> Transparent PNG or WebP</li>
              <li style={{ fontSize: '12px', color: '#4b5563' }}><span style={{ color: '#111827', fontWeight: '600' }}>Size:</span> Under 300KB</li>
            </ul>
          </div>

          {showAddForm && (
            <BoxForm
              box={newBox}
              onChange={(field, val) => setNewBox(prev => ({ ...prev, [field]: val }))}
              onSave={addBox}
              onCancel={() => { setShowAddForm(false); setNewBox(emptyBox); }}
              isNew={true}
              onUpload={file => uploadImage(file, path => setNewBox(prev => ({ ...prev, image: path })))}
            />
          )}

          {editBox && (
            <BoxForm
              box={editBox}
              onChange={(field, val) => setEditBox(prev => ({ ...prev, [field]: val }))}
              onSave={saveBox}
              onCancel={() => setEditBox(null)}
              isNew={false}
              onUpload={file => uploadImage(file, path => setEditBox(prev => ({ ...prev, image: path })))}
            />
          )}

          {loading ? <div className="panel-loading">Loading...</div> : (
            <div className="ap-grid">
              {filtered.map(box => (
                <div key={box._id} className="ap-card">
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

                    <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                      <button className="ap-edit-btn" style={{ flex: 1 }} onClick={() => setEditBox({ ...box })}>✏️ Edit</button>
                      <button className="ap-cancel" style={{ flex: 'none', padding: '7px 12px' }} onClick={() => deleteBox(box._id)}>🗑️</button>
                    </div>
                  </div>
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
