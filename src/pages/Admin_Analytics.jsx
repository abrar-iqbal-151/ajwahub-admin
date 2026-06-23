import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/AdminPanel.css';

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

function Admin_Analytics() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [giftOrders, setGiftOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const token = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !token) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));

    Promise.all([
      fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/gift-orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ]).then(([uData, oData, goData]) => {
      setUsers(uData.users || []);
      setOrders(oData.orders || []);
      setGiftOrders(goData.orders || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_admin');
    localStorage.removeItem('ajwaHub_adminToken');
    navigate('/login');
  };

  const allOrders = [...orders, ...giftOrders];
  
  const now = new Date();
  
  // Sales Calculation
  const isToday = (dateString) => {
    const d = new Date(dateString);
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };
  
  const isThisMonth = (dateString) => {
    const d = new Date(dateString);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const todayOrders = allOrders.filter(o => isToday(o.createdAt || o.orderDate));
  const monthOrders = allOrders.filter(o => isThisMonth(o.createdAt || o.orderDate));

  // Only count revenue for completed or approved orders (exclude Cancelled and Pending Approval)
  const isValidRevenue = (o) => o.status === 'Paid' || o.status === 'Approved' || o.status === 'Delivered';

  const todayRevenue = todayOrders.filter(isValidRevenue).reduce((sum, o) => sum + (o.total || o.totalPrice || o.amount || 0), 0);
  const monthRevenue = monthOrders.filter(isValidRevenue).reduce((sum, o) => sum + (o.total || o.totalPrice || o.amount || 0), 0);
  const totalRevenue = allOrders.filter(isValidRevenue).reduce((sum, o) => sum + (o.total || o.totalPrice || o.amount || 0), 0);

  // Users Calculation
  const newUsersToday = users.filter(u => isToday(u.createdAt)).length;
  const newUsersMonth = users.filter(u => isThisMonth(u.createdAt)).length;

  // Recent Orders
  const recentOrders = [...allOrders].sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate)).slice(0, 5);

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
          <button className="topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: '#c5a059' }}>{sidebarOpen ? '◀' : '▶'}</button>
          <h1 className="topbar-title" style={{ color: '#c5a059', letterSpacing: '1px' }}>📊 Analytics & Reports</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin" style={{ color: '#4b5563' }}>👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content" style={{ padding: '30px' }}>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#c5a059', fontSize: '18px', letterSpacing: '2px' }}>LOADING DATA...</div>
          ) : (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              {/* Top Summary Widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                {/* Revenue Today */}
                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '25px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: '#c5a059', filter: 'blur(80px)', opacity: 0.05 }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Today's Sales</p>
                      <h2 style={{ margin: '12px 0 0', fontSize: '32px', fontWeight: 600, color: '#111827', fontFamily: 'serif' }}>Rs {todayRevenue.toLocaleString()}</h2>
                    </div>
                    <div style={{ width: '45px', height: '45px', background: 'rgba(197, 160, 89, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💰</div>
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#059669', background: '#d1fae5', padding: '4px 8px', borderRadius: '6px' }}>{todayOrders.length} Orders</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Today</span>
                  </div>
                </div>

                {/* Revenue Month */}
                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '25px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: '#c5a059', filter: 'blur(80px)', opacity: 0.05 }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Monthly Sales</p>
                      <h2 style={{ margin: '12px 0 0', fontSize: '32px', fontWeight: 600, color: '#111827', fontFamily: 'serif' }}>Rs {monthRevenue.toLocaleString()}</h2>
                    </div>
                    <div style={{ width: '45px', height: '45px', background: 'rgba(197, 160, 89, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📈</div>
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#059669', background: '#d1fae5', padding: '4px 8px', borderRadius: '6px' }}>{monthOrders.length} Orders</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>This Month</span>
                  </div>
                </div>

                {/* Users Stats */}
                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '25px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: '#3b82f6', filter: 'blur(80px)', opacity: 0.05 }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Total Users</p>
                      <h2 style={{ margin: '12px 0 0', fontSize: '32px', fontWeight: 600, color: '#111827', fontFamily: 'serif' }}>{users.length}</h2>
                    </div>
                    <div style={{ width: '45px', height: '45px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👥</div>
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#1d4ed8', background: '#dbeafe', padding: '4px 8px', borderRadius: '6px' }}>+{newUsersMonth} New</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>This Month</span>
                  </div>
                </div>

                {/* Lifetime Value */}
                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '25px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: '#c5a059', filter: 'blur(80px)', opacity: 0.05 }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Lifetime Revenue</p>
                      <h2 style={{ margin: '12px 0 0', fontSize: '32px', fontWeight: 600, color: '#111827', fontFamily: 'serif' }}>Rs {totalRevenue.toLocaleString()}</h2>
                    </div>
                    <div style={{ width: '45px', height: '45px', background: 'rgba(197, 160, 89, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏆</div>
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#b45309', background: '#fef3c7', padding: '4px 8px', borderRadius: '6px' }}>{allOrders.length} Total</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Orders</span>
                  </div>
                </div>

              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                  {/* Daily Activity (Redesigned) */}
                  <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '25px', borderRadius: '16px' }}>
                    <h3 style={{ margin: '0 0 25px', color: '#111827', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Activity</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(197, 160, 89, 0.1)', color: '#c5a059', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🛒</div>
                          <div>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>Orders Today</p>
                            <h3 style={{ margin: '5px 0 0', color: '#111827', fontSize: '20px' }}>{todayOrders.length}</h3>
                          </div>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>↗</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
                          <div>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>New Users Today</p>
                            <h3 style={{ margin: '5px 0 0', color: '#111827', fontSize: '20px' }}>{newUsersToday}</h3>
                          </div>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>↗</div>
                      </div>
                    </div>
                  </div>

                  {/* Empty Spacer or another widget could go here, but since Health is removed, we'll let grid handle it */}
                </div>

                {/* Recent Orders Table */}
                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '30px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h3 style={{ margin: 0, color: '#111827', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Orders</h3>
                    <button onClick={() => navigate('/admin-payments')} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>View All</button>
                  </div>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '15px 10px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Order ID</th>
                          <th style={{ padding: '15px 10px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Customer</th>
                          <th style={{ padding: '15px 10px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Date</th>
                          <th style={{ padding: '15px 10px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Amount</th>
                          <th style={{ padding: '15px 10px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map(order => (
                          <tr key={order._id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.3s' }} onMouseEnter={e => e.currentTarget.style.background='#f9fafb'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                            <td style={{ padding: '16px 10px', color: '#111827', fontSize: '14px', fontWeight: 500 }}>#{order.orderId || order._id.slice(-6).toUpperCase()}</td>
                            <td style={{ padding: '16px 10px', color: '#4b5563', fontSize: '14px' }}>{order.userEmail || order.shippingAddress?.fullName || 'Guest'}</td>
                            <td style={{ padding: '16px 10px', color: '#6b7280', fontSize: '14px' }}>{new Date(order.createdAt || order.orderDate).toLocaleDateString()}</td>
                            <td style={{ padding: '16px 10px', color: '#111827', fontSize: '14px', fontFamily: 'serif', fontWeight: 600 }}>Rs {(order.total || order.totalPrice || order.amount || 0).toLocaleString()}</td>
                            <td style={{ padding: '16px 10px' }}>
                              <span style={{ 
                                background: order.status === 'Paid' || order.status === 'Approved' ? '#d1fae5' : order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7', 
                                color: order.status === 'Paid' || order.status === 'Approved' ? '#059669' : order.status === 'Cancelled' ? '#dc2626' : '#d97706', 
                                padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 
                              }}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {recentOrders.length === 0 && (
                          <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>No recent orders found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Admin_Analytics;
