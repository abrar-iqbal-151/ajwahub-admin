import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/AdminPanel.css';
import '../css/Admin_Product.css';
import '../css/Admin_GiftBoxes.css';

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
        <div className="ap-edit-flex">
          
          <div className="ap-edit-left">
            <div className="agb-img-preview-box">
              <div className="agb-img-preview-badge">📦 Cover Image</div>
              {box.image ? (
                <img src={box.image.startsWith('/') ? `http://localhost:5173${box.image}` : box.image} alt="cover" className="agb-img-preview-img" onError={e => e.target.style.display = 'none'} />
              ) : (
                <div className="agb-img-placeholder"><span>📦</span><p>No cover image</p></div>
              )}
              <div className="agb-upload-wrapper">
                <label className="agb-upload-label">
                  📤 Upload Cover
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) onUpload(f, 'image'); }} />
                </label>
              </div>
            </div>
            
            <div className="agb-img-preview-box">
              <div className="agb-img-preview-badge">🍬 Inner Image</div>
              {box.innerImage ? (
                <img src={box.innerImage.startsWith('/') ? `http://localhost:5173${box.innerImage}` : box.innerImage} alt="inner" className="agb-img-preview-img" onError={e => e.target.style.display = 'none'} />
              ) : (
                <div className="agb-img-placeholder"><span>🍬</span><p>No inner image</p></div>
              )}
              <div className="agb-upload-wrapper">
                <label className="agb-upload-label">
                  📤 Upload Inner
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) onUpload(f, 'innerImage'); }} />
                </label>
              </div>
            </div>
          </div>

          <div className="ap-edit-right">
            <div className="agb-form-row">
              <div className="agb-form-col-2">
                <label className="agb-form-label">Name</label>
                <input className="agb-input" value={box.name} onChange={e => onChange('name', e.target.value)} placeholder="e.g. Classic Date Box" />
              </div>
              <div className="agb-form-col-1">
                <label className="agb-form-label">Max Items</label>
                <input type="number" min="1" max="10" className="agb-input" value={box.maxItems} onChange={e => onChange('maxItems', e.target.value)} />
              </div>
            </div>

            <div className="agb-form-group">
              <label className="agb-form-label">Box Price (PKR)</label>
              <input type="number" className="agb-input" value={box.price} onChange={e => onChange('price', e.target.value)} placeholder="e.g. 1200" />
            </div>

            <div className="agb-form-group">
              <label className="agb-form-label">Cover Image URL</label>
              <input className="agb-input" value={box.image || ''} onChange={e => onChange('image', e.target.value)} placeholder="/Gift 1.png" />
            </div>

            <div className="agb-form-group">
              <label className="agb-form-label">Inner Image URL</label>
              <input className="agb-input" value={box.innerImage || ''} onChange={e => onChange('innerImage', e.target.value)} placeholder="/Gift 1 Inner.png" />
            </div>

            <div className="agb-form-group">
              <label className="agb-form-label">Description</label>
              <textarea rows={3} className="agb-textarea" value={box.description} onChange={e => onChange('description', e.target.value)} placeholder="Short description..." />
            </div>

            <div className="ap-btns" style={{ marginTop: 'auto', paddingTop: '15px' }}>
              <button className="ap-save" onClick={onSave} style={{ flex: 2, padding: '12px' }}>{isNew ? '➕ Create Box' : '💾 Save Changes'}</button>
              <button className="ap-cancel" onClick={onCancel} style={{ flex: 1, padding: '12px' }}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Global Items Manager ──
