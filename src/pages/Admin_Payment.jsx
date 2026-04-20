import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/AdminPanel.css';
import '../css/Admin_Payment.css';

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

const statusColors = {
  'Paid': '#10b981',
  'Approved': '#10b981',
  'Delivered': '#3b82f6',
  'Pending Approval': '#f59e0b',
  'Cancelled': '#ef4444',
};

function Admin_Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [paySettings, setPaySettings] = useState({ easypaisaNumber: '', jazzcashNumber: '', easypaisaName: '', jazzcashName: '', extraPayments: [], shippingCost: 200, taxRate: 17, discountRate: 0 });
  const [editPay, setEditPay] = useState(false);
  const [payForm, setPayForm] = useState({});
  const [payMsg, setPayMsg] = useState('');
  const [newMethod, setNewMethod] = useState({ name: '', number: '', icon: '💰' });
  const [pricingForm, setPricingForm] = useState({ shippingCost: 200, taxRate: 17 });
  const [pricingMsg, setPricingMsg] = useState('');

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const t = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !t) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    setToken(t);
    // Load orders from DB
    fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(d => setOrders((d.orders || [])))
      .catch(() => {});
    // Load payment settings
    fetch(`${API}/settings`).then(r => r.json()).then(d => {
      if (d.settings) {
        setPaySettings(d.settings);
        setPayForm(d.settings);
        setPricingForm({
          shippingCost: d.settings.shippingCost ?? 200,
          taxRate: d.settings.taxRate ?? 17,
        });
      }
    }).catch(() => {});
  }, []);

  const savePaySettings = async () => {
    try {
      const res = await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payForm)
      });
      const data = await res.json();
      if (res.ok) { setPaySettings(data.settings); setEditPay(false); setPayMsg('✅ Saved!'); setTimeout(() => setPayMsg(''), 3000); }
    } catch {}
  };

  const addExtraMethod = async () => {
    if (!newMethod.name || !newMethod.number) return;
    const updated = { ...paySettings, extraPayments: [...(paySettings.extraPayments || []), newMethod] };
    try {
      const res = await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (res.ok) { setPaySettings(data.settings); setPayForm(data.settings); setNewMethod({ name: '', number: '', icon: '💰' }); setPayMsg('✅ Method added!'); setTimeout(() => setPayMsg(''), 3000); }
    } catch {}
  };

  const removeExtraMethod = async (index) => {
    const updated = { ...paySettings, extraPayments: paySettings.extraPayments.filter((_, i) => i !== index) };
    try {
      const res = await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (res.ok) { setPaySettings(data.settings); setPayForm(data.settings); }
    } catch {}
  };

  const savePricing = async () => {
    try {
      const res = await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(pricingForm)
      });
      const data = await res.json();
      if (res.ok) {
        setPaySettings(prev => ({ ...prev, ...pricingForm }));
        setPricingMsg('✅ Saved!');
        setTimeout(() => setPricingMsg(''), 3000);
      }
    } catch {}
  };

  const [shippingForms, setShippingForms] = useState({});

  const getShipForm = (order) => ({
    company: shippingForms[order._id]?.company ?? (order.shippingCompany || ''),
    shipId: shippingForms[order._id]?.shipId ?? (order.shippingId || ''),
    message: shippingForms[order._id]?.message ?? (order.shippingMessage || ''),
  });

  const setShipForm = (id, field, val) => setShippingForms(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: val } }));

  const saveShippingInfo = async (order) => {
    const form = getShipForm(order);
    const t = localStorage.getItem('ajwaHub_adminToken');
    try {
      const res = await fetch(`${API}/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ shippingCompany: form.company, shippingId: form.shipId, shippingMessage: form.message })
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(orders.map(o => o._id === order._id ? data.order : o));
        alert('✅ Shipping info saved!');
      } else {
        alert('❌ Failed: ' + data.message);
      }
    } catch (err) { alert('❌ Error: ' + err.message); }
  };
  const updateOrderStatus = async (id, status, trackingStatus) => {
    const t = localStorage.getItem('ajwaHub_adminToken');
    try {
      const res = await fetch(`${API}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ status, trackingStatus })
      });
      const data = await res.json();
      if (res.ok) setOrders(orders.map(o => o._id === id ? data.order : o));
    } catch {}
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Is order ko delete karna chahte hain?')) return;
    try {
      await fetch(`${API}/orders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setOrders(orders.filter(o => o._id !== id));
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_admin');
    localStorage.removeItem('ajwaHub_adminToken');
    navigate('/login');
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.orderId?.toLowerCase().includes(search.toLowerCase()) || o.userEmail?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders.filter(o => o.status === 'Paid').reduce((s, o) => s + (o.total || 0), 0);
  const pending = orders.filter(o => o.status === 'Pending Approval').length;

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
          <h1 className="topbar-title">💳 Payments</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin">👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content">

          {/* STATS */}
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card"><div className="stat-icon">📦</div><div><h2>{orders.length}</h2><p>Total Orders</p></div></div>
            <div className="stat-card"><div className="stat-icon">⏳</div><div><h2>{pending}</h2><p>Pending Approval</p></div></div>
            <div className="stat-card green"><div className="stat-icon">💰</div><div><h2>PKR {totalRevenue.toLocaleString()}</h2><p>Total Revenue</p></div></div>
          </div>

          {/* SETTINGS ROW — 3 cards in one row */}
          <div className="apm-settings-row">

            {/* 1. Payment Accounts */}
            <div className="apm-settings-card">
              <div className="apm-settings-header">
                <h3>💳 Payment Accounts</h3>
                {payMsg && <span className="apm-msg">{payMsg}</span>}
                {!editPay
                  ? <button className="apm-edit-btn" onClick={() => setEditPay(true)}>✏️ Edit</button>
                  : <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="apm-save-btn" onClick={savePaySettings}>💾 Save</button>
                      <button className="apm-cancel-btn" onClick={() => { setEditPay(false); setPayForm(paySettings); }}>✕</button>
                    </div>
                }
              </div>
              {editPay ? (
                <div className="apm-form-grid">
                  {[['easypaisaName', '📱 Easypaisa Name'], ['easypaisaNumber', '📱 Easypaisa Number'], ['jazzcashName', '🎵 JazzCash Name'], ['jazzcashNumber', '🎵 JazzCash Number']].map(([key, label]) => (
                    <div key={key} className="apm-field">
                      <label>{label}</label>
                      <input value={payForm[key] || ''} onChange={e => setPayForm({ ...payForm, [key]: e.target.value })} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="apm-info-grid">
                  <div className="apm-info-chip"><span>📱</span><div><small>Easypaisa</small><strong>{paySettings.easypaisaName} — {paySettings.easypaisaNumber}</strong></div></div>
                  <div className="apm-info-chip"><span>🎵</span><div><small>JazzCash</small><strong>{paySettings.jazzcashName} — {paySettings.jazzcashNumber}</strong></div></div>
                  {(paySettings.extraPayments || []).map((m, i) => (
                    <div key={i} className="apm-info-chip">
                      <span>{m.icon}</span>
                      <div><small>Custom</small><strong>{m.name} — {m.number}</strong></div>
                      <button className="apm-del-btn" style={{ marginLeft: 'auto' }} onClick={() => removeExtraMethod(i)}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Add New Method */}
            <div className="apm-settings-card">
              <div className="apm-settings-header">
                <h3>➕ Add Payment Method</h3>
              </div>
              <div className="apm-form-grid">
                <div className="apm-field">
                  <label>Icon</label>
                  <input value={newMethod.icon} onChange={e => setNewMethod({ ...newMethod, icon: e.target.value })} placeholder="e.g. 🏦" style={{ fontSize: '18px', textAlign: 'center' }} />
                </div>
                <div className="apm-field">
                  <label>Method Name</label>
                  <input value={newMethod.name} onChange={e => setNewMethod({ ...newMethod, name: e.target.value })} placeholder="e.g. Bank Transfer" />
                </div>
                <div className="apm-field" style={{ gridColumn: '1/-1' }}>
                  <label>Account Number / IBAN</label>
                  <input value={newMethod.number} onChange={e => setNewMethod({ ...newMethod, number: e.target.value })} placeholder="e.g. PK36SCBL000001123456702" />
                </div>
              </div>
              <button className="apm-save-btn" style={{ marginTop: '10px', opacity: (!newMethod.name || !newMethod.number) ? 0.4 : 1 }} onClick={addExtraMethod} disabled={!newMethod.name || !newMethod.number}>
                ➕ Add Method
              </button>
            </div>

            {/* 3. Pricing Settings */}
            <div className="apm-settings-card">
              <div className="apm-settings-header">
                <h3>💰 Pricing Settings</h3>
                {pricingMsg && <span className="apm-msg">{pricingMsg}</span>}
              </div>
              <div className="apm-form-grid">
                <div className="apm-field">
                  <label>🚚 Shipping (PKR)</label>
                  <input type="number" min="0" value={pricingForm.shippingCost} onChange={e => setPricingForm(p => ({ ...p, shippingCost: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="apm-field">
                  <label>🧾 Tax Rate (%)</label>
                  <input type="number" min="0" max="100" step="0.1" value={pricingForm.taxRate} onChange={e => setPricingForm(p => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="apm-field">
                  <label>📊 Preview</label>
                  <div className="apm-preview-box">
                    <div><span>Shipping</span><span>PKR {pricingForm.shippingCost}</span></div>
                    <div><span>Tax ({pricingForm.taxRate}%)</span><span>PKR {Math.round(pricingForm.shippingCost * pricingForm.taxRate / 100)}</span></div>
                    <div className="apm-preview-total"><span>Total</span><span>PKR {Math.round(pricingForm.shippingCost + pricingForm.shippingCost * pricingForm.taxRate / 100)}</span></div>
                  </div>
                </div>
              </div>
              <button className="apm-save-btn" style={{ marginTop: '10px' }} onClick={savePricing}>
                💾 Save Pricing
              </button>
            </div>

          </div>

          {/* TOOLBAR */}
          <div className="ap-toolbar" style={{ margin: '20px 0 16px' }}>
            <input className="search-input" placeholder="🔍 Search by Order ID or Email..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="apm-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <span className="ap-count">{filtered.length} Orders</span>
          </div>

          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: '#4b5563' }}>No orders found</div>}

          <div className="apm-list">
            {filtered.map(order => (
              <div key={order._id} className="apm-card">
                <div className="apm-header" onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                  <div className="apm-header-left">
                    <span className="apm-order-id">#{order.orderId}</span>
                    <span className="apm-email">👤 {order.userEmail || 'Guest'}</span>
                    <span className="apm-method">
                      {order.paymentMethod === 'card' ? '💳 Card' : order.paymentMethod === 'easypaisa' ? '📱 Easypaisa' : order.paymentMethod === 'jazzcash' ? '🎵 JazzCash' : order.paymentMethod === 'cash' ? '💵 Cash on Delivery' : order.paymentMethod}
                    </span>
                  </div>
                  <div className="apm-header-right">
                    <span className="apm-total">PKR {order.total?.toLocaleString()}</span>
                    <span className="apm-status" style={{ background: `${statusColors[order.status] || '#6b7280'}22`, color: statusColors[order.status] || '#6b7280', border: `1px solid ${statusColors[order.status] || '#6b7280'}44` }}>
                      {order.status}
                    </span>
                    <span className="apm-arrow">{expanded === order._id ? '▲' : '▼'}</span>
                    <button className="apm-del-btn" onClick={e => { e.stopPropagation(); deleteOrder(order._id); }}>🗑️</button>
                  </div>
                </div>

                {expanded === order._id && (
                  <div className="apm-body">

                    {/* TOP ROW — Items + Shipping + Screenshot */}
                    <div className="apm-details-grid">

                      {/* ITEMS */}
                      <div className="apm-detail-box">
                        <p className="apm-section-title">📦 Items</p>
                        {order.items?.map((item, i) => (
                          <div key={i} className="apm-item">
                            <img src={item.image?.startsWith('/') ? `http://localhost:5173${item.image}` : item.image} alt={item.name} onError={e => e.target.style.display='none'} />
                            <span>{item.name}</span>
                            <span className="apm-item-qty">x{item.quantity}</span>
                            <span className="apm-item-price">PKR {((item.price||0)*(item.quantity||1)).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="apm-order-total">
                          <span>Total</span>
                          <span>PKR {order.total?.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* SHIPPING + SCREENSHOT */}
                      <div className="apm-detail-box">
                        <p className="apm-section-title">📍 Shipping Info</p>
                        <div className="apm-address">
                          <div className="apm-addr-row"><span>👤</span><span>{order.shippingAddress?.fullName}</span></div>
                          <div className="apm-addr-row"><span>📞</span><span>{order.shippingAddress?.phone}</span></div>
                          <div className="apm-addr-row"><span>🏠</span><span>{order.shippingAddress?.address}</span></div>
                          <div className="apm-addr-row"><span>📮</span><span>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</span></div>
                        </div>

                        {order.paymentScreenshot && (
                          <>
                            <p className="apm-section-title" style={{ marginTop: '14px' }}>📸 Payment Screenshot</p>
                            <div className="apm-screenshot">
                              <a href={order.paymentScreenshot} target="_blank" rel="noopener noreferrer">
                                <img src={order.paymentScreenshot} alt="Screenshot" onError={e => e.target.style.display='none'} />
                              </a>
                            </div>
                          </>
                        )}

                        {order.paymentMethod === 'card' && (
                          <>
                            <p className="apm-section-title" style={{ marginTop: '14px' }}>💳 Card Details</p>
                            <div className="apm-address">
                              <div className="apm-addr-row"><span>💳</span><span>{order.cardNumber || 'N/A'}</span></div>
                              <div className="apm-addr-row"><span>👤</span><span>{order.cardHolder || 'N/A'}</span></div>
                              <div className="apm-addr-row"><span>📅</span><span>Expiry: {order.expiryDate || 'N/A'}</span></div>
                            </div>
                            <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', fontSize: '13px', color: '#fbbf24' }}>
                              ⚠️ Verify card payment manually then approve below
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* STATUS BUTTONS */}
                    <div className="apm-actions">
                      <p className="apm-section-title">Update Status & Tracking</p>

                      {/* STEP 1: PAYMENT APPROVAL */}
                      {order.status === 'Pending Approval' && (
                        <div style={{ marginBottom: '16px', padding: '14px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px' }}>
                          <p style={{ fontSize: '13px', fontWeight: '700', color: '#fbbf24', marginBottom: '10px' }}>⏳ Step 1: Verify & Approve Payment</p>
                          <p style={{ fontSize: '12px', color: '#d4cccc', marginBottom: '12px' }}>
                            {order.paymentMethod === 'card' ? '💳 Card payment — verify card details above then approve' : '📸 Check screenshot above then approve'}
                          </p>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                              onClick={() => updateOrderStatus(order._id, 'Approved', 'warehouse')}>
                              ✅ Approve Payment
                            </button>
                            <button
                              style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                              onClick={() => updateOrderStatus(order._id, 'Cancelled', 'warehouse')}>
                              ❌ Reject Payment
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: ORDER FLOW — only after approved */}
                      {order.status !== 'Pending Approval' && (
                        <>
                          <p style={{ fontSize: '12px', color: '#d4cccc', marginBottom: '10px' }}>📦 Step 2: Update Order Progress</p>
                          <div className="apm-status-btns">
                            {[
                              { label: '🏢 Warehouse', status: 'Approved', tracking: 'warehouse' },
                              { label: '🚚 Shipping', status: 'Approved', tracking: 'shipping' },
                              { label: '🏠 Delivered', status: 'Delivered', tracking: 'delivered' },
                              { label: '❌ Cancelled', status: 'Cancelled', tracking: 'warehouse' },
                            ].map(s => (
                              <button key={s.label}
                                className={`apm-status-btn ${order.status === s.status && order.trackingStatus === s.tracking ? 'active' : ''}`}
                                style={{ '--color': statusColors[s.status] || '#6b7280' }}
                                onClick={() => updateOrderStatus(order._id, s.status, s.tracking)}>
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {/* SHIPPING INFO */}
                      <div className="apm-shipping-info">
                        <p className="apm-section-title" style={{ marginTop: '16px' }}>🚚 Shipping Details (optional)</p>
                        <div className="apm-ship-grid">
                          <div className="apm-field">
                            <label>🏢 Courier Company</label>
                            <input
                              value={getShipForm(order).company}
                              onChange={e => setShipForm(order._id, 'company', e.target.value)}
                              placeholder="e.g. TCS, Leopards, M&P"
                            />
                          </div>
                          <div className="apm-field">
                            <label>📋 Tracking / Shipping ID</label>
                            <input
                              value={getShipForm(order).shipId}
                              onChange={e => setShipForm(order._id, 'shipId', e.target.value)}
                              placeholder="e.g. TCS-123456789"
                            />
                          </div>
                          <div className="apm-field" style={{ gridColumn: '1/-1' }}>
                            <label>💬 Message to Customer</label>
                            <input
                              value={getShipForm(order).message}
                              onChange={e => setShipForm(order._id, 'message', e.target.value)}
                              placeholder="e.g. Your order is on the way, expected delivery in 2-3 days"
                            />
                          </div>
                        </div>
                        <button className="apm-save-btn" style={{ marginTop: '10px', padding: '8px 20px' }}
                          onClick={() => saveShippingInfo(order)}>
                          💾 Save Shipping Info
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin_Payment;

