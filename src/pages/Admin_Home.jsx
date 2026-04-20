import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/AdminPanel.css';
import '../css/Admin_Home.css';

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

function Admin_Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState('sections');
  const [editSection, setEditSection] = useState(null);
  const [editBanner, setEditBanner] = useState(false);
  const [bannerData, setBannerData] = useState({ discountTitle: '', discountText: '', stats: [] });
  const [sliderImages, setSliderImages] = useState([]);

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const t = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !t) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    setToken(t);
    fetchContent(t);
  }, []);

  const fetchContent = async (t) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/home-content`);
      const data = await res.json();
      setContent(data.content);
      setSliderImages(data.content.sliderImages || []);
      setBannerData({
        discountTitle: data.content.discountTitle || '',
        discountText: data.content.discountText || '',
        stats: data.content.stats || []
      });
    } catch {}
    setLoading(false);
  };

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const initializeData = async () => {
    const res = await fetch(`${API}/home-content/initialize`, { method: 'POST', headers: authHeaders });
    const data = await res.json();
    showMsg(data.message === 'already exists' ? '⚠️ Already initialized!' : '✅ Data initialized!');
    fetchContent(token);
  };

  const saveSection = async (section) => {
    const res = await fetch(`${API}/home-content/section/${section.key}`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ title: section.title, items: section.items })
    });
    if (res.ok) { showMsg('✅ Section updated!'); setEditSection(null); fetchContent(token); }
    else showMsg('❌ Failed to update');
  };

  const saveSlider = async () => {
    const res = await fetch(`${API}/home-content`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ ...content, sliderImages })
    });
    if (res.ok) { showMsg('✅ Slider updated!'); fetchContent(token); }
    else showMsg('❌ Failed to update');
  };

  const saveBanner = async () => {
    const res = await fetch(`${API}/home-content/banner`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify(bannerData)
    });
    if (res.ok) { showMsg('✅ Banner updated!'); setEditBanner(false); fetchContent(token); }
    else showMsg('❌ Failed to update');
  };

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_admin');
    localStorage.removeItem('ajwaHub_adminToken');
    navigate('/login');
  };

  const updateItem = (sectionIdx, itemIdx, field, value) => {
    const updated = JSON.parse(JSON.stringify(editSection));
    updated.items[itemIdx][field] = value;
    setEditSection(updated);
  };

  const uploadFile = async (file, callback) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) callback(data.path);
      else showMsg('❌ Upload failed');
    } catch { showMsg('❌ Upload error'); }
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
          <h1 className="topbar-title">🏡 Home Editor</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin">👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content">
          {msg && <div className="ah-msg">{msg}</div>}

          {!content && !loading && (
            <div className="ah-init-box">
              <p>Home content database mein nahi hai. Initialize karo.</p>
              <button className="ah-btn-primary" onClick={initializeData}>🚀 Initialize Home Data</button>
            </div>
          )}

          {loading && <div className="panel-loading">Loading...</div>}

          {content && !loading && (
            <>
              <div className="ah-tabs">
                <button className={`ah-tab ${activeTab === 'sections' ? 'active' : ''}`} onClick={() => setActiveTab('sections')}>📦 Sections</button>
                <button className={`ah-tab ${activeTab === 'slider' ? 'active' : ''}`} onClick={() => setActiveTab('slider')}>🖼️ Slider Images</button>
                <button className={`ah-tab ${activeTab === 'banner' ? 'active' : ''}`} onClick={() => setActiveTab('banner')}>🎉 Banner & Stats</button>
              </div>

              {/* SECTIONS TAB */}
              {activeTab === 'sections' && (
                <div className="ah-sections">
                  {content.sections?.map((section, si) => (
                    <div key={section.key} className="ah-section-card">
                      {editSection?.key === section.key ? (
                        <div className="ah-edit-box">
                          <div className="ah-edit-header">
                            <input className="ah-title-input" value={editSection.title} onChange={e => setEditSection({ ...editSection, title: e.target.value })} placeholder="Section Title" />
                          </div>
                          <div className="ah-items-grid">
                            {editSection.items.map((item, ii) => (
                              <div key={ii} className="ah-item-edit">
                                <input placeholder="Name" value={item.name} onChange={e => updateItem(si, ii, 'name', e.target.value)} />
                                {item.video !== undefined ? (
                                  <>
                                    <input placeholder="Video path" value={item.video} onChange={e => updateItem(si, ii, 'video', e.target.value)} />
                                    <label className="ah-upload-label">
                                      📤 Upload Video
                                      <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadFile(e.target.files[0], path => updateItem(si, ii, 'video', path))} />
                                    </label>
                                    {item.video && <video src={`http://localhost:5173${item.video}`} className="ah-item-preview" controls />}
                                  </>
                                ) : (
                                  <>
                                    <input placeholder="Image path" value={item.image} onChange={e => updateItem(si, ii, 'image', e.target.value)} />
                                    <label className="ah-upload-label">
                                      📤 Upload Image
                                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadFile(e.target.files[0], path => updateItem(si, ii, 'image', path))} />
                                    </label>
                                    {item.image && <img src={`http://localhost:5173${item.image}`} alt={item.name} className="ah-item-preview" onError={e => e.target.style.display = 'none'} />}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="ah-form-btns">
                            <button className="ah-btn-primary" onClick={() => saveSection(editSection)}>💾 Save</button>
                            <button className="ah-btn-cancel" onClick={() => setEditSection(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="ah-section-view">
                          <div className="ah-section-header">
                            <h3>{section.title}</h3>
                            <button className="ah-btn-edit" onClick={() => setEditSection(JSON.parse(JSON.stringify(section)))}>✏️ Edit</button>
                          </div>
                          <div className="ah-items-preview">
                            {section.items.map((item, ii) => (
                              <div key={ii} className="ah-item-chip">
                                {item.image && <img src={`http://localhost:5173${item.image}`} alt={item.name} onError={e => e.target.style.display = 'none'} />}
                                {item.video && <span className="ah-video-icon">🎬</span>}
                                <span>{item.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* SLIDER TAB */}
              {activeTab === 'slider' && (
                <div className="ah-section-card">
                  <div className="ah-section-header">
                    <h3>🖼️ Slider Images (3 images)</h3>
                  </div>
                  <div className="ah-slider-grid">
                    {sliderImages.map((img, i) => (
                      <div key={i} className="ah-slider-item">
                        <p className="ah-slider-label">Image {i + 1}</p>
                        {img && <img src={`http://localhost:5173${img}`} alt={`Slide ${i + 1}`} className="ah-slider-preview" onError={e => e.target.style.display = 'none'} />}
                        <input
                          placeholder="Image path"
                          value={img}
                          onChange={e => { const s = [...sliderImages]; s[i] = e.target.value; setSliderImages(s); }}
                        />
                        <label className="ah-upload-label">
                          📤 Upload Image
                          <input type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => e.target.files[0] && uploadFile(e.target.files[0], path => {
                              const s = [...sliderImages]; s[i] = path; setSliderImages(s);
                            })}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="ah-form-btns" style={{ marginTop: '16px' }}>
                    <button className="ah-btn-primary" onClick={saveSlider}>💾 Save Slider</button>
                  </div>
                </div>
              )}

              {/* BANNER TAB */}
              {activeTab === 'banner' && (
                <div className="ah-banner-section">
                  <div className="ah-section-card">
                    <div className="ah-section-header">
                      <h3>🎉 Discount Banner</h3>
                      {!editBanner && <button className="ah-btn-edit" onClick={() => setEditBanner(true)}>✏️ Edit</button>}
                    </div>
                    {editBanner ? (
                      <div className="ah-edit-box">
                        <label>Title</label>
                        <input value={bannerData.discountTitle} onChange={e => setBannerData({ ...bannerData, discountTitle: e.target.value })} />
                        <label>Text</label>
                        <input value={bannerData.discountText} onChange={e => setBannerData({ ...bannerData, discountText: e.target.value })} />
                        <label>Stats</label>
                        {bannerData.stats.map((stat, i) => (
                          <div key={i} className="ah-stat-row">
                            <input placeholder="Number e.g. 50K+" value={stat.number} onChange={e => { const s = [...bannerData.stats]; s[i].number = e.target.value; setBannerData({ ...bannerData, stats: s }); }} />
                            <input placeholder="Label e.g. Happy Customers" value={stat.label} onChange={e => { const s = [...bannerData.stats]; s[i].label = e.target.value; setBannerData({ ...bannerData, stats: s }); }} />
                          </div>
                        ))}
                        <div className="ah-form-btns">
                          <button className="ah-btn-primary" onClick={saveBanner}>💾 Save</button>
                          <button className="ah-btn-cancel" onClick={() => setEditBanner(false)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="ah-banner-preview">
                        <p className="ah-banner-title">{content.discountTitle}</p>
                        <p className="ah-banner-text">{content.discountText}</p>
                        <div className="ah-stats-preview">
                          {content.stats?.map((s, i) => (
                            <div key={i} className="ah-stat-chip"><strong>{s.number}</strong><span>{s.label}</span></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin_Home;

