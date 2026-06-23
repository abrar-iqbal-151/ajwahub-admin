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

      <div className="dashboard-main" style={{ background: '#f3f4f6', minHeight: '100vh' }}>
        <header className="topbar" style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <button className="topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? '◀' : '▶'}</button>
          <h1 className="topbar-title">📊 Analytics & Reports</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin">👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content" style={{ padding: '30px' }}>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280', fontSize: '18px' }}>Loading analytics data...</div>
          ) : (
            <>
              {/* Top Summary Widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                {/* Revenue Today */}
                <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Today's Sales</p>
                      <h2 style={{ margin: '10px 0 0', fontSize: '32px', fontWeight: 800 }}>Rs {todayRevenue.toLocaleString()}</h2>
                    </div>
                    <div style={{ fontSize: '40px', opacity: 0.8 }}>💰</div>
                  </div>
                  <div style={{ marginTop: '20px', fontSize: '14px', background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '8px', display: 'inline-block' }}>
                    {todayOrders.length} Orders Today
                  </div>
                </div>

                {/* Revenue Month */}
                <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Sales</p>
                      <h2 style={{ margin: '10px 0 0', fontSize: '32px', fontWeight: 800 }}>Rs {monthRevenue.toLocaleString()}</h2>
                    </div>
                    <div style={{ fontSize: '40px', opacity: 0.8 }}>📈</div>
                  </div>
                  <div style={{ marginTop: '20px', fontSize: '14px', background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '8px', display: 'inline-block' }}>
                    {monthOrders.length} Orders This Month
                  </div>
                </div>

                {/* Users Stats */}
                <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Users</p>
                      <h2 style={{ margin: '10px 0 0', fontSize: '32px', fontWeight: 800 }}>{users.length}</h2>
                    </div>
                    <div style={{ fontSize: '40px', opacity: 0.8 }}>👥</div>
                  </div>
                  <div style={{ marginTop: '20px', fontSize: '14px', background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '8px', display: 'inline-block' }}>
                    +{newUsersMonth} New This Month
                  </div>
                </div>

                {/* Lifetime Value */}
                <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Lifetime Revenue</p>
                      <h2 style={{ margin: '10px 0 0', fontSize: '32px', fontWeight: 800 }}>Rs {totalRevenue.toLocaleString()}</h2>
                    </div>
                    <div style={{ fontSize: '40px', opacity: 0.8 }}>🏆</div>
                  </div>
                  <div style={{ marginTop: '20px', fontSize: '14px', background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '8px', display: 'inline-block' }}>
                    {allOrders.length} Total Orders
                  </div>
                </div>

              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                {/* Recent Orders Table */}
                <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 20px', color: '#111827', fontSize: '20px' }}>Recent Orders</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb', color: '#6b7280', textAlign: 'left', fontSize: '14px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '12px 16px', borderRadius: '8px 0 0 8px' }}>Order ID</th>
                          <th style={{ padding: '12px 16px' }}>Customer</th>
                          <th style={{ padding: '12px 16px' }}>Date</th>
                          <th style={{ padding: '12px 16px' }}>Amount</th>
                          <th style={{ padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map(order => (
                          <tr key={order._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '16px', color: '#111827', fontWeight: 600 }}>#{order.orderId || order._id.slice(-6).toUpperCase()}</td>
                            <td style={{ padding: '16px', color: '#4b5563' }}>{order.userEmail || order.shippingAddress?.fullName || 'Guest'}</td>
                            <td style={{ padding: '16px', color: '#6b7280' }}>{new Date(order.createdAt || order.orderDate).toLocaleDateString()}</td>
                            <td style={{ padding: '16px', color: '#111827', fontWeight: 600 }}>Rs {(order.total || order.totalPrice || order.amount || 0).toLocaleString()}</td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ background: order.status === 'Paid' ? '#d1fae5' : order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7', color: order.status === 'Paid' ? '#059669' : order.status === 'Cancelled' ? '#dc2626' : '#d97706', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {recentOrders.length === 0 && (
                          <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No recent orders</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Stats Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 20px', color: '#111827', fontSize: '20px' }}>Daily Activity</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dbeafe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🛒</div>
                        <span style={{ color: '#4b5563', fontWeight: 500 }}>Orders Today</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: '18px' }}>{todayOrders.length}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ede9fe', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                        <span style={{ color: '#4b5563', fontWeight: 500 }}>New Users Today</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: '18px' }}>{newUsersToday}</span>
                    </div>
                  </div>

                  <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <h3 style={{ margin: '0 0 10px', fontSize: '20px', color: 'white' }}>System Health</h3>
                      <p style={{ margin: '0 0 20px', color: '#94a3b8', fontSize: '14px' }}>All services are running normally</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                        <span style={{ color: '#cbd5e1' }}>Database: Connected</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                        <span style={{ color: '#cbd5e1' }}>Frontend: Online</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                        <span style={{ color: '#cbd5e1' }}>API Server: Active</span>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '120px', opacity: 0.05, zIndex: 1 }}>⚙️</div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Admin_Analytics;
