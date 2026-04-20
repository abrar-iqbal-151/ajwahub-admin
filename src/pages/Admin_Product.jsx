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
];

function Admin_Product() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', weight: '1kg', rating: 4.5, stock: true, image: '', description: '', category: 'dates' });

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
      const res = await fetch(`${API}/shop-products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {}
    setLoading(false);
  };

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const initializeData = async () => {
    const res = await fetch(`${API}/shop-products/initialize`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    showMsg(data.message === 'already exists' ? '⚠️ Already initialized!' : '✅ Data initialized!');
    fetchProducts();
  };

  const saveProduct = async (product) => {
    const res = await fetch(`${API}/shop-products/${product._id}`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ name: product.name, price: product.price, discount: product.discount, stock: product.stock, description: product.description, rating: product.rating, image: product.image, category: product.category })
    });
    if (res.ok) { setProducts(products.map(p => p._id === product._id ? product : p)); setEditProduct(null); showMsg('✅ Product updated!'); }
    else showMsg('❌ Failed to update');
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return showMsg('⚠️ Name aur Price required hai');
    const res = await fetch(`${API}/shop-products`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ ...newProduct, price: Number(newProduct.price) })
    });
    if (res.ok) {
      showMsg('✅ Product added!');
      setShowAddForm(false);
      setNewProduct({ name: '', price: '', weight: '1kg', rating: 4.5, stock: true, image: '', description: '', category: 'dates' });
      fetchProducts();
    } else showMsg('❌ Failed to add');
  };

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_admin');
    localStorage.removeItem('ajwaHub_adminToken');
    navigate('/login');
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < Math.floor(rating) ? '#fbbf24' : '#555', fontSize: '16px' }}>★</span>
    ));

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

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
          <h1 className="topbar-title">🛍️ Products Editor</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin">👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content">
          {msg && <div className="ap-msg">{msg}</div>}

          {products.length === 0 && !loading && (
            <div style={{ background: '#111827', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '14px', padding: '30px', textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ color: '#9ca3af', marginBottom: '16px' }}>Database mein koi product nahi. Initialize karo.</p>
              <button className="ap-save" style={{ width: 'auto', padding: '10px 24px' }} onClick={initializeData}>🚀 Initialize Products</button>
            </div>
          )}

          <div className="ap-toolbar">
            <input className="search-input" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="ap-count">{filtered.length} Products</span>
            <button className="ap-save" style={{ width: 'auto', padding: '8px 18px' }} onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? '✕ Cancel' : '➕ Add Product'}
            </button>
          </div>

          {showAddForm && (
            <div className="ap-add-form">
              <h3>Add New Product</h3>
              <div className="ap-add-grid">
                <div className="ap-edit">
                  <label>Name</label>
                  <input placeholder="Product name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                  <label>Price (PKR)</label>
                  <input type="number" placeholder="e.g. 1200" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                  <label>Weight</label>
                  <input placeholder="e.g. 1kg" value={newProduct.weight} onChange={e => setNewProduct({ ...newProduct, weight: e.target.value })} />
                  <label>Rating (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={newProduct.rating} onChange={e => setNewProduct({ ...newProduct, rating: Number(e.target.value) })} />
                  <label>Image</label>
                  <input placeholder="e.g. /Product 1.png" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                  <label className="ap-upload-label">
                    📤 Upload Image
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={async e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('file', file);
                        const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                        const data = await res.json();
                        if (res.ok) setNewProduct({ ...newProduct, image: data.path });
                      }}
                    />
                  </label>
                  {newProduct.image && <img src={newProduct.image} alt="preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginTop: '4px' }} onError={e => e.target.style.display='none'} />}
                  <label>Description</label>
                  <textarea rows={2} placeholder="Product description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                  <label>Category</label>
                  <select style={{ background: '#1f2937', border: '1px solid #374151', color: '#e5e7eb', padding: '8px 10px', borderRadius: '8px', fontSize: '13px', width: '100%' }}
                    value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                    <option value="dates">Dates</option>
                    <option value="dry">Dry Fruits</option>
                  </select>
                  <label className="ap-stock-label">
                    <input type="checkbox" checked={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.checked })} />
                    In Stock
                  </label>
                  <div className="ap-btns">
                    <button className="ap-save" onClick={addProduct}>➕ Add Product</button>
                    <button className="ap-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? <div className="panel-loading">Loading...</div> : (
            <div className="ap-grid">
              {filtered.map(product => (
                <div key={product.id} className="ap-card">
                  {editProduct?.id === product.id ? (
                    <div className="ap-edit">
                      <img src={editProduct.image} alt={product.name} className="ap-img" onError={e => e.target.style.display = 'none'} />
                      <label>Name</label>
                      <input value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} />
                      <label>Price (PKR)</label>
                      <input type="number" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: Number(e.target.value) })} />
                      <label>Rating (1-5)</label>
                      <input type="number" min="1" max="5" step="0.1" value={editProduct.rating} onChange={e => setEditProduct({ ...editProduct, rating: Number(e.target.value) })} />
                      <label>Discount</label>
                      <input value={editProduct.discount} onChange={e => setEditProduct({ ...editProduct, discount: e.target.value })} />
                      <label>Description</label>
                      <textarea rows={3} value={editProduct.description} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} />
                      <label>Image URL</label>
                      <input placeholder="Image URL" value={editProduct.image} onChange={e => setEditProduct({ ...editProduct, image: e.target.value })} />
                      <label className="ap-upload-label">
                        📤 Upload Image
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={async e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);
                            const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                            const data = await res.json();
                            if (res.ok) setEditProduct(prev => ({ ...prev, image: data.url || data.path }));
                          }}
                        />
                      </label>
                      <label>Category</label>
                      <select style={{ background: '#1f2937', border: '1px solid #374151', color: '#e5e7eb', padding: '8px 10px', borderRadius: '8px', fontSize: '13px', width: '100%' }}
                        value={editProduct.category} onChange={e => setEditProduct({ ...editProduct, category: e.target.value })}>
                        <option value="dates">Dates</option>
                        <option value="dry">Dry Fruits</option>
                      </select>
                      <label className="ap-stock-label">
                        <input type="checkbox" checked={editProduct.stock} onChange={e => setEditProduct({ ...editProduct, stock: e.target.checked })} />
                        In Stock
                      </label>
                      <div className="ap-btns">
                        <button className="ap-save" onClick={() => saveProduct(editProduct)}>💾 Save</button>
                        <button className="ap-cancel" onClick={() => setEditProduct(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="ap-view">
                      <img src={product.image} alt={product.name} className="ap-img" onError={e => e.target.style.display = 'none'} />
                      <h4>{product.name}</h4>
                      <div className="ap-meta">
                        <span className="ap-price">PKR {product.price}</span>
                        <span className="ap-discount">{product.discount}</span>
                        <span className={`ap-stock ${product.stock ? 'in' : 'out'}`}>{product.stock ? '✅ In Stock' : '❌ Out of Stock'}</span>
                      </div>
                      <div className="ap-rating">{renderStars(product.rating)} <span>({product.rating})</span></div>
                      <button className="ap-edit-btn" onClick={() => setEditProduct({ ...product })}>✏️ Edit</button>
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

export default Admin_Product;

