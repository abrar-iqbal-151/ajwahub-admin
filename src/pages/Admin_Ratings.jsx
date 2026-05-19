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
  { icon: '🌟', label: 'Ratings', path: '/admin-ratings' },
  { icon: '🎁', label: 'Gift Orders', path: '/admin-gift-orders' },
  { icon: '📦', label: 'Gift Boxes', path: '/admin-gift-boxes' },
  { icon: '💳', label: 'Payments', path: '/admin-payments' },
];

function Admin_Ratings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState('product'); // 'product', 'website', 'messages'

  // Data states
  const [ratings, setRatings] = useState([]);
  const [websiteReviews, setWebsiteReviews] = useState([]);
  const [messages, setMessages] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const t = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !t) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    setToken(t);
    fetchAllData(t);
  }, []);

  const fetchAllData = async (authToken) => {
    setLoading(true);
    try {
      // Fetch Product Ratings
      const ratingsRes = await fetch(`${API}/ratings`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const ratingsData = await ratingsRes.json();
      if (ratingsData.success) setRatings(ratingsData.ratings);

      // Fetch Website Reviews
      const reviewsRes = await fetch(`${API}/website-reviews`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const reviewsData = await reviewsRes.json();
      if (reviewsData.success) setWebsiteReviews(reviewsData.reviews);

      // Fetch Messages
      const messagesRes = await fetch(`${API}/messages`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const messagesData = await messagesRes.json();
      if (messagesData.success) setMessages(messagesData.messages);

    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
    setLoading(false);
  };

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const handleDeleteRating = async (id) => {
    if (!window.confirm('Delete this rating?')) return;
    try {
      const res = await fetch(`${API}/ratings/${id}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) {
        setRatings(ratings.filter(r => r._id !== id));
        showMsg('🗑️ Deleted Product Rating');
      }
    } catch { showMsg('❌ Error deleting rating'); }
  };

  const handleDeleteWebsiteReview = async (id) => {
    if (!window.confirm('Delete this website review?')) return;
    try {
      const res = await fetch(`${API}/website-reviews/${id}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) {
        setWebsiteReviews(websiteReviews.filter(r => r._id !== id));
        showMsg('🗑️ Deleted Website Review');
      }
    } catch { showMsg('❌ Error deleting website review'); }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const res = await fetch(`${API}/messages/${id}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) {
        setMessages(messages.filter(m => m._id !== id));
        showMsg('🗑️ Deleted Message');
      }
    } catch { showMsg('❌ Error deleting message'); }
  };

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < count ? '#fbbf24' : '#4b5563', fontSize: '1.2rem' }}>★</span>
    ));
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
          <button className="sidebar-item sidebar-logout" onClick={() => { localStorage.removeItem('ajwaHub_admin'); localStorage.removeItem('ajwaHub_adminToken'); navigate('/login'); }}>
            <span className="sidebar-icon">🚪</span>
            {sidebarOpen && <span className="sidebar-label">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <button className="topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? '◀' : '▶'}</button>
          <h1 className="topbar-title">💌 Feedback, Ratings & Messages</h1>
          <div className="topbar-right">{admin && <span className="topbar-admin">👤 {admin.name}</span>}</div>
        </header>

        <div className="dashboard-content">
          {msg && <div className="ap-msg">{msg}</div>}
 
          {/* Unified Navigation Tabs */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', background: '#ffffff', padding: '6px', borderRadius: '12px', width: 'fit-content', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)' }}>
            <button 
              style={{ background: activeTab === 'product' ? '#dc2626' : 'transparent', color: activeTab === 'product' ? '#fff' : '#4b5563', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
              onClick={() => setActiveTab('product')}
            >
              🌟 Product Ratings ({ratings.length})
            </button>
            <button 
              style={{ background: activeTab === 'website' ? '#dc2626' : 'transparent', color: activeTab === 'website' ? '#fff' : '#4b5563', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
              onClick={() => setActiveTab('website')}
            >
              🌐 Website Feedback ({websiteReviews.length})
            </button>
            <button 
              style={{ background: activeTab === 'messages' ? '#dc2626' : 'transparent', color: activeTab === 'messages' ? '#fff' : '#4b5563', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
              onClick={() => setActiveTab('messages')}
            >
              📩 Contact Messages ({messages.length})
            </button>
          </div>
 
          {/* Stats Section based on active tab */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
            {activeTab === 'product' && (
              <>
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', flex: 1, border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ color: '#4b5563', fontSize: '14px', marginBottom: '5px' }}>Total Ratings</h3>
                  <div style={{ color: '#111827', fontSize: '28px', fontWeight: 'bold' }}>{ratings.length}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', flex: 1, border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ color: '#4b5563', fontSize: '14px', marginBottom: '5px' }}>Average Product Score</h3>
                  <div style={{ color: '#111827', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {ratings.length > 0 
                      ? (ratings.reduce((a, b) => a + b.rating, 0) / ratings.length).toFixed(1) 
                      : '0.0'}
                    <span style={{ color: '#fbbf24', fontSize: '22px' }}>★</span>
                  </div>
                </div>
              </>
            )}
 
            {activeTab === 'website' && (
              <>
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', flex: 1, border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ color: '#4b5563', fontSize: '14px', marginBottom: '5px' }}>Total Website Feedbacks</h3>
                  <div style={{ color: '#111827', fontSize: '28px', fontWeight: 'bold' }}>{websiteReviews.length}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', flex: 1, border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ color: '#4b5563', fontSize: '14px', marginBottom: '5px' }}>Average Shopping Experience</h3>
                  <div style={{ color: '#111827', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {websiteReviews.length > 0 
                      ? (websiteReviews.reduce((a, b) => a + b.rating, 0) / websiteReviews.length).toFixed(1) 
                      : '0.0'}
                    <span style={{ color: '#fbbf24', fontSize: '22px' }}>★</span>
                  </div>
                </div>
              </>
            )}
 
            {activeTab === 'messages' && (
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', flex: 1, border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#4b5563', fontSize: '14px', marginBottom: '5px' }}>Total Inquiries Received</h3>
                <div style={{ color: '#111827', fontSize: '28px', fontWeight: 'bold' }}>{messages.length}</div>
              </div>
            )}
          </div>
 
          {/* Unified Container */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            {activeTab === 'product' && (
              <>
                <h2 style={{ color: '#111827', marginBottom: '20px', fontSize: '18px' }}>🌟 Recent Product Ratings</h2>
                {loading ? (
                  <div className="panel-loading">Loading...</div>
                ) : ratings.length === 0 ? (
                  <div style={{ color: '#4b5563', textAlign: 'center', padding: '40px 0' }}>No product ratings found yet.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#111827' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)', textAlign: 'left' }}>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Date</th>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Product</th>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Rating</th>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Review Text</th>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ratings.map(rating => (
                          <tr key={rating._id} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                            <td style={{ padding: '16px 12px', color: '#4b5563' }}>
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '16px 12px', fontWeight: '600', color: '#111827' }}>
                              {rating.productName || rating.productId || 'General'}
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {renderStars(rating.rating)}
                              </div>
                            </td>
                            <td style={{ padding: '16px 12px', maxWidth: '250px' }}>
                              {rating.reviewText ? (
                                <span style={{ color: '#374151' }}>{rating.reviewText}</span>
                              ) : (
                                <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No written review</span>
                              )}
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <button 
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onClick={() => handleDeleteRating(rating._id)}
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
 
            {activeTab === 'website' && (
              <>
                <h2 style={{ color: '#111827', marginBottom: '20px', fontSize: '18px' }}>🌐 Recent Website Feedback</h2>
                {loading ? (
                  <div className="panel-loading">Loading...</div>
                ) : websiteReviews.length === 0 ? (
                  <div style={{ color: '#4b5563', textAlign: 'center', padding: '40px 0' }}>No website feedbacks found yet.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#111827' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)', textAlign: 'left' }}>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Date</th>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Experience Rating</th>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Suggestions & Feedback</th>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {websiteReviews.map(review => (
                          <tr key={review._id} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                            <td style={{ padding: '16px 12px', color: '#4b5563' }}>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {renderStars(review.rating)}
                              </div>
                            </td>
                            <td style={{ padding: '16px 12px', maxWidth: '350px' }}>
                              <span style={{ color: '#374151' }}>{review.reviewText}</span>
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <button 
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onClick={() => handleDeleteWebsiteReview(review._id)}
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
 
            {activeTab === 'messages' && (
              <>
                <h2 style={{ color: '#111827', marginBottom: '20px', fontSize: '18px' }}>📩 Contact Messages & Inquiries</h2>
                {loading ? (
                  <div className="panel-loading">Loading...</div>
                ) : messages.length === 0 ? (
                  <div style={{ color: '#4b5563', textAlign: 'center', padding: '40px 0' }}>No contact messages found yet.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#111827' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)', textAlign: 'left' }}>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Date</th>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Customer Details</th>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Subject</th>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Message</th>
                          <th style={{ padding: '12px', color: '#4b5563', fontWeight: '500' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {messages.map(msg => (
                          <tr key={msg._id} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                            <td style={{ padding: '16px 12px', color: '#4b5563', verticalAlign: 'top' }}>
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '16px 12px', verticalAlign: 'top' }}>
                              <div style={{ fontWeight: '600', color: '#111827' }}>{msg.name}</div>
                              <div style={{ fontSize: '12px', color: '#4b5563' }}>{msg.email}</div>
                            </td>
                            <td style={{ padding: '16px 12px', fontWeight: '600', color: '#c5a059', verticalAlign: 'top' }}>
                              {msg.subject}
                            </td>
                            <td style={{ padding: '16px 12px', maxWidth: '300px', color: '#374151', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>
                              {msg.message}
                            </td>
                            <td style={{ padding: '16px 12px', verticalAlign: 'top' }}>
                              <button 
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onClick={() => handleDeleteMessage(msg._id)}
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin_Ratings;