function GlobalItemsManager({ items, token, onRefresh, onCancel, onMsg }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
    if (res.ok) {
      const data = await res.json();
      setImage(data.path);
    } else {
      onMsg('❌ Image upload failed');
    }
  };

  const addItem = async () => {
    if (!name || !price || !image) return onMsg('⚠️ Name, Price, and Image required');
    setLoading(true);
    const res = await fetch(`${API}/gift-box-items`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, price: Number(price), image })
    });
    setLoading(false);
    if (res.ok) { onMsg('✅ Item Added to Global List'); setName(''); setPrice(''); setImage(''); onRefresh(); }
    else onMsg('❌ Failed to add item');
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this global item? It will not remove it from already saved boxes, but it will be removed from this list.')) return;
    const res = await fetch(`${API}/gift-box-items/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { onMsg('✅ Item Deleted'); onRefresh(); }
  };

  return (
    <div className="ap-modal-overlay">
      <div className="ap-modal-container" style={{ maxWidth: '700px' }}>
        <div className="ap-modal-header">
          <h3>🛍️ Manage Global Gift Items</h3>
          <button className="ap-modal-close" onClick={onCancel}>✕</button>
        </div>
        
        <div style={{ padding: '20px' }}>
          <div className="agb-new-item-form" style={{ marginBottom: '25px' }}>
            <p className="agb-new-item-title">➕ Add New Item to Global List</p>
            <div className="agb-form-row">
              <div className="agb-form-col-2">
                <input className="agb-input" placeholder="Item Name (e.g. Ajwa Dates)" value={name} onChange={e=>setName(e.target.value)} />
              </div>
              <div className="agb-form-col-1">
                <input type="number" className="agb-input" placeholder="Price (PKR)" value={price} onChange={e=>setPrice(e.target.value)} />
              </div>
            </div>
            <div className="agb-new-item-row" style={{ marginTop: '10px' }}>
              <input className="agb-input" placeholder="Image URL or Upload 👉" value={image} onChange={e=>setImage(e.target.value)} style={{ flex: 1 }} />
              <label className="agb-new-item-upload">📤
                <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => { if(e.target.files[0]) handleUpload(e.target.files[0]); }} />
              </label>
            </div>
            <button onClick={addItem} disabled={loading} className="agb-save-db-btn" style={{ width: '100%', marginTop: '15px' }}>
              {loading ? 'Adding...' : 'Add Item to Global Pool'}
            </button>
          </div>

          <p className="agb-panel-title">Available Global Items ({items.length})</p>
          {items.length === 0 ? <p className="agb-panel-empty">No global items found.</p> : (
            <div className="agb-items-grid" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '10px' }}>
              {items.map(item => (
                <div key={item._id} className="agb-item-wrapper" style={{ width: '80px' }}>
                  <div className="agb-item-img-wrap" style={{ width: '80px', height: '80px' }}>
                    <img src={item.image.startsWith('/') ? `http://localhost:5173${item.image}` : item.image} alt={item.name} className="agb-item-img" onError={e=>e.target.style.display='none'} />
                    <button onClick={() => deleteItem(item._id)} className="agb-item-remove">✕</button>
                  </div>
                  <p className="agb-item-title" title={item.name} style={{ fontSize: '10px', marginTop: '4px' }}>{item.name}</p>
                  <p style={{ fontSize: '10px', color: '#c5a059', margin: 0, textAlign: 'center', fontWeight: 'bold' }}>PKR {item.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ── Products Panel for each gift box ──
function BoxProductsPanel({ box, token, onMsg, globalItems }) {
  const [open, setOpen] = useState(false);
  const [boxProducts, setBoxProducts] = useState(box.products || []);
  const [saving, setSaving] = useState(false);
  
  const addItemFromGlobal = (gItem) => {
    if (boxProducts.some(p => p.globalId === gItem._id)) {
      onMsg('⚠️ Item already in box!');
      return;
    }
    if (boxProducts.length >= box.maxItems) {
      onMsg(`⚠️ Max ${box.maxItems} items allowed!`);
      return;
    }
    const newItem = { id: Date.now().toString(), globalId: gItem._id, name: gItem.name, image: gItem.image, price: gItem.price };
    setBoxProducts(prev => [...prev, newItem]);
  };

  const removeItem = (id) => {
    setBoxProducts(prev => prev.filter(p => p.id !== id));
  };

  const saveProducts = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/gift-boxes/${box._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...box, products: boxProducts, price: Number(box.price), maxItems: Number(box.maxItems) })
      });
      if (res.ok) onMsg('✅ Products saved in database!');
      else onMsg('❌ Save failed');
    } catch { onMsg('❌ Network error'); }
    setSaving(false);
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        onClick={() => setOpen(!open)}
        className={`agb-panel-btn ${open ? 'open' : 'closed'}`}
      >
        <span>🛒 Box Items ({boxProducts.length}/{box.maxItems})</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="agb-panel-content">
          
          {/* List of currently added items */}
          <div>
            <p className="agb-panel-title">
              Items in Box ({boxProducts.length} / {box.maxItems})
            </p>
            {boxProducts.length === 0 ? (
              <p className="agb-panel-empty">No items added yet.</p>
            ) : (
              <div className="agb-items-grid">
                {boxProducts.map((p) => (
                  <div key={p.id} className="agb-item-wrapper">
                    <div className="agb-item-img-wrap">
                      <img
                        src={p.image.startsWith('/') ? `http://localhost:5173${p.image}` : p.image} alt={p.name}
                        className="agb-item-img"
                        onError={e => e.target.style.display = 'none'}
                      />
                      <button onClick={() => removeItem(p.id)} className="agb-item-remove">✕</button>
                    </div>
                    <p className="agb-item-title" title={p.name}>{p.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Global Items Selector */}
          {boxProducts.length < box.maxItems && (
            <div className="agb-new-item-form">
              <p className="agb-new-item-title">👇 Click to add from Global Items</p>
              {globalItems.length === 0 ? (
                <p className="agb-panel-empty">No global items found. Create them from the top button first.</p>
              ) : (
                <div className="agb-items-grid" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {globalItems.map(gItem => (
                    <div key={gItem._id} className="agb-item-wrapper" style={{ cursor: 'pointer' }} onClick={() => addItemFromGlobal(gItem)}>
                      <div className="agb-item-img-wrap">
                        <img src={gItem.image.startsWith('/') ? `http://localhost:5173${gItem.image}` : gItem.image} alt={gItem.name} className="agb-item-img" style={{ border: '2px dashed #4b5563' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
                          <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>+</span>
                        </div>
                      </div>
                      <p className="agb-item-title">{gItem.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button onClick={saveProducts} disabled={saving} className="agb-save-db-btn">
            {saving ? 'Saving...' : '💾 Save Items to Database'}
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
  const [globalItems, setGlobalItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [editBox, setEditBox] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGlobalManager, setShowGlobalManager] = useState(false);
  const [newBox, setNewBox] = useState(emptyBox);

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const t = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !t) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    setToken(t);
    fetchBoxes();
    fetchGlobalItems();
    fetchProducts();
  }, []);

  const fetchGlobalItems = async () => {
    try {
      const res = await fetch(`${API}/gift-box-items`);
      const data = await res.json();
      setGlobalItems(data.items || []);
    } catch {}
  };

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
            <button className="ap-save" style={{ width: 'auto', padding: '8px 18px', background: '#3b82f6', borderColor: '#2563eb' }} onClick={() => setShowGlobalManager(true)}>
              🛍️ Manage Global Items
            </button>
            <button className="ap-save" style={{ width: 'auto', padding: '8px 18px' }} onClick={() => setShowAddForm(true)}>
              ➕ Add Gift Box
            </button>
          </div>

          {showGlobalManager && (
            <GlobalItemsManager
              items={globalItems}
              token={token}
              onMsg={showMsg}
              onRefresh={fetchGlobalItems}
              onCancel={() => setShowGlobalManager(false)}
            />
          )}

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

                    {/* Products Manager */}
                    <BoxProductsPanel
                      box={box}
                      globalItems={globalItems}
                      token={token}
                      onMsg={showMsg}
                    />

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
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
