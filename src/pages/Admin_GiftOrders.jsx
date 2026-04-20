import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/AdminPanel.css';
import '../css/Admin_GiftOrders.css';

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

const statusColors = {
  'Pending': '#f59e0b', 'Processing': '#3b82f6',
  'Delivered': '#10b981', 'Cancelled': '#ef4444',
};

const tagColors = {
  'Bestseller': '#f59e0b', 'Popular': '#3b82f6', 'New': '#10b981',
  'Premium': '#8b5cf6', 'Healthy': '#22c55e', 'Luxury': '#ec4899',
  'Elite': '#f97316', '🎁 Special': '#dc2626',
};

function Admin_GiftOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Create order modal state
  const [showCreate, setShowCreate] = useState(false);
  const [giftBoxes, setGiftBoxes] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchItem, setSearchItem] = useState('');
  const [orderUser, setOrderUser] = useState({ name: '', email: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const t = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !t) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    setToken(t);
    fetchOrders(t);
    fetch(`${API}/gift-boxes`).then(r => r.json()).then(d => setGiftBoxes(d.boxes || [])).catch(() => {});
    fetch(`${API}/shop-products`).then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => {});
  }, []);

  const fetchOrders = async (t) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/gift-orders`, { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {}
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API}/gift-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
    } catch {}
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Is order ko delete karna chahte hain?')) return;
    try {
      await fetch(`${API}/gift-orders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setOrders(orders.filter(o => o._id !== id));
    } catch {}
  };

  const openCreate = () => {
    setSelectedBox(null); setSelectedItems([]); setSearchItem('');
    setOrderUser({ name: 'Admin', email: admin?.email || 'admin' });
    setShowCreate(true);
  };

  const addItem = (product) => {
    if (selectedItems.length >= selectedBox.maxItems) return;
    setSelectedItems([...selectedItems, product]);
  };
  const removeItem = (i) => setSelectedItems(selectedItems.filter((_, idx) => idx !== i));

  const totalPrice = selectedBox ? selectedBox.price + selectedItems.reduce((s, p) => s + p.price, 0) : 0;

  const handleCreate = async () => {
    if (!selectedBox || selectedItems.length === 0) return;
    setCreating(true);
    try {
      await fetch(`${API}/gift-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: orderUser.email,
          userName: orderUser.name,
          boxName: selectedBox.name,
          boxPrice: selectedBox.price,
          items: selectedItems,
          totalPrice
        })
      });
      setShowCreate(false);
      fetchOrders(token);
    } catch {}
    setCreating(false);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchItem.toLowerCase()));

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_admin');
    localStorage.removeItem('ajwaHub_adminToken');
    navigate('/login');
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
          <button className="sidebar-item sidebar-logout" onClick={handleLogout}>
            <span className="sidebar-icon">🚪</span>
            {sidebarOpen && <span className="sidebar-label">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <button className="topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? '◀' : '▶'}</button>
          <h1 className="topbar-title">🎁 Gift Orders</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin">👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content">
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card"><div className="stat-icon">🎁</div><div><h2>{orders.length}</h2><p>Total Orders</p></div></div>
            <div className="stat-card"><div className="stat-icon">⏳</div><div><h2>{orders.filter(o => o.status === 'Pending').length}</h2><p>Pending</p></div></div>
            <div className="stat-card green"><div className="stat-icon">✅</div><div><h2>{orders.filter(o => o.status === 'Delivered').length}</h2><p>Delivered</p></div></div>
          </div>

          {loading && <div className="panel-loading">Loading...</div>}
          {!loading && orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#4b5563' }}>No gift orders yet</div>
          )}

          {!loading && orders.length > 0 && (
            <div className="ago-list">
              {orders.map(order => (
                <div key={order._id} className="ago-card">
                  <div className="ago-header" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                    <div className="ago-header-left">
                      <span className="ago-box-name">🎁 {order.boxName}</span>
                      <span className="ago-user">👤 {order.userName} — {order.userEmail}</span>
                      <span className="ago-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="ago-header-right">
                      <span className="ago-total">PKR {order.totalPrice?.toLocaleString()}</span>
                      <span className="ago-status" style={{ background: `${statusColors[order.status]}22`, color: statusColors[order.status], border: `1px solid ${statusColors[order.status]}44` }}>
                        {order.status}
                      </span>
                      <span className="ago-arrow">{expandedOrder === order._id ? '▲' : '▼'}</span>
                      <button className="ago-del-btn" onClick={e => { e.stopPropagation(); deleteOrder(order._id); }}>🗑️</button>
                    </div>
                  </div>

                  {expandedOrder === order._id && (
                    <div className="ago-body">
                      <div className="ago-items">
                        <p className="ago-items-title">Selected Items:</p>
                        <div className="ago-items-grid">
                          {order.items?.map((item, i) => (
                            <div key={i} className="ago-item">
                              <img src={item.image?.startsWith('/') ? `http://localhost:5173${item.image}` : item.image} alt={item.name} onError={e => e.target.style.display = 'none'} />
                              <div><h5>{item.name}</h5><span>PKR {item.price?.toLocaleString()}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="ago-actions">
                        <p className="ago-items-title">Update Status:</p>
                        <div className="ago-status-btns">
                          {['Pending', 'Processing', 'Delivered', 'Cancelled'].map(s => (
                            <button key={s} className={`ago-status-btn ${order.status === s ? 'active' : ''}`}
                              style={{ '--color': statusColors[s] }} onClick={() => updateStatus(order._id, s)}>{s}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE ORDER MODAL */}
      {showCreate && (
        <div className="ago-overlay" onClick={() => setShowCreate(false)}>
          <div className="ago-modal" onClick={e => e.stopPropagation()}>
            <button className="ago-modal-close" onClick={() => setShowCreate(false)}>✕</button>

            {!selectedBox ? (
              /* STEP 1 — Box select karo */
              <div className="ago-step1">
                <h3>Select a Gift Box</h3>
                <div className="ago-boxes-grid">
                  {giftBoxes.map(box => (
                    <div key={box._id} className="ago-box-card" onClick={() => setSelectedBox(box)}>
                      <img src={box.image?.startsWith('/') ? `http://localhost:5173${box.image}` : box.image} alt={box.name} onError={e => e.target.style.opacity = '0.2'} />
                      <span className="ago-box-tag" style={{ background: tagColors[box.tag] || '#dc2626' }}>{box.tag}</span>
                      <div className="ago-box-card-info">
                        <h4>{box.name}</h4>
                        <span>PKR {Number(box.price).toLocaleString()} · 🎁 {box.maxItems} items</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* STEP 2 — Customize */
              <div className="ago-customize">
                <div className="ago-gcm-left">
                  <img src={selectedBox.image?.startsWith('/') ? `http://localhost:5173${selectedBox.image}` : selectedBox.image} alt={selectedBox.name} onError={e => e.target.style.opacity = '0.2'} />
                  <div>
                    <span className="ago-box-tag" style={{ background: tagColors[selectedBox.tag] || '#dc2626' }}>{selectedBox.tag}</span>
                    <h3>{selectedBox.name}</h3>
                    <p>{selectedBox.description}</p>
                  </div>

                  {/* User info */}
                  <div className="ago-user-fields">
                    <label>Customer Name</label>
                    <input value={orderUser.name} onChange={e => setOrderUser({ ...orderUser, name: e.target.value })} placeholder="Name" />
                    <label>Customer Email</label>
                    <input value={orderUser.email} onChange={e => setOrderUser({ ...orderUser, email: e.target.value })} placeholder="Email" />
                  </div>

                  {/* Slots */}
                  <div className="ago-slots">
                    <p className="ago-slots-title">Selected Items ({selectedItems.length}/{selectedBox.maxItems})</p>
                    {[...Array(selectedBox.maxItems)].map((_, i) => (
                      <div key={i} className={`ago-slot ${selectedItems[i] ? 'filled' : ''}`}>
                        {selectedItems[i] ? (
                          <>
                            <img src={selectedItems[i].image?.startsWith('/') ? `http://localhost:5173${selectedItems[i].image}` : selectedItems[i].image} alt={selectedItems[i].name} onError={e => e.target.style.display = 'none'} />
                            <span>{selectedItems[i].name}</span>
                            <button onClick={() => removeItem(i)}>✕</button>
                          </>
                        ) : <span className="ago-slot-empty">+ Add Item</span>}
                      </div>
                    ))}
                  </div>

                  <div className="ago-total-box">
                    <span>Box Price: PKR {selectedBox.price.toLocaleString()}</span>
                    <span>Items: PKR {selectedItems.reduce((s, p) => s + p.price, 0).toLocaleString()}</span>
                    <strong>Total: PKR {totalPrice.toLocaleString()}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="ago-back-btn" onClick={() => { setSelectedBox(null); setSelectedItems([]); }}>← Back</button>
                    <button className="ago-order-btn" disabled={selectedItems.length === 0 || creating} onClick={handleCreate}>
                      {creating ? 'Saving...' : '🎁 Create Order'}
                    </button>
                  </div>
                </div>

                <div className="ago-gcm-right">
                  <h4>Choose Products</h4>
                  <div className="ago-search">
                    <span>🔍</span>
                    <input placeholder="Search products..." value={searchItem} onChange={e => setSearchItem(e.target.value)} />
                  </div>
                  <div className="ago-products-list">
                    {filteredProducts.map(product => (
                      <div key={product.id}
                        className={`ago-product-row ${selectedItems.length >= selectedBox.maxItems ? 'disabled' : ''}`}
                        onClick={() => addItem(product)}>
                        <img src={product.image?.startsWith('/') ? `http://localhost:5173${product.image}` : product.image} alt={product.name} onError={e => e.target.style.display = 'none'} />
                        <div>
                          <h5>{product.name}</h5>
                          <span>PKR {product.price.toLocaleString()}</span>
                        </div>
                        <button className="ago-add-btn" disabled={selectedItems.length >= selectedBox.maxItems}>+</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin_GiftOrders;

