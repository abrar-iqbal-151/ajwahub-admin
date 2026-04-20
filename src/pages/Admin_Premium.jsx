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
  { icon: '🎁', label: 'Gift Orders', path: '/admin-gift-orders' },
  { icon: '📦', label: 'Gift Boxes', path: '/admin-gift-boxes' },
  { icon: '📬', label: 'Contact', path: '/admin-contact' },
  { icon: '💳', label: 'Payments', path: '/admin-payments' },
];

const empty = { name: '', description: '', price: '', originalPrice: '', image: '', category: 'dates', badge: 'Premium', stock: true, rating: 4.5, weight: '1kg', featured: false };

function Admin_Premium() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const t = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !t) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    setToken(t);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/premium-products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {}
    setLoading(false);
  };

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const handleSave = async () => {
    if (!form.name || !form.price) return showMsg('⚠️ Name and Price required');
    try {
      const url = editId ? `${API}/premium-products/${editId}` : `${API}/premium-products`;
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify({ ...form, price: Number(form.price), originalPrice: Number(form.originalPrice) }) });
      if (res.ok) {
        showMsg(editId ? '✅ Updated!' : '✅ Added!');
        setShowForm(false); setEditId(null); setForm(empty);
        fetchProducts();
      } else showMsg('❌ Failed');
    } catch { showMsg('❌ Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await fetch(`${API}/premium-products/${id}`, { method: 'DELETE', headers: authHeaders });
    setProducts(products.filter(p => p._id !== id));
    showMsg('🗑️ Deleted');
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice, image: p.image, category: p.category, badge: p.badge, stock: p.stock, rating: p.rating, weight: p.weight, featured: p.featured });
    setEditId(p._id);
    setShowForm(true);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok) setForm(p => ({ ...p, image: data.url || data.path }));
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

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
          <h1 className="topbar-title">👑 Premium Products</h1>
          <div className="topbar-right">{admin && <span className="topbar-admin">👤 {admin.name}</span>}</div>
        </header>

        <div className="dashboard-content">
          {msg && <div className="ap-msg">{msg}</div>}

          <div className="ap-toolbar">
            <input className="search-input" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="ap-count">{filtered.length} Products</span>
            <button className="ap-save" style={{ width: 'auto', padding: '8px 18px' }} onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty); }}>
              {showForm ? '✕ Cancel' : '➕ Add Product'}
            </button>
          </div>

          {showForm && (
            <div className="ap-add-form">
              <h3>{editId ? '✏️ Edit Product' : '➕ Add Premium Product'}</h3>
              <div className="ap-add-grid">
                <div className="ap-edit">
                  <label>Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Product name" />
                  <label>Price (PKR)</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 2500" />
                  <label>Original Price (PKR)</label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))} placeholder="e.g. 3000" />
                  <label>Weight</label>
                  <input value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="e.g. 500g" />
                  <label>Badge</label>
                  <input value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} placeholder="e.g. Premium, New, Hot" />
                  <label>Rating (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => setForm(p => ({ ...p, rating: Number(e.target.value) }))} />
                  <label>Category</label>
                  <select style={{ background: '#1f2937', border: '1px solid #374151', color: '#e5e7eb', padding: '8px', borderRadius: '8px', width: '100%' }}
                    value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="dates">Dates</option>
                    <option value="dry">Dry Fruits</option>
                  </select>
                  <label>Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Product description" />
                  <label>Image URL</label>
                  <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="Image URL" />
                  <label className="ap-upload-label">
                    📤 Upload Image
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) uploadImage(e.target.files[0]); }} />
                  </label>
                  {form.image && <img src={form.image} alt="preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} onError={e => e.target.style.display='none'} />}
                  <label className="ap-stock-label">
                    <input type="checkbox" checked={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.checked }))} /> In Stock
                  </label>
                  <label className="ap-stock-label">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} /> ⭐ Featured
                  </label>
                  <div className="ap-btns">
                    <button className="ap-save" onClick={handleSave}>{editId ? '💾 Update' : '➕ Add'}</button>
                    <button className="ap-cancel" onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? <div className="panel-loading">Loading...</div> : (
            <div className="ap-grid">
              {filtered.map(p => (
                <div key={p._id} className="ap-card">
                  {editId === p._id ? (
                    <div className="ap-edit">
                      <img src={form.image} alt={p.name} className="ap-img" onError={e => e.target.style.display='none'} />
                      <label>Name</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                      <label>Price (PKR)</label>
                      <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                      <label>Original Price (PKR)</label>
                      <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} />
                      <label>Weight</label>
                      <input value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
                      <label>Badge</label>
                      <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} />
                      <label>Rating (1-5)</label>
                      <input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))} />
                      <label>Category</label>
                      <select style={{ background: '#1f2937', border: '1px solid #374151', color: '#e5e7eb', padding: '8px', borderRadius: '8px', width: '100%' }}
                        value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                        <option value="dates">Dates</option>
                        <option value="dry">Dry Fruits</option>
                      </select>
                      <label>Description</label>
                      <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                      <label>Image URL</label>
                      <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
                      <label className="ap-upload-label">
                        📤 Upload Image
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) uploadImage(e.target.files[0]); }} />
                      </label>
                      <label className="ap-stock-label"><input type="checkbox" checked={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.checked }))} /> In Stock</label>
                      <label className="ap-stock-label"><input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} /> ⭐ Featured</label>
                      <div className="ap-btns">
                        <button className="ap-save" onClick={handleSave}>💾 Save</button>
                        <button className="ap-cancel" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="ap-view">
                      <img src={p.image} alt={p.name} className="ap-img" onError={e => e.target.style.display='none'} />
                      {p.featured && <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700 }}>⭐ Featured</span>}
                      <h4>{p.name}</h4>
                      <div className="ap-meta">
                        <span className="ap-price">PKR {p.price?.toLocaleString()}</span>
                        {p.originalPrice > p.price && <span style={{ color: '#4ade80', fontSize: '11px' }}>Save PKR {(p.originalPrice - p.price).toLocaleString()}</span>}
                        <span className={`ap-stock ${p.stock ? 'in' : 'out'}`}>{p.stock ? '✅ In Stock' : '❌ Out of Stock'}</span>
                      </div>
                      <div className="ap-rating">{[...Array(5)].map((_, i) => <span key={i} style={{ color: i < Math.floor(p.rating) ? '#fbbf24' : '#555', fontSize: '14px' }}>★</span>)} <span>({p.rating})</span></div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        <button className="ap-edit-btn" onClick={() => handleEdit(p)}>✏️ Edit</button>
                        <button className="ap-cancel" style={{ flex: 1 }} onClick={() => handleDelete(p._id)}>🗑️</button>
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

export default Admin_Premium;
